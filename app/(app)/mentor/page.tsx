"use client";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";

type Ticket = {
  id: string; reason: string; urgent: boolean; original: string; original_lang: string; question_ar: string;
  draft_ar: string | null; status: "new" | "claimed" | "answered"; claimed_by: string | null; reply_ar: string | null;
  created_at: string; mine: boolean; preferred: boolean; reply_learner?: string | null; claimed_by_name: string | null;
  learner: { name: string | null; language: string; phone: string | null } | null;
};
type View = "open" | "mine" | "answered";

/** The shared inbox. Questions arrive in Arabic; replies go back in the learner's own language. */
export default function MentorPortal() {
  const { t, num, lang, locale, profile, loading } = useApp();
  const shown = (x: Ticket) => (lang !== "ar" && x.original_lang === lang ? x.original : x.question_ar);
  const [view, setView] = useState<View>("open");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [back, setBack] = useState("");
  const [busy, setBusy] = useState("");
  const [flash, setFlash] = useState("");
  const [error, setError] = useState("");
  const isMentor = profile?.role === "mentor" || profile?.role === "admin";

  const load = useCallback(async () => {
    const res = await fetch(`/api/mentor/tickets?view=${view}`);
    if (res.ok) { setTickets((await res.json()).tickets); window.dispatchEvent(new Event("muadh:alerts")); }
  }, [view]);

  useEffect(() => { if (isMentor) load(); }, [isMentor, load]);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("t");
    if (id) setSelected(id);
  }, []);
  useEffect(() => {
    if (!isMentor) return;
    const id = setInterval(load, 20_000);
    return () => clearInterval(id);
  }, [isMentor, load]);

  const ticket = tickets.find((x) => x.id === selected) ?? null;
  useEffect(() => { setReply(ticket?.draft_ar ?? ""); setBack(""); setError(""); }, [ticket?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const say = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(""), 5000); };

  async function act(action: "claim" | "release" | "backtranslate" | "reply", text?: string) {
    if (!ticket) return;
    setBusy(action);
    setError("");
    const res = await fetch(`/api/mentor/tickets/${ticket.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, text }) }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    setBusy("");
    if (!res?.ok) {
      setError(body.error === "translation_failed" ? t("mErrTranslate") : body.error === "claim_first" ? t("mClaimFirst") : body.error === "already_claimed" || body.error === "claimed_by_other" ? t("mOther") : t("mErr"));
      return load();
    }
    if (action === "backtranslate") return setBack(body.text);
    if (action === "claim") say(t("mTaken"));
    if (action === "release") say(t("mReleased"));
    if (action === "reply") {
      say(t("mSentTo", { name: ticket.learner?.name ?? "", lang: t(`l_${ticket.original_lang}`) }));
      setSelected(null);
    }
    load();
  }

  if (loading) return <><p className="mid">{t("loading")}</p></>;
  if (!isMentor) return <><p className="lead">{t("mNotMentor")}</p></>;
  const time = (s: string) => new Date(s).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
        <div><p className="mid" style={{ margin: 0, fontWeight: 600 }}>{profile.name} · {t(profile.gender === "female" ? "mSisters" : "mBrothers")}</p></div>
        <div className="langs" role="tablist">
          {(["open", "mine", "answered"] as View[]).map((v) => (
            <button key={v} aria-pressed={view === v} onClick={() => { setView(v); setSelected(null); }}>{t(v === "open" ? "mOpen" : v === "mine" ? "mMine" : "mAnswered")}</button>
          ))}
        </div>
      </div>
      <div className="portal">
        <aside className="card queue">
          {tickets.length === 0 && <p className="mid" style={{ padding: 12 }}>{t("mEmpty")}</p>}
          {tickets.map((x) => (
            <button key={x.id} className="qi" aria-current={x.id === selected} onClick={() => setSelected(x.id)}>
              <div className="who">
                {x.learner?.name ?? "—"} <span className="b2 mid">· {t(`l_${x.original_lang}`)}</span>{" "}
                <span className={`tagp ${x.status === "answered" ? "ok" : ""}`} style={x.urgent ? { background: "rgba(207,102,121,.2)", color: "var(--err)" } : undefined}>{t(`r_${x.reason}`)}</span>
              </div>
              <div className="snip" dir="auto">{shown(x)}</div>
              <div className="b2 mid">{time(x.created_at)}{x.preferred ? ` · ⭐ ${t("mBefore")}` : ""}{x.status === "claimed" ? ` · ${x.mine ? t("mTakenYou") : t("mTakenBy", { name: x.claimed_by_name ?? "" })}` : ""}</div>
            </button>
          ))}
        </aside>
        <section className="card detail">
          {!ticket ? <p className="mid">{t("mPick")}</p> : (
            <>
              <span className="tagp">{t(`r_${ticket.reason}`)}</span>
              <h2 dir="rtl" lang="ar" style={{ margin: "14px 0 6px", textAlign: "right", fontFamily: "'IBM Plex Sans Arabic',sans-serif" }}>{ticket.question_ar}</h2>
              <div className="b2 mid">{t("mOriginal")} ({t(`l_${ticket.original_lang}`)})</div>
              <div className="orig" lang={ticket.original_lang}>{ticket.original}</div>
              {ticket.learner?.phone && <p className="b2" style={{ color: "var(--gold)" }}>📞 {t("mContact")}: {ticket.learner.phone}</p>}

              {ticket.status === "answered" ? (
                <>
                  <div className="box" dir="auto"><b>{t("mReply")}</b>{ticket.reply_ar}</div>
                  {ticket.reply_learner && <div className="box" dir="ltr" lang={ticket.original_lang}><b>{t("mReceived")}</b>{ticket.reply_learner}</div>}
                </>
              ) : ticket.status === "claimed" && !ticket.mine ? (
                <p className="chip">🔒 {t("mTakenBy", { name: ticket.claimed_by_name ?? "" })}</p>
              ) : (
                <>
                  {ticket.status === "new" && <button className="btn sec" onClick={() => act("claim")} disabled={!!busy}>✋ {t("mClaim")}</button>}
                  {ticket.status === "claimed" && ticket.mine && (
                    <div className="row"><span className="chip" style={{ marginTop: 0 }}>✓ {t("mTakenYou")}</span>
                      <button className="btn sec" onClick={() => act("release")} disabled={!!busy}>{t("mRelease")}</button></div>
                  )}
                  {ticket.status === "new" && <p className="claim-first">👆 {t("mClaimFirst")}</p>}
                  <label htmlFor="reply" style={{ display: "block", fontWeight: 600, marginTop: 16 }}>{t("mReply")}</label>
                  {ticket.draft_ar && <p className="b2" style={{ color: "var(--gold)", margin: "4px 0" }}>✦ {t("mDraft")}</p>}
                  <p className="b2 mid" style={{ margin: "2px 0 0" }}>{t("mReplyHint")}</p>
                  <textarea id="reply" dir="auto" disabled={!ticket.mine} value={reply} onChange={(e) => { setReply(e.target.value); setBack(""); }} style={{ marginTop: 6 }} />
                  <div className="row" style={{ marginTop: 12 }}>
                    <button className="btn sec" onClick={() => act("backtranslate", reply)} disabled={!reply.trim() || !!busy}>{busy === "backtranslate" ? "…" : t("mCheck")}</button>
                    <button className="btn" onClick={() => act("reply", reply)} disabled={!reply.trim() || !!busy || !ticket.mine}>{busy === "reply" ? "…" : t("mSend")}</button>
                  </div>
                  {back && <div className="box" dir="auto" lang={ticket.original_lang}><b>{t("mBack", { lang: t(`l_${ticket.original_lang}`) })}</b>{back}</div>}
                </>
              )}
              {error && <p className="err" role="alert" style={{ marginTop: 12 }}>{error}</p>}
            </>
          )}
          {flash && <p className="chip" role="status">{flash}</p>}
        </section>
      </div>
      <p className="b2 mid" style={{ marginTop: 14 }}>{num(tickets.length)} · {t(view === "open" ? "mOpen" : view === "mine" ? "mMine" : "mAnswered")}</p>
    </>
  );
}
