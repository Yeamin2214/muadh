"use client";
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { DUAS } from "@/lib/client/text";
import { dayKey } from "@/lib/client/prayer";
import { useApp } from "./AppProvider";
import { Modal } from "./Shell";

/** Short, encouraging verses for the "verse of the day". Text always comes from the approved database. */
const DAILY_VERSES = [
  "quran:2:186", "quran:2:286", "quran:13:28", "quran:39:53", "quran:94:5", "quran:94:6", "quran:65:3",
  "quran:2:152", "quran:40:60", "quran:29:69", "quran:20:114", "quran:2:153", "quran:3:139", "quran:2:45",
];

type Verse = { arabic: string | null; translations: Record<string, string | null>; reference: string | null };
type Popup = { kind: "sleep" | "wake" | "ayah"; verse?: Verse };

const seen = (key: string) => { try { return localStorage.getItem(key) === dayKey(); } catch { return true; } };
const markSeen = (key: string) => { try { localStorage.setItem(key, dayKey()); } catch { /* ignore */ } };

/** One gentle pop-up at a time: the waking dua after Fajr, the sleep dua after Isha, and the verse of the day. */
export default function DailyPopups({ times }: { times: Date[] }) {
  const { t, lang } = useApp();
  const [queue, setQueue] = useState<Popup[]>([]);

  useEffect(() => {
    if (times.length < 5) return;
    const now = new Date();
    const items: Popup[] = [];
    if (now >= times[4] && !seen("muadh.sleep")) items.push({ kind: "sleep" });
    if (now >= times[0] && now < times[1] && !seen("muadh.wake")) items.push({ kind: "wake" });
    setQueue(items);
    if (!seen("muadh.ayah")) {
      const start = new Date(now.getFullYear(), 0, 0).getTime();
      const id = DAILY_VERSES[Math.floor((now.getTime() - start) / 864e5) % DAILY_VERSES.length];
      browserClient().from("passages").select("arabic, translations, reference").eq("id", id).maybeSingle()
        .then(({ data }) => { if (data) setQueue((q) => [...q, { kind: "ayah", verse: data as Verse }]); });
    }
    // Run once per visit, when today's times are known.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [times.length]);

  const current = queue[0];
  if (!current) return null;
  const close = () => {
    markSeen(`muadh.${current.kind}`);
    setQueue((q) => q.slice(1));
  };

  if (current.kind === "ayah" && current.verse) {
    const v = current.verse;
    const translation = lang === "ar" ? null : v.translations?.[lang] ?? v.translations?.en;
    return (
      <Modal title={t("ayahH")} onClose={close} closeLabel={t("close")}>
        {v.arabic && <p className="ar-text" lang="ar" style={{ fontSize: 26, lineHeight: 2, textAlign: "right", margin: "0 0 10px" }}>{v.arabic}</p>}
        {translation && <p className="ayah">{translation}</p>}
        <span className="ayah"><span className="ref">{v.reference} · {t("ayahSrc")}</span></span>
      </Modal>
    );
  }

  const dua = DUAS[current.kind === "sleep" ? 2 : 3];
  return (
    <Modal title={t(current.kind === "sleep" ? "sleepH" : "wakeH")} onClose={close} closeLabel={t("close")}>
      <p className="ar-text" lang="ar" style={{ fontSize: 26, lineHeight: 2, textAlign: "right", margin: "0 0 8px" }}>{dua.ar}</p>
      {lang !== "ar" && <><p className="mid" style={{ fontStyle: "italic", margin: "0 0 6px" }}>{dua.tr}</p><p className="ayah" style={{ margin: 0 }}>{dua.m[lang]}</p></>}
      <span className="ayah"><span className="ref">{dua.src}</span></span>
    </Modal>
  );
}
