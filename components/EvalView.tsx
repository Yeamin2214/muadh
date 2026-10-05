"use client";
import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";

type Summary = {
  cases: number; correct: number; safe: number; incorrect: number; critical: number; partial?: boolean;
  abstention: { must_abstain: number; abstained: number; should_answer: number; over_abstained: number };
  referral: { referred: number; precise: number; should_refer: number; caught: number };
  sources: { answered: number; cited_all: number; quran_checked: number; quran_hit: number };
  fabricated: { cases: number; caught: number };
  level: { checked: number; correct: number };
  time_ms: { median: number; p90: number };
  ai: { calls: number; tokens: number };
  by_group: { group: string; cases: number; correct: number; safe: number }[];
};
type Row = { id: string; group: string; question: string; expected_action: string; actual_action: string; verdict: string; critical: boolean; reason: string };

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

/** Admin view of the latest evaluation run: the measures the judges asked for, by category, with errors listed. */
export default function EvalView() {
  const { t, num, locale } = useApp();
  const [run, setRun] = useState<{ created_at: string; summary: Summary; rows: Row[] } | null | undefined>(undefined);
  useEffect(() => { fetch("/api/admin/eval").then((r) => r.json()).then((d) => setRun(d.run ?? null)).catch(() => setRun(null)); }, []);

  if (run === undefined) return <p className="mid">{t("loading")}</p>;
  if (!run) return <div className="card tl" style={{ marginTop: 0 }}><b>{t("evNone")}</b><p className="b2 mid">npm run evaluate</p></div>;
  const s = run.summary;
  const cards: [string, number, number, string?][] = [
    ["evCorrect", s.correct, s.cases],
    ["evAbstain", s.abstention.abstained, s.abstention.must_abstain],
    ["evFake", s.fabricated.caught, s.fabricated.cases],
    ["evCited", s.sources.cited_all, s.sources.answered],
    ["evQuran", s.sources.quran_hit, s.sources.quran_checked],
    ["evPrecision", s.referral.precise, s.referral.referred],
    ["evRecall", s.referral.caught, s.referral.should_refer],
    ["evOver", s.abstention.over_abstained, s.abstention.should_answer, "low"],
  ];
  const problems = run.rows.filter((r) => r.verdict === "fail" || r.critical);

  return (
    <>
      <p className="b2 mid" style={{ margin: 0 }}>
        {t("evRun", { n: num(s.cases), d: new Date(run.created_at).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) })}
        {s.partial ? ` · ${t("evPartial")}` : ""} · {t("evTime", { m: (s.time_ms.median / 1000).toFixed(1) })} · {num(s.ai.tokens)} tokens
      </p>
      <div className="kpis">
        {cards.map(([key, a, b, mode]) => (
          <div key={key} className="card kpi"><span>{t(key)}</span><b>{pct(a, b)}%</b><small>{num(a)} / {num(b)}{mode === "low" ? ` · ${t("evLower")}` : ""}</small></div>
        ))}
        <div className={`card kpi ${s.critical ? "bad" : "good"}`}><span>{t("evCritical")}</span><b>{num(s.critical)}</b><small>{t("evCriticalP")}</small></div>
        <div className="card kpi"><span>{t("evLevel")}</span><b>{pct(s.level.correct, s.level.checked)}%</b><small>{num(s.level.correct)} / {num(s.level.checked)}</small></div>
      </div>
      <section className="card tl">
        <b>{t("evByGroup")}</b>
        <div className="hbars">
          {s.by_group.map((g) => (
            <div key={g.group} className="hbar"><span>{g.group}</span><div><i style={{ width: `${pct(g.correct, g.cases)}%` }} /></div><b>{pct(g.correct, g.cases)}%</b></div>
          ))}
        </div>
      </section>
      <section className="card tl">
        <b>{t("evProblems")} ({num(problems.length)})</b>
        {problems.length === 0 ? <p className="b2 mid">{t("evNoProblems")}</p> : (
          <div style={{ overflowX: "auto" }}>
            <table className="mdt"><thead><tr><th>ID</th><th>{t("evQuestion")}</th><th>{t("evExpected")}</th><th>{t("evActual")}</th></tr></thead>
              <tbody>{problems.map((r) => (
                <tr key={r.id}><td>{r.critical ? "⚠ " : ""}{r.id}</td><td dir="auto">{r.question}</td><td>{r.expected_action}</td><td>{r.actual_action}{r.reason ? ` (${r.reason})` : ""}</td></tr>
              ))}</tbody></table>
          </div>
        )}
      </section>
    </>
  );
}
