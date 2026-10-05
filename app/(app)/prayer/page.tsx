"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import PrayerFigure from "@/components/PrayerFigure";
import SurahText from "@/components/SurahText";
import QiblaPage from "../qibla/page";
import { DIFFERENCES, PRAYER_STEPS, RAKAHS, type Phrase } from "@/lib/content/prayer";

/** Plays a list of audio files one after another; returns a stop function. */
function playQueue(urls: string[], onDone: () => void) {
  let i = 0, stopped = false;
  const audio = new Audio();
  const next = () => {
    if (stopped) return;
    if (i >= urls.length) return onDone();
    audio.src = urls[i++];
    audio.play().catch(() => next());
  };
  audio.onended = next;
  next();
  return () => { stopped = true; audio.pause(); };
}

function Learn() {
  const { t, lang, num } = useApp();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const [guided, setGuided] = useState(false);
  const stop = useRef<(() => void) | null>(null);
  const step = PRAYER_STEPS[i];
  const text = (x: { en: string; ar: string; bn: string }) => x[lang];

  const halt = useCallback(() => { stop.current?.(); stop.current = null; setPlaying(null); }, []);
  useEffect(() => halt, [halt]);

  const playPhrase = (key: string, p: Phrase, after?: () => void) => {
    halt();
    if (!p.audio) return after?.();
    setPlaying(key);
    const urls = Array.from({ length: guided && p.times ? p.times : 1 }, () => p.audio!).flat();
    stop.current = playQueue(urls, () => { setPlaying(null); after?.(); });
  };

  // Guided practice: play every phrase of the step in order, pause, then move to the next step.
  useEffect(() => {
    if (!guided) return;
    const phrases = (step.say ?? []).filter((p) => p.audio && !p.optional);
    let k = 0;
    const run = () => {
      if (k < phrases.length) { const p = phrases[k]; const key = `${step.id}-${k++}`; playPhrase(key, p, () => setTimeout(run, 900)); return; }
      const timer = setTimeout(() => (i < PRAYER_STEPS.length - 1 ? setI(i + 1) : setGuided(false)), phrases.length ? 1500 : 5000);
      stop.current = () => clearTimeout(timer);
    };
    run();
    return halt;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guided, i]);

  const go = (n: number) => { halt(); setGuided(false); setI(Math.max(0, Math.min(PRAYER_STEPS.length - 1, n))); };

  return (
    <div className="pray-wrap">
      <div className="card pray-card">
        <div className="pray-art"><PrayerFigure pose={step.pose} /></div>
        <div className="pray-body">
          <div className="scount">{t("stepW")} {num(i + 1)} {t("ofW")} {num(PRAYER_STEPS.length)}</div>
          <h2>{text(step.title)}</h2>
          <p className="pray-do">{text(step.do)}</p>
          {step.say?.map((p, k) => (
            <div key={k} className={`phrase ${p.optional ? "opt" : ""}`}>
              <div className="phrase-top">
                {p.audio && (
                  <button className="play" onClick={() => (playing === `${step.id}-${k}` ? halt() : playPhrase(`${step.id}-${k}`, p))} aria-label={`${t("listen")}: ${p.tr}`}>
                    {playing === `${step.id}-${k}` ? "❚❚" : "▶"}
                  </button>
                )}
                <p className="ar-text" lang="ar">{p.ar}</p>
              </div>
              {p.surah ? <SurahText surah={p.surah[0]} verses={p.surah[1]} /> : lang !== "ar" && <><div className="tr">{p.tr}</div><div className="mean">{p[lang]}</div></>}
              <div className="row" style={{ gap: 8 }}>
                {p.times && <span className="times3">{t("prTimes", { n: num(p.times) })}</span>}
                {p.optional && <span className="b2 mid">{t("prOptional")}</span>}
              </div>
            </div>
          ))}
          {step.diff && <div className="diff-note"><b>⚖️ {t("prDiffH")}</b>{text(DIFFERENCES[step.diff])}</div>}
          {step.src && <p className="b2 mid" style={{ margin: "10px 0 0" }}>{t("prSource")}: {step.src}</p>}
          <div className="sdots">{PRAYER_STEPS.map((s, k) => <button key={s.id} className={k === i ? "on" : k < i ? "past" : ""} onClick={() => go(k)} aria-label={`${t("stepW")} ${k + 1}`} />)}</div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <button className="btn sec" onClick={() => go(i - 1)} disabled={i === 0}>{t("prev")}</button>
            <button className={`btn ${guided ? "" : "sec"}`} onClick={() => (guided ? (setGuided(false), halt()) : setGuided(true))}>{guided ? `⏸ ${t("prStop")}` : `▶ ${t("prGuided")}`}</button>
            <button className="btn" onClick={() => go(i + 1)} disabled={i === PRAYER_STEPS.length - 1}>{t("nextS")}</button>
          </div>
          <p className="b2 mid" style={{ margin: "12px 0 0" }}>{t("prPracticeNote")}</p>
        </div>
      </div>
      <p className="b2 mid">{t("prFiqhRef")}</p>
    </div>
  );
}


type Ev = { pose: "stand" | "takbir" | "ruku" | "sujood" | "sit"; step: string; audio: string[]; wait?: number; rakah: number };
const A = (id: string, times = 1) => Array.from({ length: times }, () => `/audio/${id}.m4a`);
const FATIHA_AUDIO = Array.from({ length: 7 }, (_, i) => `https://everyayah.com/data/Alafasy_128kbps/00100${i + 1}.mp3`);

/** The whole prayer as one ordered timeline, built from the number of rak'ahs. */
function buildPrayer(n: number): Ev[] {
  const ev: Ev[] = [];
  for (let r = 1; r <= n; r++) {
    if (r === 1) {
      ev.push({ pose: "stand", step: "intention", audio: [], wait: 3000, rakah: r });
      ev.push({ pose: "takbir", step: "takbir", audio: A("takbir"), rakah: r });
    }
    ev.push({ pose: "stand", step: "recite", audio: r <= 2 ? [...FATIHA_AUDIO, ...A("qul-112")] : FATIHA_AUDIO, rakah: r });
    ev.push({ pose: "ruku", step: "ruku", audio: [...A("takbir"), ...A("ruku", 3)], rakah: r });
    ev.push({ pose: "stand", step: "rise", audio: [...A("sami"), ...A("rabbana")], rakah: r });
    ev.push({ pose: "sujood", step: "sujood", audio: [...A("takbir"), ...A("sujood", 3)], rakah: r });
    ev.push({ pose: "sit", step: "between", audio: A("takbir"), wait: 3500, rakah: r });
    ev.push({ pose: "sujood", step: "sujood", audio: [...A("takbir"), ...A("sujood", 3)], rakah: r });
    if (r === n) {
      ev.push({ pose: "sit", step: "tashahhud", audio: [...A("takbir"), ...A("tashahhud")], rakah: r });
      ev.push({ pose: "sit", step: "durood", audio: A("durood"), rakah: r });
      ev.push({ pose: "sit", step: "dua", audio: A("before-salam"), rakah: r });
      ev.push({ pose: "sit", step: "salam", audio: A("salam"), rakah: r });
    } else if (r === 2) {
      ev.push({ pose: "sit", step: "tashahhud", audio: [...A("takbir"), ...A("tashahhud")], rakah: r }); // first tashahhud in longer prayers
      ev.push({ pose: "stand", step: "second", audio: A("takbir"), rakah: r });
    } else {
      ev.push({ pose: "stand", step: "second", audio: A("takbir"), rakah: r });
    }
  }
  return ev;
}

/** Demonstration only: plays the whole prayer in order, like watching an imam, so learners see the flow. */
function Practice() {
  const { t, lang, num, list } = useApp();
  const [count, setCount] = useState(2);
  const [i, setI] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const stop = useRef<(() => void) | null>(null);
  const events = buildPrayer(count);
  const ev = events[i];
  const step = PRAYER_STEPS.find((x) => x.id === ev.step)!;

  useEffect(() => {
    if (!running) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const advance = () => {
      timer = setTimeout(() => {
        if (i < events.length - 1) setI(i + 1); else { setRunning(false); setDone(true); }
      }, ev.wait ?? 1200);
    };
    const halt = ev.audio.length ? playQueue(ev.audio, advance) : (advance(), () => {});
    stop.current = () => { halt(); if (timer) clearTimeout(timer); };
    return () => stop.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, i, count]);

  const restart = (n = count) => { stop.current?.(); setRunning(false); setDone(false); setCount(n); setI(0); };
  const choices: [number, string][] = [[2, list("prayers")[0]], [3, list("prayers")[3]], [4, `${list("prayers")[1]} · ${list("prayers")[2]} · ${list("prayers")[4]}`]];

  return (
    <div className="pray-wrap">
      <div className="demo-warning">⚠️ {t("ppWarn")}</div>
      <div className="langs" style={{ alignSelf: "flex-start" }}>
        {choices.map(([n, label]) => <button key={n} aria-pressed={count === n} onClick={() => restart(n)}>{t("prRakCount", { n: num(n) })} · {label}</button>)}
      </div>
      <div className="card pray-card">
        <div className="pray-art"><PrayerFigure pose={ev.pose} /></div>
        <div className="pray-body">
          <div className="scount">{t("ppRakah", { r: num(ev.rakah), n: num(count) })}</div>
          <h2>{done ? t("ppDone") : ev.step === "second" && ev.rakah >= 2 ? t("ppNext") : step.title[lang]}</h2>
          <p className="pray-do">
            {done ? t("ppDoneP")
              : ev.step === "second" && ev.rakah >= 2 ? t("ppNextP")
              : ev.step === "recite" && ev.rakah > 2 ? t("ppFatihaOnly")
              : step.do[lang]}
          </p>
          <div className="pp-bar"><i style={{ width: `${((done ? events.length : i) / events.length) * 100}%` }} /></div>
          <div className="row" style={{ marginTop: 16 }}>
            {!running
              ? <button className="btn" onClick={() => { if (done) restart(); setRunning(true); }}>▶ {i === 0 || done ? t("ppStart") : t("ppResume")}</button>
              : <button className="btn" onClick={() => { stop.current?.(); setRunning(false); }}>⏸ {t("ppPause")}</button>}
            <button className="btn sec" onClick={() => restart()}>↺ {t("ppRestart")}</button>
          </div>
        </div>
      </div>
      <div className="diff-note"><b>📖 {t("ppNewH")}</b>{t("ppNewP")}</div>
    </div>
  );
}

function Rakahs() {
  const { t, list, num } = useApp();
  const names = list("prayers");
  return (
    <div className="card tl" style={{ marginTop: 0 }}>
      <b>{t("prRakH")}</b>
      <p className="b2 mid" style={{ margin: "4px 0 16px" }}>{t("prRakP")}</p>
      <div className="rak-list">
        {RAKAHS.map((r, k) => (
          <div key={k} className="rak-row">
            <div className="rak-name"><b>{names[k]}</b><span className="b2 mid">{t("prRakCount", { n: num(r.count) })}{r.aloud ? ` · ${t("prAloud")}` : ` · ${t("prSilent")}`}</span></div>
            <div className="rak-dots">
              {Array.from({ length: r.count }, (_, j) => (
                <span key={j} className="rak-wrap">
                  <i className="rak">{num(j + 1)}</i>
                  {(j === 1 && r.count > 2) || j === r.count - 1 ? <i className="rak-sit" title={t("prTashahhud")}>🪑</i> : null}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="b2 mid" style={{ margin: "14px 0 0" }}>🪑 {t("prSitLegend")}</p>
    </div>
  );
}

function PrayerInner() {
  const { t } = useApp();
  const params = useSearchParams();
  const [tab, setTab] = useState<"learn" | "practice" | "rakahs" | "qibla">("learn");
  useEffect(() => { const q = params.get("tab"); if (q === "qibla" || q === "rakahs") setTab(q); }, [params]);
  return (
    <div className="admin">
      <div className="langs" role="tablist" style={{ alignSelf: "flex-start" }}>
        <button aria-pressed={tab === "learn"} onClick={() => setTab("learn")}>🧎 {t("prLearn")}</button>
        <button aria-pressed={tab === "practice"} onClick={() => setTab("practice")}>🎧 {t("ppTab")}</button>
        <button aria-pressed={tab === "rakahs"} onClick={() => setTab("rakahs")}>🔢 {t("prRakTab")}</button>
        <button aria-pressed={tab === "qibla"} onClick={() => setTab("qibla")}>🧭 {t("qibla")}</button>
      </div>
      {tab === "learn" && <Learn />}
      {tab === "practice" && <Practice />}
      {tab === "rakahs" && <Rakahs />}
      {tab === "qibla" && <QiblaPage />}
      {tab !== "qibla" && <Link href="/lessons" className="b2" style={{ color: "var(--gold)" }}>📖 {t("prLessons")}</Link>}
    </div>
  );
}

export default function PrayerPage() {
  return <Suspense><PrayerInner /></Suspense>;
}
