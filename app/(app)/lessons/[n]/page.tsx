"use client";
import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Markdown from "@/components/Markdown";
import WaterArt from "@/components/WaterArt";
import { useApp, useProfile } from "@/components/AppProvider";
import { browserClient } from "@/lib/supabase/browser";
import { LESSONS, STAGE_IMAGES, isDone, isOpen, nextLesson } from "@/lib/client/lessons";

/** Lesson 11 (wudu) is shown one step at a time; every other lesson as a reading page. */
function WuduStepper({ steps }: { steps: string[] }) {
  const { t, num } = useApp();
  const [i, setI] = useState(0);
  const threeTimes = /three times/i.test(steps[i]);
  return (
    <section className="card stepper" aria-live="polite">
      <div className="art"><WaterArt /></div>
      <div className="sbody">
        <div className="scount">{t("stepW")} {num(i + 1)} {t("ofW")} {num(steps.length)}</div>
        <div className="stext">{steps[i]}</div>
        {threeTimes && <span className="times3">{t("times3")}</span>}
        <div className="sdots">{steps.map((_, k) => <button key={k} className={k === i ? "on" : k < i ? "past" : ""} onClick={() => setI(k)} aria-label={`${t("stepW")} ${k + 1}`} />)}</div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <button className="btn sec" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>{t("prev")}</button>
          {i < steps.length - 1 && <button className="btn" onClick={() => setI(i + 1)}>{t("nextS")}</button>}
        </div>
      </div>
    </section>
  );
}

export default function LessonPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = use(params);
  const profile = useProfile();
  const { t, num, lang, refresh } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const lesson = LESSONS.find((l) => l.n === Number(n));
  if (!lesson) return <><p className="mid">404</p></>;
  const done = profile.lessons_done ?? [];
  if (!isOpen(done, lesson) && !isDone(done, lesson.n)) {
    return <><div className="page"><p className="lead">{t("locked")}</p><Link className="btn" href="/lessons">{t("back")}</Link></div></>;
  }

  // The wudu lesson's numbered steps become the interactive stepper.
  const stepMatch = lesson.n === 11 ? lesson.body.match(/((?:^\d+\.\s.+\n?)+)/m) : null;
  const steps = stepMatch ? stepMatch[1].trim().split("\n").map((s) => s.replace(/^\d+\.\s/, "")) : [];
  const body = stepMatch ? lesson.body.replace(stepMatch[1], "") : lesson.body;

  async function complete() {
    if (!profile || !lesson) return;
    setBusy(true);
    const updated = Array.from(new Set([...done, String(lesson.n)]));
    await browserClient().from("profiles").update({ lessons_done: updated }).eq("id", profile.id);
    await refresh();
    setBusy(false);
    const next = nextLesson(updated);
    router.push(next.n !== lesson.n ? `/lessons/${next.n}` : "/lessons");
  }

  return (
    <>
      <article className="page lesson-page">
        <Link className="back" href="/lessons">{lang === "ar" ? "→" : "←"} {t("back")}</Link>
        <div className="lesson-cover" style={{ backgroundImage: `linear-gradient(180deg,rgba(18,18,18,.1),rgba(18,18,18,.95)),url(/images/${STAGE_IMAGES[lesson.stage - 1]}.webp)` }}>
          <div className="b2" style={{ color: "var(--gold)" }}>{t("lessonN", { n: num(lesson.n) })} · {t("minutesW", { m: num(lesson.minutes) })}</div>
          <h1 lang="en">{lesson.title}</h1>
        </div>
        {lang !== "en" && <p className="hint">{t("lessonLangNote")}</p>}
        <div lang="en" dir="ltr" className="lesson-body">
          <Markdown text={body} />
          {steps.length > 0 && <WuduStepper steps={steps} />}
          <div className="box"><b>Key point</b>{lesson.key}</div>
          <div className="box"><b>Try this today</b>{lesson.today}</div>
          <div className="box"><b>Ask your mentor</b>{lesson.mentor}</div>
        </div>
        <div className="row" style={{ justifyContent: "space-between", marginTop: 24 }}>
          <Link className="btn sec" href={`/ask?about=${lesson.n}`}>{t("askAbout")}</Link>
          {isDone(done, lesson.n)
            ? <span className="chip" style={{ marginTop: 0 }}>✓ {t("markedDone")}</span>
            : <button className="btn" onClick={complete} disabled={busy}>{busy ? t("saving") : t("done")}</button>}
        </div>
      </article>
    </>
  );
}
