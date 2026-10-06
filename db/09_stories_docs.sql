-- Mu'adh: revert stories (approved by an admin before they are public) and private storage for mentor certificates.
-- Run once in the Supabase SQL Editor. Safe to run again.
create table if not exists stories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  display_name text,                       -- null means anonymous
  title       text not null,
  body        text not null,
  lang        text not null default 'en',
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);
alter table stories enable row level security;  -- server access only

insert into storage.buckets (id, name, public) values ('mentor-docs', 'mentor-docs', false) on conflict (id) do nothing;
