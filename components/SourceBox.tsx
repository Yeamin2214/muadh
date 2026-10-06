"use client";
import { newAudio } from "@/lib/client/audio";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { useApp } from "./AppProvider";

type Row = { id: string; arabic: string | null; translations: Record<string, string | null>; reference: string | null };

/** "Quran 2:183-185" -> ["quran:2:183","quran:2:184","quran:2:185"] */
export function quranIds(ref: string): string[] {
  const m = ref.match(/(\d+):(\d+)(?:-(\d+))?/);
  if (!m) return [];
  const [s, a, b] = [Number(m[1]), Number(m[2]), Number(m[3] ?? m[2])];
  return Array.from({ length: Math.min(b - a + 1, 12) }, (_, i) => `quran:${s}:${a + i}`);
}

/** A source shown word for word from the approved database, never typed by us or the AI. */
export default function SourceBox({ label }: { label: string }) {
  const { t, lang } = useApp();
  const isQuran = label.startsWith("Quran");
  const [rows, setRows] = useState<Row[] | null>(isQuran ? null : []);
  const [playing, setPlaying] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => audio.current?.pause(), []);

  /** Plays one verse from EveryAyah (Mishary Alafasy), e.g. quran:2:255 -> 002255.mp3 */
  const play = (id: string) => {
    audio.current?.pause();
    if (playing === id) return setPlaying(null);
    const [, s, a] = id.split(":");
    const el = newAudio(`https://everyayah.com/data/Alafasy_128kbps/${s.padStart(3, "0")}${a.padStart(3, "0")}.mp3`);
    el.onended = () => setPlaying(null);
    audio.current = el;
    el.play().then(() => setPlaying(id)).catch(() => setPlaying(null));
  };

  useEffect(() => {
    if (!isQuran) return;
    const ids = quranIds(label);
    browserClient().from("passages").select("id, arabic, translations, reference").in("id", ids)
      .then(({ data }) => setRows(((data as Row[]) ?? []).sort((x, y) => ids.indexOf(x.id) - ids.indexOf(y.id))));
  }, [label, isQuran]);

  return (
    <div className="src" style={{ display: "block" }}>
      <b>{label.replace("Hadith: ", "")}</b>
      {!isQuran && <span className="b2 mid">{t("hadithRef")}</span>}
      {isQuran && rows === null && <span className="b2 mid">{t("loadingSrc")}</span>}
      {isQuran && rows?.length === 0 && <span className="b2 mid">{t("srcMissing")}</span>}
      {rows?.map((r) => (
        <div key={r.id} style={{ marginTop: 10 }}>
          <div className="verse">
            <button className="play sm" onClick={() => play(r.id)} aria-label={`${t("play")} ${r.reference ?? ""}`}>{playing === r.id ? <Pause className="ic" aria-hidden="true" /> : <Play className="ic" aria-hidden="true" />}</button>
            {r.arabic && <p className="ar-text" lang="ar" style={{ fontSize: 22, lineHeight: 2, textAlign: "right", margin: 0, flex: 1 }}>{r.arabic}</p>}
          </div>
          {lang !== "ar" && (r.translations?.[lang] || r.translations?.en) && <p style={{ margin: "4px 0 0", fontFamily: "var(--read)" }}>{r.translations[lang] || r.translations.en}</p>}
        </div>
      ))}
      {isQuran && !!rows?.length && <span className="b2 mid" style={{ display: "block", marginTop: 8 }}>{t("srcCredit")} · {t("reciter")}</span>}
    </div>
  );
}
