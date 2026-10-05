-- Mu'adh: admin panel support. Run once in the Supabase SQL Editor, after 05.

-- 1. AI usage log: one row per learner question or mentor action (models, calls, tokens).
create table if not exists ai_events (
  id      bigserial primary key,
  at      timestamptz not null default now(),
  source  text not null,                    -- 'ask' or 'mentor'
  calls   int not null default 0,
  tokens  int not null default 0,
  models  jsonb not null default '{}'       -- tokens per model
);
create index if not exists ai_events_at_idx on ai_events (at desc);
alter table ai_events enable row level security;  -- server access only

-- 2. All dashboard statistics in one query. Only the server (service role) may call it.
create or replace function admin_stats() returns jsonb
language sql stable security definer set search_path = public as $$
select jsonb_build_object(
  'learners',       (select count(*) from profiles where role = 'learner'),
  'learners_week',  (select count(*) from profiles p join auth.users u on u.id = p.id where p.role = 'learner' and u.created_at > now() - interval '7 days'),
  'active_week',    (select count(distinct learner_id) from questions where created_at > now() - interval '7 days'),
  'mentors',        (select count(*) from profiles where role = 'mentor'),
  'applicants',     (select count(*) from mentor_applications where status = 'pending'),
  'questions',      (select count(*) from questions),
  'questions_week', (select count(*) from questions where created_at > now() - interval '7 days'),
  'by_action',   (select coalesce(jsonb_object_agg(action, n), '{}') from (select action, count(*) n from questions group by action) x),
  'by_level',    (select coalesce(jsonb_object_agg(coalesce(level, '?'), n), '{}') from (select level, count(*) n from questions group by level) x),
  'by_language', (select coalesce(jsonb_object_agg(language, n), '{}') from (select language, count(*) n from profiles where role = 'learner' group by language) x),
  'by_gender',   (select coalesce(jsonb_object_agg(coalesce(gender, '?'), n), '{}') from (select gender, count(*) n from profiles where role = 'learner' group by gender) x),
  'tickets', (select jsonb_build_object(
      'new', count(*) filter (where status = 'new'),
      'claimed', count(*) filter (where status = 'claimed'),
      'answered', count(*) filter (where status = 'answered'),
      'urgent_open', count(*) filter (where urgent and status <> 'answered'),
      'open_brothers', count(*) filter (where gender = 'male' and status <> 'answered'),
      'open_sisters', count(*) filter (where gender = 'female' and status <> 'answered'),
      'avg_hours', round((extract(epoch from avg(answered_at - created_at) filter (where status = 'answered')) / 3600.0)::numeric, 1))
    from tickets),
  'lessons_done', (select coalesce(sum(cardinality(lessons_done)), 0) from profiles where role = 'learner'),
  'daily', (select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'answered', coalesce(q.a, 0), 'referred', coalesce(q.r, 0), 'other', coalesce(q.o, 0)) order by d), '[]')
            from generate_series(current_date - 13, current_date, interval '1 day') d
            left join (select created_at::date as day,
                              count(*) filter (where action = 'answer') a,
                              count(*) filter (where action in ('refer', 'crisis')) r,
                              count(*) filter (where action not in ('answer', 'refer', 'crisis')) o
                       from questions where created_at >= current_date - 13 group by 1) q on q.day = d::date),
  'ai', (select jsonb_build_object('calls', coalesce(sum(calls), 0), 'tokens', coalesce(sum(tokens), 0)) from ai_events where at > now() - interval '30 days'),
  'ai_models', (select coalesce(jsonb_object_agg(model, tokens), '{}') from (
                  select key as model, sum(value::bigint) as tokens from ai_events, jsonb_each_text(models)
                  where at > now() - interval '30 days' group by key) x),
  'cached_questions', (select count(*) from embedding_cache)
);
$$;
revoke execute on function admin_stats() from public, anon, authenticated;
grant execute on function admin_stats() to service_role;

-- 3. Make your own account the admin (replace the email), then sign in again:
-- update profiles set role = 'admin', gender = 'male' where id = (select id from auth.users where email = 'you@example.com');
