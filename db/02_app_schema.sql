-- Mu'adh: app tables (learners, mentors, questions, tickets)
-- Run after 01_content_schema.sql in the Supabase SQL Editor.

-- 1. Profiles: one row per account, created automatically at sign-up
create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           text not null default 'learner' check (role in ('learner','mentor','admin')),
  name           text,
  gender         text check (gender in ('male','female')),
  language       text not null default 'en' check (language in ('en','ar','bn')),
  reads_arabic   smallint check (reads_arabic between 0 and 2),   -- 0 not yet, 1 a little, 2 yes
  work_pattern   smallint check (work_pattern between 0 and 2),   -- 0 day, 1 night shifts, 2 changes
  phone          text,
  phone_consent  boolean not null default false,                  -- mentor may call or message
  lessons_done   text[] not null default '{}',
  created_at     timestamptz not null default now()
);

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, gender, language)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(new.raw_user_meta_data->>'gender', ''),
    coalesce(nullif(new.raw_user_meta_data->>'language', ''), 'en')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- 2. Every question a learner asks, with its decision trace
create table if not exists questions (
  id          uuid primary key default gen_random_uuid(),
  learner_id  uuid not null references profiles(id) on delete cascade,
  text        text not null,
  lang        text not null,
  norm        text not null,                 -- normalised text, used for caching
  level       text,
  action      text not null check (action in ('answer','refer','not_found','crisis','other')),
  answer      jsonb,
  trace       jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists questions_cache_idx on questions (norm, lang, action);
create index if not exists questions_learner_idx on questions (learner_id, created_at desc);

-- 3. Referred questions: one shared inbox per gender
create table if not exists tickets (
  id               uuid primary key default gen_random_uuid(),
  question_id      uuid not null references questions(id) on delete cascade,
  learner_id       uuid not null references profiles(id) on delete cascade,
  gender           text not null check (gender in ('male','female')),
  reason           text not null check (reason in ('level_c','level_d','low_confidence','no_source','crisis')),
  urgent           boolean not null default false,
  original         text not null,
  original_lang    text not null,
  question_ar      text not null,
  draft_ar         text,
  preferred_mentor uuid references profiles(id),  -- continuity: last mentor who helped this learner
  status           text not null default 'new' check (status in ('new','claimed','answered')),
  claimed_by       uuid references profiles(id),
  reply_ar         text,
  reply_learner    text,
  answered_at      timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists tickets_inbox_idx on tickets (gender, status, created_at desc);

-- 4. Mentor-approved answers, reusable for similar questions (Level A and B only)
create table if not exists approved_answers (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid references tickets(id) on delete set null,
  lang         text not null,
  question     text not null,
  answer       text not null,
  passage_ids  text[] not null default '{}',
  approved_by  uuid references profiles(id),
  created_at   timestamptz not null default now()
);

-- Row level security. Learners read only their own rows.
-- All writes and all mentor access go through the server, which checks role and gender.
alter table profiles         enable row level security;
alter table questions        enable row level security;
alter table tickets          enable row level security;
alter table approved_answers enable row level security;

drop policy if exists "own profile read"   on profiles;
drop policy if exists "own profile update" on profiles;
drop policy if exists "own questions read" on questions;
drop policy if exists "own tickets read"   on tickets;
create policy "own profile read"   on profiles  for select using (auth.uid() = id);
create policy "own profile update" on profiles  for update using (auth.uid() = id);
create policy "own questions read" on questions for select using (auth.uid() = learner_id);
create policy "own tickets read"   on tickets   for select using (auth.uid() = learner_id);

-- Learners may update their onboarding fields, never their role
revoke update on profiles from authenticated;
grant update (name, gender, language, reads_arabic, work_pattern, phone, phone_consent, lessons_done)
  on profiles to authenticated;

-- To make an account a mentor (run by an admin):
-- update profiles set role = 'mentor', gender = 'female' where id = '<user id>';
