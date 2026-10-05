"use client";
import { useRef, useState } from "react";
import SourceBox from "@/components/SourceBox";
import { useApp, useProfile } from "@/components/AppProvider";
import { DUA_LIBRARY, QULS } from "@/lib/content/duas";

export default function DuasPage() {
  const profile = useProfile();
  const { t, list, lang } = useApp();
  const [note, setNote] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const play = (id: string) => {
    audio.current?.pause();
    if (playing === id) return setPlaying(null);
    const a = new Audio(`/audio/${id}.m4a`);
    a.onended = () => setPlaying(null);
    a.play().then(() => { setPlaying(id); audio.current = a; }).catch(() => { setNote(t("audioSoon")); setTimeout(() => setNote(""), 2500); });
  };
  const cats = list("dcats");
  const keys = list("duaKeys");

  return (
    <>
      <div className="page" style={{ maxWidth: 1000 }}>
        <div className="lesson-cover" style={{ backgroundImage: "linear-gradient(90deg,rgba(18,18,18,.95),rgba(18,18,18,.3)),url(/images/duas-hands.webp)", minHeight: 170 }}>
          <h1>{t("duasH")}</h1><p className="mid" style={{ margin: "6px 0 0" }}>{t("duasP")}</p>
        </div>
        {keys.map((key, k) => (
          <section key={key} style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 20, color: "var(--gold)" }}>{cats[k]}</h2>
            <div className="duas" style={{ marginTop: 14 }}>
              {DUA_LIBRARY.filter((d) => d.cat === key).map((d) => (
                <article key={d.id} className="card dua">
                  <h3 className="dua-title">{d.title[lang]}</h3>
                  <div className="ar-text" lang="ar">{d.ar}</div>
                  {lang !== "ar" && <><div className="tr">{d.tr}</div><div className="mean">{d.m[lang]}</div></>}
                  <div className="foot"><span>{d.src} · {d.graded === "albani" ? t("gradeAlbani") : t("gradeCollection")}</span>
                    <button className="play" onClick={() => play(d.id)} aria-label={`${t("listen")}: ${d.tr}`}>{playing === d.id ? "❚❚" : "▶"}</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 20, color: "var(--gold)" }}>{cats[4]}</h2>
          {QULS.map((q) => <SourceBox key={q} label={q} />)}
        </section>
        {note && <div className="toast" role="status">{note}</div>}
      </div>
    </>
  );
}
