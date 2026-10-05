"use client";
import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";

type Summary = { count: number; overall: number | null; ease: number | null; trust: number | null; useful: number | null; distribution: { stars: number; count: number }[]; learners: number; mentors: number };
type Data = { real: Summary; demo: Summary; answers: { helpful: number; notHelpful: number }; comments: { comment: string; overall: number; role: string; demo: boolean; name: string | null; at: string }[] };

const stars = (n: number) => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);

/** Admin view of tester ratings: real accounts first, demo accounts shown separately. */
export default function RatingsView() {
  const { t, num, locale } = useApp();
  const [d, setD] = useState<Data | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  useEffect(() => { fetch("/api/admin/ratings").then((r) => r.json()).then(setD).catch(() => {}); }, []);
  if (!d) return <p className="mid">{t("loading")}</p>;

  const s = showDemo ? d.demo : d.real;
  const max = Math.max(1, ...s.distribution.map((x) => x.count));
  const fb = d.answers.helpful + d.answers.notHelpful;
  const comments = d.comments.filter((c) => c.demo === showDemo);
  return (
    <>
      <div className="langs" style={{ alignSelf: "flex-start" }}>
        <button aria-pressed={!showDemo} onClick={() => setShowDemo(false)}>{t("rtReal")} ({num(d.real.count)})</button>
        <button aria-pressed={showDemo} onClick={() => setShowDemo(true)}>{t("rtDemo")} ({num(d.demo.count)})</button>
      </div>
      <div className="kpis">
        <div className="card kpi"><span>{t("rtAvg")}</span><b>{s.overall ?? "—"}<small style={{ fontSize: 16 }}> / 5</small></b><small className="gold">{s.overall ? stars(Math.round(s.overall)) : ""}</small></div>
        <div className="card kpi"><span>{t("rtCount")}</span><b>{num(s.count)}</b><small>{t("rtWho", { l: num(s.learners), m: num(s.mentors) })}</small></div>
        <div className="card kpi"><span>{t("rtEase")}</span><b>{s.ease ?? "—"}</b><small>/ 5</small></div>
        <div className="card kpi"><span>{t("rtTrust")}</span><b>{s.trust ?? "—"}</b><small>/ 5</small></div>
        <div className="card kpi"><span>{t("rtUseful")}</span><b>{s.useful ?? "—"}</b><small>/ 5</small></div>
        <div className="card kpi"><span>{t("rtHelpful")}</span><b>{fb ? `${Math.round((d.answers.helpful / fb) * 100)}%` : "—"}</b><small>👍 {num(d.answers.helpful)} · 👎 {num(d.answers.notHelpful)}</small></div>
      </div>
      <section className="card tl">
        <b>{t("rtDist")}</b>
        <div className="hbars">
          {s.distribution.map((x) => (
            <div key={x.stars} className="hbar"><span className="gold">{stars(x.stars)}</span><div><i style={{ width: `${(x.count / max) * 100}%` }} /></div><b>{num(x.count)}</b></div>
          ))}
        </div>
      </section>
      <section className="card tl">
        <b>{t("rtComments")}</b>
        {comments.length === 0 && <p className="b2 mid">{t("adNone")}</p>}
        <div className="comments">
          {comments.map((c, i) => (
            <blockquote key={i}>
              <span className="gold">{stars(c.overall)}</span>
              <p dir="auto">{c.comment}</p>
              <small className="mid">{c.name ?? ""} · {c.role === "learner" ? t("roleLearner") : t("roleMentor")} · {new Date(c.at).toLocaleDateString(locale, { day: "numeric", month: "short" })}</small>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}
