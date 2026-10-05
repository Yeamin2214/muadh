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
