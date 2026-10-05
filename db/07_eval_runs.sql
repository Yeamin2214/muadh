-- Mu'adh: evaluation runs, shown in the admin panel and (summary only) on the landing page.
-- Run once in the Supabase SQL Editor, after 06.
create table if not exists eval_runs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  summary     jsonb not null,   -- headline measures
  rows        jsonb not null    -- one entry per test case
);
alter table eval_runs enable row level security;  -- server access only
