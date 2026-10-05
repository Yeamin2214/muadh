"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import Answer from "@/components/Answer";
import type { AskResult } from "@/lib/engine";
import { LESSONS } from "@/lib/client/lessons";

type Ticket = { status: string; reply_learner: string | null; mentor: { name: string | null } | null };
type Message = { id: string; text: string; answer: AskResult | null; feedback?: number | null; tickets: Ticket[] | null; pending?: boolean; error?: string };
type Chat = { id: string; title: string; updated_at: string; unread: number; waiting: number };

const SESSION_GAP_MS = 30 * 60_000; // a chat idle for 30 minutes starts fresh next time

function AskInner() {
  const { t, list, lang, locale } = useApp();
  const params = useSearchParams();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [about, setAbout] = useState<{ n: number; title: string } | null>(null);
  const end = useRef<HTMLDivElement>(null);

  const loadChats = useCallback(async () => {
    const r = await fetch("/api/conversations").then((x) => (x.ok ? x.json() : null)).catch(() => null);
    const list: Chat[] = r?.conversations ?? [];
    setChats(list);
    return list;
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    const r = await fetch(`/api/messages?c=${id}`).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    if (r?.messages) { setMessages(r.messages); window.dispatchEvent(new Event("muadh:alerts")); }
  }, []);

  // Open the chat from the link, continue a recent chat, or start fresh.
  useEffect(() => {
    const lesson = LESSONS.find((l) => l.n === Number(params.get("about")));
    setAbout(lesson ? { n: lesson.n, title: lesson.title } : null);
    loadChats().then((list) => {
      const wanted = params.get("c");
      const recent = list[0] && Date.now() - new Date(list[0].updated_at).getTime() < SESSION_GAP_MS ? list[0].id : null;
      const id = lesson || params.get("new") ? null : wanted ?? recent;
      setActive(id);
      if (id) loadMessages(id); else setMessages([]);
    });
  }, [params, loadChats, loadMessages]);

  // While a mentor still has to reply, check this chat and the list regularly.
  const waiting = messages.some((m) => m.tickets?.some((tk) => tk.status !== "answered"));
  useEffect(() => {
    if (!active || !waiting) return;
    const id = setInterval(() => { loadMessages(active); loadChats(); }, 20_000);
    return () => clearInterval(id);
  }, [active, waiting, loadMessages, loadChats]);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages.length]);

  const open = (id: string | null) => {
    setDrawer(false);
    setAbout(null);
    router.replace(id ? `/ask?c=${id}` : "/ask?new=1");
  };

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/conversations?id=${id}`, { method: "DELETE" });
    if (id === active) open(null);
    loadChats();
  }

  async function send(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setText("");
    setBusy(true);
    const tempId = `local-${Date.now()}`;
    setMessages((m) => [...m, { id: tempId, text: q, answer: null, tickets: [], pending: true }]);
    const res = await fetch("/api/ask", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: q, lang, lesson: about?.n, conversation: active }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    const error = !res ? "errBusy" : res.status === 429 ? "errSlow" : body.error === "profile_incomplete" ? "errProfile" : !res.ok ? "errBusy" : undefined;
    const chatId: string | undefined = body.conversationId;
    setMessages((m) => m.map((x) => (x.id === tempId
      ? { ...x, pending: false, error, answer: error ? null : (body as AskResult), tickets: body.ticketId ? [{ status: "new", reply_learner: null, mentor: null }] : [] }
      : x)));
    setBusy(false);
    if (chatId && chatId !== active) {
      setActive(chatId);
      window.history.replaceState(null, "", `/ask?c=${chatId}`);
    }
    loadChats();
  }

  const day = (s: string) => new Date(s).toLocaleDateString(locale, { day: "numeric", month: "short" });
  const ChatList = (
    <aside className={`chats ${drawer ? "open" : ""}`}>
      <button className="btn" style={{ width: "100%" }} onClick={() => open(null)}>＋ {t("newChat")}</button>
      <div className="chatlist">
        {chats.length === 0 && <p className="b2 mid">{t("noChats")}</p>}
        {chats.map((c) => (
          <div key={c.id} className={`chatitem ${c.id === active ? "on" : ""}`}>
            <button className="chatopen" onClick={() => open(c.id)}>
              <span className="ct">{c.title}</span>
              <span className="b2 mid">{day(c.updated_at)}{c.waiting ? " · ⏳" : ""}</span>
              {c.unread > 0 && <i className="af-dot" style={{ position: "static" }}>{c.unread}</i>}
            </button>
            <button className="chatdel" onClick={() => remove(c.id)} aria-label={t("deleteChat")}>✕</button>
          </div>
        ))}
      </div>
    </aside>
  );

  return (
    <div className="chatwrap">
      {ChatList}
      {drawer && <div className="chatshade" onClick={() => setDrawer(false)} />}
      <section className="chatmain">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <button className="btn sec chatsbtn" onClick={() => setDrawer(true)}>☰ {t("chats")}</button>
        </div>
        {about && (
          <div className="chip" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span>📖 {t("aboutLesson", { n: about.n, title: about.title })}</span>
            <button className="link" onClick={() => setAbout(null)}>{t("clear")}</button>
          </div>
        )}
        <div className="thread" aria-live="polite">
          {messages.length === 0 && (
            <div className="empty">
              <h2 style={{ fontSize: 22 }}>{t("askH")}</h2>
              <p>{t("askP")}</p>
              <div className="sugg" style={{ justifyContent: "center" }}>
                {(about ? [t("aboutSugg1"), t("aboutSugg2")] : list("sugg")).map((s) => <button key={s} onClick={() => send(s)} disabled={busy}>{s}</button>)}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} style={{ display: "contents" }}>
              <div className="bub me">{m.text}</div>
              {m.pending && <div className="bub"><div className="loading"><span className="star">✦</span>{t("searching")}</div></div>}
              {m.error && <div className="bub ref">{t(m.error)}</div>}
              {m.answer && <Answer r={m.answer} questionId={m.answer.questionId ?? (m.id.startsWith("local-") ? undefined : m.id)} feedback={m.feedback ?? null} />}
              {m.tickets?.map((tk, k) => {
                const name = tk.mentor?.name ?? t("yourMentor");
                if (tk.status === "answered" && tk.reply_learner) return <div key={k} className="bub mentor"><b style={{ color: "var(--gold)" }}>{t("replied", { name })}</b><br />{tk.reply_learner}</div>;
                if (tk.status === "claimed") return <div key={k} className="b2" style={{ color: "var(--gold)", paddingInlineStart: 6 }}>🧑‍🏫 {t("handling", { name })}</div>;
                return <div key={k} className="b2 mid" style={{ paddingInlineStart: 6 }}>⏳ {t("waiting")}</div>;
              })}
            </div>
          ))}
          <div ref={end} />
        </div>
        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(text); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={about ? t("aboutPh", { title: about.title }) : t("ph")} aria-label={t("ph")} autoComplete="off" maxLength={1000} />
          <button className="btn" disabled={busy || !text.trim()}>{t("send")}</button>
        </form>
      </section>
    </div>
  );
}

export default function AskPage() {
  return <Suspense><AskInner /></Suspense>;
}
