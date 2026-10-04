"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Shell from "@/components/Shell";
import { useApp, useRequireProfile } from "@/components/AppProvider";
import type { AskResult } from "@/lib/engine";
import { LESSONS } from "@/lib/client/lessons";

type Ticket = { status: string; reply_learner: string | null };
type Item = { key: string; question: string; result?: AskResult; tickets?: Ticket[]; error?: string; pending?: boolean };
type Message = { id: string; text: string; answer: AskResult | null; tickets: Ticket[] | null };

const STAR = (
  <svg className="star" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1l2.6 6.3L21 8.2l-4.8 4.4L17.6 19 12 15.6 6.4 19l1.4-6.4L3 8.2l6.4-.9z" /></svg>
);

function Answer({ r }: { r: AskResult }) {
  const { t, lang } = useApp();
  if (r.action === "answer") {
    return (
      <div className="bub">
        {r.sentences?.map((s, i) => <p key={i} style={{ margin: "0 0 8px" }}>{s.text}</p>)}
        {!!r.sources?.length && (
          <div className="cites">
            <b>{t("sources")}</b>
            {r.sources.map((p) => {
              const tr = lang === "ar" ? null : p.translations?.[lang] || p.translations?.en;
              return (
                <div key={p.id} className="src" style={{ display: "block", margin: "10px 0 0" }}>
                  <b>{p.reference ?? p.id}</b>
                  {p.arabic && <p className="ar-text" lang="ar" style={{ fontSize: 20, lineHeight: 1.9, textAlign: "right", margin: "6px 0 0" }}>{p.arabic}</p>}
                  {tr && <p style={{ margin: "4px 0 0", fontFamily: "var(--read)" }}>{tr}</p>}
                  {p.grade && <span className="b2" style={{ color: "var(--gold)" }}>{p.grade}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  if (r.action === "not_found") {
    const d = r.dorar;
    return (
      <div className="bub ref">
        <h3>{t("nfH")}</h3>{t("nfP")}
        {d?.found && (
          <div className="src" style={{ display: "block", marginTop: 12 }}>
            <b>{t("dorarH")}</b>
            {d.text && <p className="ar-text" lang="ar" style={{ fontSize: 19, textAlign: "right", margin: "6px 0" }}>{d.text}</p>}
            {d.grade && <div className="b2"><b>{t("dorarGrade")}:</b> <span lang="ar">{d.grade}</span></div>}
            {d.scholar && <div className="b2"><b>{t("dorarScholar")}:</b> <span lang="ar">{d.scholar}</span></div>}
            {d.source && <div className="b2"><b>{t("dorarSource")}:</b> <span lang="ar">{d.source}</span></div>}
          </div>
        )}
        {d?.url && <a className="b2" href={d.url} target="_blank" rel="noreferrer" style={{ color: "var(--gold)", display: "inline-block", marginTop: 8 }}>{t("dorarOpen")} ↗</a>}
      </div>
    );
  }
  if (r.action === "crisis") return <div className="bub ref"><h3>{t("crisisH")}</h3>{t("crisisP")}</div>;
  if (r.action === "refer") {
    const lowSource = r.reason === "no_source" || r.reason === "low_confidence";
    return <div className="bub ref"><h3>{t(lowSource ? "noSrcH" : "refH")}</h3>{t(lowSource ? "noSrcP" : "refP")}</div>;
  }
  return <div className="bub">{t("otherP")}</div>;
}

function AskInner() {
  const profile = useRequireProfile();
  const { t, list, lang } = useApp();
  const params = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/messages");
    if (!res.ok) return;
    const { messages } = (await res.json()) as { messages: Message[] };
    setItems(messages.slice().reverse().map((m) => ({ key: m.id, question: m.text, result: m.answer ?? undefined, tickets: m.tickets ?? [] })));
  }, []);

  useEffect(() => { if (profile) load(); }, [profile, load]);

  // Asking from a lesson: the lesson becomes context for the answer, without changing what the learner types.
  const [about, setAbout] = useState<{ n: number; title: string } | null>(null);
  useEffect(() => {
    const lesson = LESSONS.find((l) => l.n === Number(params.get("about")));
    setAbout(lesson ? { n: lesson.n, title: lesson.title } : null);
  }, [params]);

  // Check for mentor replies while a referred question is still waiting.
  const waiting = items.some((i) => i.tickets?.some((tk) => tk.status !== "answered"));
  useEffect(() => {
    if (!waiting) return;
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [waiting, load]);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [items.length]);

  async function send(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setText("");
    setBusy(true);
    const key = `local-${Date.now()}`;
    setItems((list) => [...list, { key, question: q, pending: true }]);
    const res = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: q, lang, lesson: about?.n }) }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    const error = !res ? "errBusy" : res.status === 429 ? "errSlow" : res.status === 400 && body.error === "profile_incomplete" ? "errProfile" : !res.ok ? "errBusy" : undefined;
    setItems((list) => list.map((i) => (i.key === key ? { ...i, pending: false, result: error ? undefined : (body as AskResult), error, tickets: body.ticketId ? [{ status: "new", reply_learner: null }] : [] } : i)));
    setBusy(false);
  }

  if (!profile) return <Shell><p className="mid">{t("loading")}</p></Shell>;

  return (
    <Shell>
      <div className="ask">
        <h1>{t("askH")}</h1>
        <p className="mid" style={{ margin: "8px 0 0" }}>{t("askP")}</p>
        {items.length === 0 && (
          <div className="empty">
            <svg width="88" height="88" viewBox="0 0 88 88" fill="none" stroke="#D4AF37" strokeWidth="1.5" aria-hidden="true"><path d="M14 66h40M18 66V48c0-6 5-10 11-10h10c6 0 11 4 11 10v18" /><path d="M26 38v-6h18v6" /><path d="M60 18c8 6 14 16 14 26-6-2-10-6-12-12" /><path d="M62 32L48 58" /></svg>
            <p>{t("empty")}</p>
          </div>
        )}
        {about && (
          <div className="chip" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span>📖 {t("aboutLesson", { n: about.n, title: about.title })}</span>
            <button className="link" onClick={() => setAbout(null)}>{t("clear")}</button>
          </div>
        )}
        <div className="sugg">{(about ? [t("aboutSugg1"), t("aboutSugg2")] : list("sugg")).map((s) => <button key={s} onClick={() => send(s)} disabled={busy}>{s}</button>)}</div>
        <div className="thread" aria-live="polite">
          {items.map((i) => (
            <div key={i.key} style={{ display: "contents" }}>
              <div className="bub me">{i.question}</div>
              {i.pending && <div className="bub"><div className="loading">{STAR}{t("searching")}</div></div>}
              {i.error && <div className="bub ref">{t(i.error)}</div>}
              {i.result && <Answer r={i.result} />}
              {i.tickets?.map((tk, k) =>
                tk.status === "answered" && tk.reply_learner
                  ? <div key={k} className="bub mentor"><b style={{ color: "var(--gold)" }}>{t("mentorSays")}</b><br />{tk.reply_learner}</div>
                  : <div key={k} className="b2 mid" style={{ paddingInlineStart: 6 }}>⏳ {t("waiting")}</div>,
              )}
            </div>
          ))}
          <div ref={end} />
        </div>
        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(text); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={about ? t("aboutPh", { title: about.title }) : t("ph")} aria-label={t("ph")} autoComplete="off" maxLength={1000} />
          <button className="btn" disabled={busy || !text.trim()}>{t("send")}</button>
        </form>
      </div>
    </Shell>
  );
}

export default function AskPage() {
  return <Suspense><AskInner /></Suspense>;
}
