-- Mu'adh: switch passage embeddings to Cohere embed-multilingual-v3.0 (1024 dimensions).
-- Run once in the Supabase SQL Editor. It clears the old 768-dimension vectors; re-run the embed step afterwards.

-- 1. Drop any existing vector index on passages.embedding
do $$
declare idx record;
begin
  for idx in select indexname from pg_indexes where tablename = 'passages' and indexdef ilike '%embedding%' loop
    execute format('drop index if exists %I', idx.indexname);
  end loop;
end $$;

-- 2. New vector size (old vectors are cleared)
drop function if exists match_passages;
alter table passages alter column embedding type vector(1024) using null;

-- 3. Similarity search used by the app
create or replace function match_passages(query_embedding vector(1024), match_count int default 12)
returns table (id text, similarity float)
language sql stable as $$
  select p.id, 1 - (p.embedding <=> query_embedding) as similarity
  from passages p
  where p.embedding is not null
  order by p.embedding <=> query_embedding
  limit match_count;
$$;

create index if not exists passages_embedding_hnsw on passages using hnsw (embedding vector_cosine_ops);

-- 4. Cache of question embeddings, so a repeated question never uses another API call
create table if not exists embedding_cache (
  key        text primary key,
  embedding  vector(1024) not null,
  created_at timestamptz not null default now()
);
alter table embedding_cache enable row level security;  -- server access only
