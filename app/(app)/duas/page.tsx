"use client";
import { newAudio } from "@/lib/client/audio";
import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import SurahText from "@/components/SurahText";
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
    const a = newAudio(`/audio/${id}.m4a`);
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
                    <button className="play" onClick={() => play(d.id)} aria-label={`${t("listen")}: ${d.tr}`}>{playing === d.id ? <Pause className="ic" aria-hidden="true" /> : <Play className="ic" aria-hidden="true" />}</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 20, color: "var(--gold)" }}>{cats[4]}</h2>
          <div className="duas" style={{ marginTop: 14 }}>
            {QULS.map((q) => {
              const [surah, verses] = q;
              const id = `qul-${surah}`;
              return (
                <article key={id} className="card dua">
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h3 className="dua-title" style={{ margin: 0 }}>{t(`qul${surah}`)}</h3>
                    <button className="play" onClick={() => play(id)} aria-label={`${t("listen")}: ${t(`qul${surah}`)}`}>{playing === id ? <Pause className="ic" aria-hidden="true" /> : <Play className="ic" aria-hidden="true" />}</button>
                  </div>
                  <SurahText surah={surah} verses={verses} />
                  <span className="b2 mid">{t("fullSurah")}</span>
                </article>
              );
            })}
          </div>
        </section>
        {note && <div className="toast" role="status">{note}</div>}
      </div>
    </>
  );
}
