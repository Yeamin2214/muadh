-- Mu'adh: all database updates after 03, in one file.
-- Safe to run even if you already ran some of these parts before.
-- Do NOT re-run 03_cohere_embeddings.sql (it would clear the embeddings).

-- ===== 04_conversations.sql =====
-- Mu'adh: chat sessions for the Ask page (like separate chats in ChatGPT or Claude).
-- Run once in the Supabase SQL Editor, after 03.

create table if not exists conversations (
  id            uuid primary key default gen_random_uuid(),
  learner_id    uuid not null references profiles(id) on delete cascade,
  title         text not null default 'New chat',
  last_read_at  timestamptz not null default now(),   -- for "new mentor reply" badges
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists conversations_learner_idx on conversations (learner_id, updated_at desc);
alter table conversations enable row level security;
drop policy if exists "own conversations read" on conversations;
create policy "own conversations read" on conversations for select using (auth.uid() = learner_id);

alter table questions add column if not exists conversation_id uuid references conversations(id) on delete cascade;
create index if not exists questions_conversation_idx on questions (conversation_id, created_at);

-- Questions asked before sessions existed go into one "Earlier questions" chat per learner.
insert into conversations (learner_id, title, created_at, updated_at, last_read_at)
select learner_id, 'Earlier questions', min(created_at), max(created_at), now()
from questions where conversation_id is null group by learner_id;

update questions q set conversation_id = c.id
from conversations c
where q.conversation_id is null and c.learner_id = q.learner_id and c.title = 'Earlier questions';

-- ===== 05_mentor_applications.sql =====
-- Mu'adh: mentor applications with admin verification.
-- Run once in the Supabase SQL Editor, after 04.

-- 1. New role "applicant": signed up as a mentor, not yet verified.
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('learner', 'applicant', 'mentor', 'admin'));

-- 2. Sign-up creates a learner, or an applicant if they applied as a mentor.
--    Nobody can ever sign up directly as a mentor or admin.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, gender, language, role, reads_arabic)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(new.raw_user_meta_data->>'gender', ''),
    coalesce(nullif(new.raw_user_meta_data->>'language', ''), 'en'),
    case when new.raw_user_meta_data->>'account' = 'mentor' then 'applicant' else 'learner' end,
    case when new.raw_user_meta_data->>'account' = 'mentor' then 2 else null end
  );
  return new;
end $$;

-- 3. The application details an admin reviews.
create table if not exists mentor_applications (
  user_id      uuid primary key references profiles(id) on delete cascade,
  details      jsonb not null,
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note         text,                       -- reason, if rejected
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);
alter table mentor_applications enable row level security;
drop policy if exists "own application read" on mentor_applications;
create policy "own application read" on mentor_applications for select using (auth.uid() = user_id);

-- 4. Approve or reject by email. Only an admin can run these (from the SQL Editor now, the admin panel later).
create or replace function approve_mentor(mentor_email text) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  select id into uid from auth.users where email = lower(mentor_email);
  if uid is null then return 'No account with that email'; end if;
  update profiles set role = 'mentor' where id = uid and role = 'applicant';
  update mentor_applications set status = 'approved', reviewed_at = now(), note = null where user_id = uid;
  return 'Approved';
end $$;

create or replace function reject_mentor(mentor_email text, reason text default null) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  select id into uid from auth.users where email = lower(mentor_email);
  if uid is null then return 'No account with that email'; end if;
  update mentor_applications set status = 'rejected', reviewed_at = now(), note = reason where user_id = uid;
  return 'Rejected';
end $$;

revoke execute on function approve_mentor(text) from public, anon, authenticated;
revoke execute on function reject_mentor(text, text) from public, anon, authenticated;

-- How to use (SQL Editor):
--   select approve_mentor('mentor@example.com');
--   select reject_mentor('mentor@example.com', 'Please add your organisation details');

-- ===== 06_admin.sql =====
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

-- ===== 07_eval_runs.sql =====
-- Mu'adh: evaluation runs, shown in the admin panel and (summary only) on the landing page.
-- Run once in the Supabase SQL Editor, after 06.
create table if not exists eval_runs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  summary     jsonb not null,   -- headline measures
  rows        jsonb not null    -- one entry per test case
);
alter table eval_runs enable row level security;  -- server access only

-- ===== 08_ratings.sql =====
-- Mu'adh: tester ratings and answer feedback. Safe to run more than once.
create table if not exists app_ratings (
  id          bigserial primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        text not null,
  demo        boolean not null default false,   -- given from a shared demo account
  overall     smallint not null check (overall between 1 and 5),
  ease        smallint check (ease between 1 and 5),
  trust       smallint check (trust between 1 and 5),
  useful      smallint check (useful between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);
create index if not exists app_ratings_user_idx on app_ratings (user_id);
alter table app_ratings enable row level security;  -- server access only

-- 👍 / 👎 on each AI answer
alter table questions add column if not exists feedback smallint check (feedback in (-1, 1));
