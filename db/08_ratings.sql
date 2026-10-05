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
