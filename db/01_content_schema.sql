-- Mu'adh: content tables (part of the declared starting version, created 3 October 2026)
-- These hold only approved religious content. Learner and mentor tables are created on Day 1.

create extension if not exists vector;

-- 1. Where every piece of content comes from
create table if not exists sources (
  id          text primary key,            -- e.g. 'quranenc-en-kfc', 'hadeethenc', 'dorar'
  name        text not null,
  url         text not null,
  license     text not null,               -- license or terms, as recorded in RESOURCES.md
  version     text,
  fetched_at  timestamptz default now()
);

-- 2. Every approved text unit: Quran verses, hadith, lesson text, approved answers
create table if not exists passages (
  id            text primary key,          -- e.g. 'quran:2:255', 'hadith:bukhari:1395'
  kind          text not null check (kind in ('quran','hadith','lesson','approved_answer','bayyinat')),
  arabic        text,
  translations  jsonb not null default '{}'::jsonb,   -- {"en": "...", "bn": "..."}
  reference     text,                      -- human-readable reference shown to the learner
  grade         text,                      -- hadith grade from Dorar.net, null for Quran
  grade_source  text,                      -- the scholar Dorar attributes the grade to
  source_id     text references sources(id),
  version       text,
  embedding     vector(768),
  fts           tsvector generated always as (
                  to_tsvector('simple',
                    coalesce(arabic,'') || ' ' ||
                    coalesce(translations->>'en','') || ' ' ||
                    coalesce(translations->>'bn',''))
                ) stored,
  created_at    timestamptz default now()
);
create index if not exists passages_fts_idx on passages using gin (fts);
create index if not exists passages_embedding_idx on passages using hnsw (embedding vector_cosine_ops);
create index if not exists passages_kind_idx on passages (kind);

-- 3. The 40 reviewed lesson cards
create table if not exists lessons (
  id           text primary key,           -- 'L01' to 'L40'
  stage        int not null,
  title        jsonb not null,             -- {"en": "...", "bn": "..."}
  body         jsonb not null,
  passage_ids  text[] not null default '{}',
  prereqs      text[] not null default '{}',
  minutes      int,
  level        text,
  reviewed_by  text,
  reviewed_at  date
);

-- 4. Islamic terms from the Al-Jamhara dictionary
create table if not exists glossary (
  id           text primary key,           -- e.g. 'tawhid'
  term_ar      text not null,
  term_en      text not null,
  term_bn      text,
  note         text,
  jamhara_url  text
);

-- Row level security: anyone may READ approved content; only the server (secret key) may WRITE
alter table sources  enable row level security;
alter table passages enable row level security;
alter table lessons  enable row level security;
alter table glossary enable row level security;

create policy "public read sources"  on sources  for select using (true);
create policy "public read passages" on passages for select using (true);
create policy "public read lessons"  on lessons  for select using (true);
create policy "public read glossary" on glossary for select using (true);

-- Vector search helper used by the answer engine
create or replace function match_passages(
  query_embedding vector(768),
  match_count int default 8,
  kinds text[] default null
)
returns table (id text, kind text, similarity float)
language sql stable
as $$
  select p.id, p.kind, 1 - (p.embedding <=> query_embedding) as similarity
  from passages p
  where p.embedding is not null
    and (kinds is null or p.kind = any(kinds))
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
