"""Load approved sources into Supabase. Usage: python ingest.py [translations LANG | quran | hadith | embed]"""
import os, sys, time, re, requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SECRET_KEY"])
QE = "https://quranenc.com/api/v1"
HE = "https://hadeethenc.com/api/v1"

def get(url, **params):
    for attempt in range(4):
        r = requests.get(url, params=params, timeout=30)
        if r.ok: return r.json()
        time.sleep(2 * (attempt + 1))
    r.raise_for_status()

def upsert(table, rows):
    for i in range(0, len(rows), 200):
        sb.table(table).upsert(rows[i:i+200]).execute()

def translations(lang):
    for t in get(f"{QE}/translations/list/{lang}")["translations"]:
        print(t.get("key"), "|", t.get("title"), "|", t.get("version"))

def quran():
    en, bn = os.environ["QURANENC_EN"], os.environ["QURANENC_BN"]
    upsert("sources", [{"id": "quranenc", "name": "QuranEnc.com (King Fahd Complex translations)",
            "url": "https://quranenc.com", "license": "Republish with credit, no inappropriate ads, keep updated",
            "version": f"{en}; {bn}"}])
    rows = []
    for s in range(1, 115):
        a = {v["aya"]: v for v in get(f"{QE}/translation/sura/{en}/{s}")["result"]}
        b = {v["aya"]: v for v in get(f"{QE}/translation/sura/{bn}/{s}")["result"]}
        for aya, v in a.items():
            rows.append({"id": f"quran:{s}:{aya}", "kind": "quran", "arabic": v.get("arabic_text"),
                         "translations": {"en": v.get("translation"), "bn": b.get(aya, {}).get("translation")},
                         "reference": f"Quran {s}:{aya}", "source_id": "quranenc", "version": f"{en}; {bn}"})
        print("surah", s, "done")
    upsert("passages", rows); print(len(rows), "verses loaded")

def hadith():
    """Loads HadeethEnc entries whose source mentions Bukhari or Muslim, in English and Bengali."""
    upsert("sources", [{"id": "hadeethenc", "name": "HadeethEnc.com", "url": "https://hadeethenc.com",
            "license": "Republish without modification, with credit and version number"}])
    cats = get(f"{HE}/categories/list/", language="en")
    seen, rows = set(), []
    for c in cats:
        page = 1
        while True:
            res = get(f"{HE}/hadeeths/list/", language="en", category_id=c["id"], page=page, per_page=100)
            for h in res.get("data", []):
                if h["id"] in seen: continue
                seen.add(h["id"])
                en = get(f"{HE}/hadeeths/one/", language="en", id=h["id"])
                attribution = en.get("attribution") or ""
                if not re.search(r"Bukhari|Muslim", attribution, re.I): continue
                try: bn = get(f"{HE}/hadeeths/one/", language="bn", id=h["id"])
                except Exception: bn = {}
                rows.append({"id": f"hadith:hadeethenc:{h['id']}", "kind": "hadith", "arabic": en.get("hadeeth_ar"),
                             "translations": {"en": en.get("hadeeth"), "bn": bn.get("hadeeth")},
                             "reference": en.get("attribution"), "grade": en.get("grade"),
                             "grade_source": "HadeethEnc; to be checked on Dorar.net",
                             "source_id": "hadeethenc", "version": "HadeethEnc API v1"})
            meta = res.get("meta", {})
            if int(meta.get("current_page", page)) >= int(meta.get("last_page", page)): break
            page += 1
        print("category", c["id"], "->", len(rows), "hadith so far")
    upsert("passages", rows); print(len(rows), "hadith loaded")

def embed():
    key = os.environ["GEMINI_API_KEY"]
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key={key}"
    while True:
        rows = sb.table("passages").select("id,translations,arabic").is_("embedding", "null").limit(50).execute().data
        if not rows: break
        texts = [((r["translations"] or {}).get("en") or r.get("arabic") or "")[:2000] for r in rows]
        body = {"requests": [{"model": "models/gemini-embedding-001", "content": {"parts": [{"text": t}]},
                              "outputDimensionality": 768} for t in texts]}
        r = requests.post(url, json=body, timeout=60)
        if r.status_code == 429: time.sleep(30); continue
        r.raise_for_status()
        for row, e in zip(rows, r.json()["embeddings"]):
            sb.table("passages").update({"embedding": e["values"]}).eq("id", row["id"]).execute()
        print("embedded", len(rows)); time.sleep(1)

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "translations": translations(sys.argv[2])
    elif cmd in ("quran", "hadith", "embed"): globals()[cmd]()
    else: print(__doc__)
