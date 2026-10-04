# Mu'adh (معاذ)

An AI follow-up companion for new Muslims, with a human mentor always in the loop.
Team Sabeel, AI Challenge Serving Islamic Content 2026, Track 3.


## Folders
- `docs/` architecture, lesson map, lesson cards
- `content/` glossary and processed lesson data
- `db/` database schema
- `scripts/ingest/` scripts that load approved sources into the database
- `eval/` the 100 synthetic test cases
- `RESOURCES.md` every source, tool and license we use

## Load the approved sources (run on your own computer)
1. Install Python 3.10+, then: `pip install -r scripts/ingest/requirements.txt`
2. Copy `.env.example` to `.env` and fill in your own keys. Never commit `.env`.
3. Run the schema in `db/01_content_schema.sql` in the Supabase SQL Editor.
4. `python scripts/ingest/ingest.py translations en` and `... translations bn` to see Quran translation keys, then set them in `.env`.
5. `python scripts/ingest/ingest.py quran`
6. `python scripts/ingest/ingest.py hadith`
7. `python scripts/ingest/ingest.py embed`
