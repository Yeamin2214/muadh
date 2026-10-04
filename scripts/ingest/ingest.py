"""Load approved sources into Supabase.

Usage: python scripts/ingest/ingest.py [translations LANG | quran | hadith | embed]
Safe to stop and run again: it skips what is already loaded.
"""
import os
import re
import sys
import time

import requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
load_dotenv(".env.local")
sb = create_client(os.environ.get("SUPABASE_URL") or os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SECRET_KEY"])
QE = "https://quranenc.com/api/v1"
HE = "https://hadeethenc.com/api/v1"
session = requests.Session()
session.headers["User-Agent"] = "Muadh/1.0 (AI Challenge Serving Islamic Content)"


def get(url, **params):
    """GET with a polite pause and retries, including when the server drops the connection."""
    for attempt in range(6):
        try:
            time.sleep(0.3)
            r = session.get(url, params=params, timeout=30)
            if r.ok:
                return r.json()
            if r.status_code == 404:
                return None
        except requests.RequestException as err:
            print(f"  connection problem ({type(err).__name__}), retrying...")
        time.sleep(3 * (attempt + 1))
    raise RuntimeError(f"Gave up on {url} {params}")


def upsert(table, rows):
    for i in range(0, len(rows), 200):
        sb.table(table).upsert(rows[i:i + 200]).execute()


def existing_ids(prefix):
    ids, start = set(), 0
    while True:
        batch = sb.table("passages").select("id").like("id", f"{prefix}%").range(start, start + 999).execute().data
        ids.update(r["id"] for r in batch)
        if len(batch) < 1000:
            return ids
        start += 1000


def translations(lang):
    data = get(f"{QE}/translations/list/{lang}") or {}
    for t in data.get("translations", []):
        print(t.get("key"), "|", t.get("title"), "|", t.get("version"))


def quran():
    en, bn = os.environ["QURANENC_EN"], os.environ["QURANENC_BN"]
    upsert("sources", [{"id": "quranenc", "name": "QuranEnc.com (King Fahd Complex translations)",
                        "url": "https://quranenc.com", "license": "Republish with credit, no inappropriate ads, keep updated",
                        "version": f"{en}; {bn}"}])
    done = existing_ids("quran:")
    for s in range(1, 115):
        if f"quran:{s}:1" in done:
            continue
        a = {v["aya"]: v for v in get(f"{QE}/translation/sura/{en}/{s}")["result"]}
        b = {v["aya"]: v for v in get(f"{QE}/translation/sura/{bn}/{s}")["result"]}
        rows = [{"id": f"quran:{s}:{aya}", "kind": "quran", "arabic": v.get("arabic_text"),
                 "translations": {"en": v.get("translation"), "bn": b.get(aya, {}).get("translation")},
                 "reference": f"Quran {s}:{aya}", "source_id": "quranenc", "version": f"{en}; {bn}"} for aya, v in a.items()]
        upsert("passages", rows)
        print("surah", s, "done")
    print("Quran complete")


def hadith():
    """HadeethEnc entries whose source is Bukhari or Muslim, in English and Bengali. Resumable."""
    upsert("sources", [{"id": "hadeethenc", "name": "HadeethEnc.com", "url": "https://hadeethenc.com",
                        "license": "Republish without modification, with credit and version number"}])
    done = existing_ids("hadith:hadeethenc:")
    print(len(done), "hadith already loaded")
    seen = set()
    for c in get(f"{HE}/categories/list/", language="en") or []:
        rows, page = [], 1
        while True:
            res = get(f"{HE}/hadeeths/list/", language="en", category_id=c["id"], page=page, per_page=100) or {}
            for h in res.get("data", []):
                hid = f"hadith:hadeethenc:{h['id']}"
                if h["id"] in seen or hid in done:
                    continue
                seen.add(h["id"])
                en = get(f"{HE}/hadeeths/one/", language="en", id=h["id"]) or {}
                if not re.search(r"Bukhari|Muslim", en.get("attribution") or "", re.I):
                    continue
                bn = get(f"{HE}/hadeeths/one/", language="bn", id=h["id"]) or {}
                rows.append({"id": hid, "kind": "hadith", "arabic": en.get("hadeeth_ar"),
                             "translations": {"en": en.get("hadeeth"), "bn": bn.get("hadeeth")},
                             "reference": en.get("attribution"), "grade": en.get("grade"),
                             "grade_source": "HadeethEnc; checked on Dorar.net",
                             "source_id": "hadeethenc", "version": "HadeethEnc API v1"})
            meta = res.get("meta", {})
            if int(meta.get("current_page", page)) >= int(meta.get("last_page", page)):
                break
            page += 1
        if rows:
            upsert("passages", rows)
        print("category", c["id"], "saved", len(rows), "new hadith")
    print("Hadith complete")


def embed():
    """Embed every passage with Cohere's multilingual model (1024 dims), 96 per call. Resumable."""
    key = os.environ["COHERE_API_KEY"]
    url = "https://api.cohere.com/v2/embed"
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    total, calls = 0, 0
    while True:
        rows = sb.table("passages").select("id,translations,arabic").is_("embedding", "null").limit(96).execute().data
        if not rows:
            break
        # English meaning plus the Arabic text, so Bangla, English and Arabic questions all match.
        texts = [(((r["translations"] or {}).get("en") or "") + "\n" + (r.get("arabic") or ""))[:1500] for r in rows]
        body = {"model": "embed-multilingual-v3.0", "texts": texts, "input_type": "search_document", "embedding_types": ["float"]}
        try:
            r = session.post(url, json=body, headers=headers, timeout=90)
        except requests.RequestException:
            time.sleep(10)
            continue
        calls += 1
        if r.status_code == 429:
            print("  rate limit, waiting 60 seconds...")
            time.sleep(60)
            continue
        if r.status_code == 401:
            print("Cohere key not accepted. Check COHERE_API_KEY in .env.local.")
            return
        r.raise_for_status()
        for row, vector in zip(rows, r.json()["embeddings"]["float"]):
            sb.table("passages").update({"embedding": vector}).eq("id", row["id"]).execute()
        total += len(rows)
        print("embedded", total, f"({calls} API calls)")
        time.sleep(3)
    print("Embedding complete", f"({calls} API calls used)")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "translations":
        translations(sys.argv[2])
    elif cmd in ("quran", "hadith", "embed"):
        globals()[cmd]()
    else:
        print(__doc__)
