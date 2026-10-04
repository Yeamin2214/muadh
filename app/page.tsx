"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Shell from "@/components/Shell";
import DailyPopups from "@/components/DailyPopups";
import ShiftPlanner from "@/components/ShiftPlanner";
import LocationBar from "@/components/LocationBar";
import Countdown from "@/components/Countdown";
import { Modal } from "@/components/Shell";
import { useApp, useRequireProfile } from "@/components/AppProvider";
import { useNow, usePlace } from "@/components/usePlace";
import { useReminders } from "@/components/useReminders";
import { dayKey, distanceToKaabaKm, nextPrayer, prayerCalendar, qiblaDegrees } from "@/lib/client/prayer";
import { DUAS } from "@/lib/client/text";
import { nextLesson, STAGE_IMAGES } from "@/lib/client/lessons";


export default function Home() {
  const profile = useRequireProfile();
  const { t, list, num, locale, lang } = useApp();
  const loc = usePlace();
  const { place } = loc;
  const now = useNow();

  const np = useMemo(() => nextPrayer(place, now), [place, now]);
  const names = list("prayers");
  const fmt = (d: Date) => d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const reminderText = useCallback((p: string) => ({ title: t("remTitle", { p }), body: t("remBody", { p }) }), [t]);
  const reminders = useReminders(np.today, names, reminderText);

  // Prayer tracker, kept per day on this device.
  const [prayed, setPrayed] = useState<boolean[]>([false, false, false, false, false]);
  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(`muadh.track.${dayKey(now)}`) ?? "null"); setPrayed(Array.isArray(s) ? s : [false, false, false, false, false]); } catch { /* ignore */ }
  }, [now]);
  const toggle = (i: number) => {
    const next = prayed.map((v, k) => (k === i ? !v : v));
    setPrayed(next);
    try { localStorage.setItem(`muadh.track.${dayKey()}`, JSON.stringify(next)); } catch { /* ignore */ }
  };

  // Prayer times as a calendar file, so reminders work even when the phone is locked.
  const [calNote, setCalNote] = useState(false);
  const downloadCalendar = () => {
    const blob = new Blob([prayerCalendar(place, names)], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "muadh-prayer-times.ics";
    a.click();
    URL.revokeObjectURL(a.href);
    setCalNote(true);
  };

  // Dhikr counter.
  const [count, setCount] = useState(0);
  const [word, setWord] = useState(0); // 0..2: the three sets of 33, 3: the closing tahlil
  const [reward, setReward] = useState(false);
  const tap = () => {
    if (word === 3) { navigator.vibrate?.([60, 40, 60]); setReward(true); setWord(0); setCount(0); return; }
    if (count + 1 === 33) { navigator.vibrate?.(60); setCount(0); setWord(word + 1); return; }
    navigator.vibrate?.(8);
    setCount(count + 1);
  };

  if (!profile) return <Shell><p className="mid" style={{ padding: 40 }}>{t("loading")}</p></Shell>;

  const fraction = Math.min(1, Math.max(0, (now.getTime() - np.previous.getTime()) / (np.at.getTime() - np.previous.getTime())));
  const C = 2 * Math.PI * 58;
  const daySpan = np.today[4].getTime() - np.today[0].getTime();
  const sun = Math.min(100, Math.max(0, ((now.getTime() - np.today[0].getTime()) / daySpan) * 100));
  const hijri = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, { day: "numeric", month: "long", year: "numeric" }).format(now);
  const toFriday = (5 - now.getDay() + 7) % 7;
  const jumuah = toFriday === 0 ? t("jumuahToday") : toFriday === 1 ? t("jumuahTomorrow") : t("jumuahIn", { d: num(toFriday) });
  const heroImage = now.getDate() % 2 ? "/images/hero-madinah.webp" : "/images/hero-kaaba.webp";
  const lesson = nextLesson(profile.lessons_done ?? []);
  const done = prayed.filter(Boolean).length;
  const q = qiblaDegrees(place);
  const dua = DUAS[now.getDate() % DUAS.length];

  return (
    <Shell>
      <DailyPopups times={np.today} />
      {reward && (
        <Modal title={t("rewardH")} onClose={() => setReward(false)} closeLabel={t("close")}>
          <p className="ayah" style={{ margin: 0 }}>{t("rewardP")}</p>
          <span className="ayah"><span className="ref">Muslim 597</span></span>
        </Modal>
      )}
      <section className="hero4 photo" style={{ backgroundImage: `url(${heroImage})` }}>
        <div>
          <div className="date">{hijri}</div>
          <h1>{t("greet")}{profile.name ? `, ${profile.name}` : ""}</h1>
          <p>{t("heroP")}</p>
          <span className="chip">🕌 {jumuah}</span>
        </div>
        <div className="pring">
          <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
            <circle cx="66" cy="66" r="58" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="8" />
            <circle cx="66" cy="66" r="58" fill="none" stroke="#D4AF37" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - fraction)} transform="rotate(-90 66 66)" />
            <text x="66" y="62" textAnchor="middle" fill="#F5F5F5" fontSize="13">{t("nextK")}</text>
            <text x="66" y="84" textAnchor="middle" fill="#D4AF37" fontSize="20" fontWeight="700">{fmt(np.at)}</text>
          </svg>
          <div>
            <div className="pn">{names[np.index]}</div>
            <div className="pc"><Countdown to={np.at} format={num} /></div>
          </div>
        </div>
      </section>

      <section className="card tl" aria-label={t("tlH")}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <b>{t("tlH")}</b>
        </div>
        <LocationBar {...loc} />
        <div className="line"><div className="fill" style={{ width: `${sun}%` }} /><div className="sun" style={{ insetInlineStart: `${sun}%` }} /></div>
        <div className="nodes">
          {np.today.map((d, k) => (
            <div key={k} className={`node ${k === np.index && np.at === d ? "now" : d < now ? "past" : ""}`}>
              <i />{names[k]}<b>{fmt(d)}</b>
            </div>
          ))}
        </div>
        <div className="row" style={{ justifyContent: "space-between", marginTop: 16 }}>
          {reminders.status === "on"
            ? <span className="chip" style={{ marginTop: 0 }}>🔔 {t("remActive")}</span>
            : <button className="btn sec" onClick={reminders.turnOn}>🔔 {t("remOn")}</button>}
          {profile.work_pattern === 1 && <span className="b2" style={{ color: "var(--gold)" }}>{t("shiftNote")}</span>}
        </div>
        <p className="b2 mid" style={{ margin: "10px 0 0" }}>{({ denied: t("remDenied"), dismissed: t("remDismissed"), insecure: t("remInsecure"), unsupported: t("remUnsupported") } as Record<string, string>)[reminders.status] ?? t("remNote")}</p>
        <button className="btn sec" style={{ marginTop: 12 }} onClick={downloadCalendar}>📅 {t("calBtn")}</button>
        {calNote && <p className="b2" style={{ color: "var(--gold)", margin: "8px 0 0" }}>{t("calDone")}</p>}
      </section>

      {profile.work_pattern !== 0 && <ShiftPlanner place={place} />}

      <section className="card tl">
        <div className="row" style={{ justifyContent: "space-between" }}><b>{t("trackH")}</b><span className="b2" style={{ color: "var(--gold)" }}>{done === 5 ? t("trackAll") : t("trackDone", { n: num(done) })}</span></div>
        <p className="b2 mid" style={{ margin: "4px 0 0" }}>{t("trackP")}</p>
        <div className="ptrack">
          {names.map((n, i) => (
            <button key={n} aria-pressed={prayed[i]} onClick={() => toggle(i)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>{n}
            </button>
          ))}
        </div>
      </section>

      <div className="bento">
        <article className="card b-lesson">
          <div className="art" style={{ height: 190, background: `linear-gradient(180deg,transparent 40%,rgba(18,18,18,.9)),url(/images/${STAGE_IMAGES[lesson.stage - 1]}.webp) center/cover` }} />
          <div className="body">
            <div className="b2 mid">{t("todayStep")} · {t("lessonN", { n: num(lesson.n) })} · {list("stageNames")[lesson.stage - 1]}</div>
            <h2 lang="en">{lesson.title}</h2>
            {profile.reads_arabic !== 2 && <div className="hint">{t("hintAudio")}</div>}
            <Link className="btn" href={`/lessons/${lesson.n}`} style={{ marginTop: 18 }}>{t("cont")}</Link>
          </div>
        </article>
        <Link className="card mini b-qibla" href="/qibla">
          <div className="ttl">{t("qibla")}<span style={{ color: "var(--gold)" }}>{lang === "ar" ? "←" : "→"}</span></div>
          <div className="mq">
            <svg width="78" height="78" viewBox="0 0 400 400" aria-hidden="true">
              <circle cx="200" cy="200" r="190" fill="#121212" stroke="#2A2A2A" strokeWidth="8" />
              <g transform={`rotate(${q} 200 200)`}><path d="M200 40 L226 200 L174 200z" fill="#D4AF37" /><path d="M200 360 L226 200 L174 200z" fill="#3a3a3a" /></g>
              <circle cx="200" cy="200" r="22" fill="#0F4C3A" />
            </svg>
            <div><div className="d">{num(Math.round(q))}°</div><div className="b2 mid">{num(distanceToKaabaKm(place))} {t("km")}</div></div>
          </div>
        </Link>
        <section className="card mini counter b-count">
          <button className="ring" onClick={tap} style={{ ["--p" as string]: word === 3 ? 100 : (count / 33) * 100 }} aria-label={word === 3 ? t("tahlil") : list("dhikr")[word]}><span>{word === 3 ? "✦" : num(count)}</span></button>
          <h3>{word === 3 ? t("tahlil") : list("dhikr")[word]}</h3>
          <p className="b2 mid" style={{ margin: 0, textAlign: "center" }}>{word === 3 ? t("tahlilHint") : `${num(word + 1)} / ${num(3)} · ${t("dhikrSub")}`}</p>
        </section>
        <Link className="card mini duaRot b-dua" href="/duas">
          <div className="ttl">{t("duas")}<span className="b2" style={{ color: "var(--gold)" }}>{t("viewAll")}</span></div>
          <div className="tag" style={{ color: "var(--emerald-hi)", fontSize: 14 }}>{list("dcat")[DUAS.indexOf(dua)]}</div>
          <div className="ar-text" lang="ar">{dua.ar}</div>
          {lang !== "ar" && <div className="b2 mid">{dua.m[lang]}</div>}
        </Link>
      </div>
    </Shell>
  );
}
