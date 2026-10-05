"use client";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import EvalView from "@/components/EvalView";
import RatingsView from "@/components/RatingsView";
import UsersView from "@/components/UsersView";

type Stats = {
  learners: number; learners_week: number; active_week: number; mentors: number; applicants: number;
  questions: number; questions_week: number; lessons_done: number; cached_questions: number;
  by_action: Record<string, number>; by_level: Record<string, number>; by_language: Record<string, number>;
  tickets: { new: number; claimed: number; answered: number; urgent_open: number; open_brothers: number; open_sisters: number; avg_hours: number | null };
  daily: { day: string; answered: number; referred: number; other: number }[];
  ai: { calls: number; tokens: number }; ai_models: Record<string, number>;
};
type Details = { full_name?: string; phone?: string; location?: string; organisation?: string; position?: string; languages?: string[]; qualifications?: string; experience_years?: number };
type Application = { user_id: string; email: string; details: Details; status: "pending" | "approved" | "rejected"; note: string | null; created_at: string; profiles: { name: string | null; gender: string | null; role: string } | null };
type Mentor = { id: string; name: string | null; gender: string | null; email: string; answered: number };

function Bars({ data, label }: { data: Record<string, number>; label: (k: string) => string }) {
  const { t, num } = useApp();
  const entries = Object.entries(data ?? {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  if (!entries.length) return <p className="b2 mid">{t("adNone")}</p>;
  return (
    <div className="hbars">
      {entries.map(([k, v]) => (
        <div key={k} className="hbar"><span>{label(k)}</span><div><i style={{ width: `${(v / max) * 100}%` }} /></div><b>{num(v)}</b></div>
      ))}
    </div>
  );
}

/** Admin panel: platform statistics and mentor verification. */
export default function AdminPage() {
  const { t, num, locale, profile } = useApp();
  const [tab, setTab] = useState<"overview" | "users" | "mentors" | "eval" | "ratings">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const [s, p] = await Promise.all([
      fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/people").then((r) => (r.ok ? r.json() : null)),
    ]);
    if (s) setStats(s);
    if (p) { setApps(p.applications); setMentors(p.mentors); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function act(id: string, action: "approve" | "reject" | "revoke") {
    if (action === "revoke" && !confirm(t("adConfirmRevoke"))) return;
    setBusy(id + action);
    const res = await fetch(`/api/admin/people/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, note: notes[id] }) });
    const body = await res.json().catch(() => ({}));
    setBusy("");
    if (action !== "revoke") alert(body.emailed ? t("mailSent") : t("mailNotSent"));
    load();
  }

  if (profile?.role !== "admin") return <p className="lead">{t("mNotMentor")}</p>;
  const date = (s: string) => new Date(s).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const s = stats;
  const answered = s?.by_action?.answer ?? 0;
  const referred = (s?.by_action?.refer ?? 0) + (s?.by_action?.crisis ?? 0);
  const pct = (n: number) => (s?.questions ? `${Math.round((n / s.questions) * 100)}%` : "0%");
  const dayMax = Math.max(1, ...(s?.daily ?? []).map((d) => d.answered + d.referred + d.other));
  const pending = apps.filter((a) => a.status === "pending");
  const reviewed = apps.filter((a) => a.status !== "pending");

  return (
    <div className="admin">
      <div className="langs" role="tablist" style={{ alignSelf: "flex-start" }}>
        <button aria-pressed={tab === "overview"} onClick={() => setTab("overview")}>{t("adOverview")}</button>
        <button aria-pressed={tab === "users"} onClick={() => setTab("users")}>{t("usTab")}</button>
        <button aria-pressed={tab === "mentors"} onClick={() => setTab("mentors")}>{t("adMentors")}{pending.length ? ` (${num(pending.length)})` : ""}</button>
        <button aria-pressed={tab === "eval"} onClick={() => setTab("eval")}>{t("evTab")}</button>
        <button aria-pressed={tab === "ratings"} onClick={() => setTab("ratings")}>{t("rtTab")}</button>
      </div>

      {tab === "ratings" && <RatingsView />}
      {tab === "users" && <UsersView />}

      {tab === "eval" && <EvalView />}

      {tab === "overview" && (!s ? <p className="mid">{t("loading")}</p> : (
        <>
          <div className="kpis">
            <div className="card kpi"><span>{t("adLearners")}</span><b>{num(s.learners)}</b><small>{t("adNewWeek", { n: num(s.learners_week) })}</small></div>
            <div className="card kpi"><span>{t("adActive")}</span><b>{num(s.active_week)}</b></div>
            <div className="card kpi"><span>{t("adQuestions")}</span><b>{num(s.questions)}</b><small>{t("adWeek", { n: num(s.questions_week) })}</small></div>
            <div className="card kpi"><span>{t("adAnswered")}</span><b>{pct(answered)}</b><small>{num(answered)}</small></div>
            <div className="card kpi"><span>{t("adReferred")}</span><b>{pct(referred)}</b><small>{num(referred)}</small></div>
            <div className="card kpi"><span>{t("adOpen")}</span><b>{num(s.tickets.new + s.tickets.claimed)}</b><small className={s.tickets.urgent_open ? "urgent" : ""}>{t("adUrgent", { n: num(s.tickets.urgent_open) })}</small></div>
            <div className="card kpi"><span>{t("adResponse")}</span><b>{s.tickets.avg_hours == null ? "—" : t("adHours", { n: num(s.tickets.avg_hours) })}</b></div>
            <div className="card kpi"><span>{t("adMentorsCount")}</span><b>{num(s.mentors)}</b><small>{t("adPending", { n: num(s.applicants) })}</small></div>
            <div className="card kpi"><span>{t("adTokens")}</span><b>{num(s.ai.tokens)}</b><small>{t("adCalls", { n: num(s.ai.calls) })}</small></div>
            <div className="card kpi"><span>{t("adLessons")}</span><b>{num(s.lessons_done)}</b><small>{t("adCache")}: {num(s.cached_questions)}</small></div>
          </div>

          <section className="card tl">
            <b>{t("adDaily")}</b>
            <div className="vbars">
              {s.daily.map((d) => {
                const total = d.answered + d.referred + d.other;
                return (
                  <div key={d.day} className="vbar" title={`${d.day}: ${total}`}>
                    <div className="stack" style={{ height: `${(total / dayMax) * 100}%` }}>
                      <i className="a" style={{ flex: d.answered }} /><i className="r" style={{ flex: d.referred }} /><i className="o" style={{ flex: d.other }} />
                    </div>
                    <span>{new Date(d.day).getDate()}</span>
                  </div>
                );
              })}
            </div>
            <div className="legend"><span><i className="a" />{t("a_answer")}</span><span><i className="r" />{t("a_refer")}</span><span><i className="o" />{t("a_other")}</span></div>
          </section>

          <div className="admin-grid">
            <section className="card tl"><b>{t("adLevels")}</b><Bars data={s.by_level} label={(k) => `Level ${k}`} /></section>
            <section className="card tl"><b>{t("adActions")}</b><Bars data={s.by_action} label={(k) => t(`a_${k}`)} /></section>
            <section className="card tl"><b>{t("adLangs")}</b><Bars data={s.by_language} label={(k) => t(`l_${k}`)} /></section>
            <section className="card tl"><b>{t("adInbox")}</b><Bars data={{ [t("mBrothers")]: s.tickets.open_brothers, [t("mSisters")]: s.tickets.open_sisters }} label={(k) => k} /></section>
            <section className="card tl" style={{ gridColumn: "1 / -1" }}><b>{t("adModels")}</b><Bars data={s.ai_models} label={(k) => k} /></section>
          </div>
        </>
      ))}

      {tab === "mentors" && (
        <>
          <h2 className="adh">{t("adApps")}</h2>
          {pending.length === 0 && <p className="mid">{t("adNoApps")}</p>}
          {[...pending, ...reviewed].map((a) => {
            const d = a.details ?? {};
            return (
              <article key={a.user_id} className="card appcard">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div><b>{d.full_name || a.profiles?.name}</b> <span className="b2 mid">· {a.profiles?.gender === "female" ? t("sister") : t("brother")} · {a.email}</span></div>
                  <span className={`tagp ${a.status === "approved" ? "ok" : ""}`}>{t(`st_${a.status}`)}</span>
                </div>
                <dl>
                  {d.organisation && <><dt>{t("adOrg")}</dt><dd>{d.organisation}{d.position ? ` · ${d.position}` : ""}</dd></>}
                  {d.phone && <><dt>{t("adPhone")}</dt><dd dir="ltr">{d.phone}</dd></>}
                  {d.location && <><dt>{t("adPlace")}</dt><dd>{d.location}</dd></>}
                  {!!d.languages?.length && <><dt>{t("adLangsW")}</dt><dd>{d.languages.join(", ")}</dd></>}
                  {d.qualifications && <><dt>{t("adQual")}</dt><dd>{d.qualifications}</dd></>}
                  {d.experience_years != null && <><dt>{t("adExp")}</dt><dd>{t("adYears", { n: num(d.experience_years) })}</dd></>}
                </dl>
                <p className="b2 mid" style={{ margin: 0 }}>{t("adSentDate", { d: date(a.created_at) })}{a.note ? ` · ${a.note}` : ""}</p>
                {a.status === "approved" && a.email && (
                  <a className="btn sec" style={{ alignSelf: "flex-start" }}
                    href={`mailto:${a.email}?subject=${encodeURIComponent(t("mailSubject"))}&body=${encodeURIComponent(t("mailBody", { name: d.full_name || a.profiles?.name || "" }))}`}>
                    ✉ {t("mailBtn")}
                  </a>
                )}
                {a.status === "pending" && (
                  <div className="row" style={{ marginTop: 10 }}>
                    <input className="field" style={{ flex: 1, minWidth: 200, margin: 0 }} placeholder={t("adNote")} value={notes[a.user_id] ?? ""} onChange={(e) => setNotes({ ...notes, [a.user_id]: e.target.value })} />
                    <button className="btn" disabled={!!busy} onClick={() => act(a.user_id, "approve")}>✓ {t("adApprove")}</button>
                    <button className="btn sec" disabled={!!busy} onClick={() => act(a.user_id, "reject")}>✕ {t("adReject")}</button>
                  </div>
                )}
              </article>
            );
          })}

          <h2 className="adh">{t("adActiveMentors")}</h2>
          {mentors.length === 0 && <p className="mid">{t("adNoMentors")}</p>}
          <div className="mentorlist">
            {mentors.map((m) => (
              <div key={m.id} className="card mrow">
                <div><b>{m.name}</b><div className="b2 mid">{m.gender === "female" ? t("sister") : t("brother")} · {m.email}</div></div>
                <span className="b2" style={{ color: "var(--gold)" }}>{t("adAnsweredN", { n: num(m.answered) })}</span>
                <button className="btn sec" disabled={!!busy} onClick={() => act(m.id, "revoke")}>{t("adRevoke")}</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
