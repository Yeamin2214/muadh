"use client";
import { UserRoundCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";

type User = { id: string; name: string | null; email: string; gender: string | null; language: string; lessons: number; questions: number; created_at: string };
type Q = { id: string; text: string; action: string; level: string | null; created_at: string; answer: { sentences?: { text: string }[] } | null; tickets: { status: string; reply_learner: string | null }[] };
type Chat = { id: string; title: string; updated_at: string; questions: Q[] };

/** Admin list of learners, with each learner's chats. */
export default function UsersView() {
  const { t, num, locale } = useApp();
  const [users, setUsers] = useState<User[] | null>(null);
  const [open, setOpen] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [q, setQ] = useState("");
  useEffect(() => { fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users ?? [])).catch(() => setUsers([])); }, []);
  const show = (u: User) => { setOpen(u); setChats(null); fetch(`/api/admin/users/${u.id}`).then((r) => r.json()).then((d) => setChats(d.chats ?? [])); };
  const date = (s: string) => new Date(s).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

  if (!users) return <p className="mid">{t("loading")}</p>;
  const list = users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <input className="field" style={{ maxWidth: 360, margin: 0 }} placeholder={t("usSearch")} value={q} onChange={(e) => setQ(e.target.value)} />
      <section className="card tl" style={{ marginTop: 0 }}>
        <b>{t("usH")} ({num(users.length)})</b>
        <div style={{ overflowX: "auto" }}>
          <table className="mdt"><thead><tr><th>{t("usName")}</th><th>{t("emailL")}</th><th>{t("usLang")}</th><th>{t("usLessons")}</th><th>{t("usQuestions")}</th><th>{t("usJoined")}</th><th /></tr></thead>
            <tbody>{list.map((u) => (
              <tr key={u.id}>
                <td>{u.name ?? "—"} <span className="b2 mid">· {u.gender === "female" ? t("sister") : t("brother")}</span></td>
                <td>{u.email}</td><td>{t(`l_${u.language}`)}</td><td>{num(u.lessons)} / 40</td><td>{num(u.questions)}</td><td>{date(u.created_at)}</td>
                <td><button className="btn sec" style={{ minHeight: 36, padding: "4px 12px" }} onClick={() => show(u)} disabled={!u.questions}>{t("usChats")}</button></td>
              </tr>
            ))}</tbody></table>
        </div>
      </section>
      {open && (
        <div className="ob" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <div className="card obc" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <h2>{open.name} · {t("usChats")}</h2>
            {!chats ? <p className="mid">{t("loading")}</p> : chats.map((c) => (
              <div key={c.id} className="admin-chat">
                <b>{c.title}</b> <span className="b2 mid">· {date(c.updated_at)}</span>
                {c.questions.sort((a, b) => a.created_at.localeCompare(b.created_at)).map((m) => (
                  <div key={m.id} className="admin-msg">
                    <div className="bub me" dir="auto">{m.text}</div>
                    <div className="b2 mid">→ {t(`a_${m.action}`)}{m.level ? ` · Level ${m.level}` : ""}</div>
                    {m.answer?.sentences && <div className="b2" dir="auto">{m.answer.sentences.map((s) => s.text).join(" ")}</div>}
                    {m.tickets?.map((tk, i) => tk.reply_learner && <div key={i} className="b2" style={{ color: "var(--gold)" }} dir="auto"><UserRoundCheck className="ic" aria-hidden="true" /> {tk.reply_learner}</div>)}
                  </div>
                ))}
              </div>
            ))}
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 12 }}><button className="btn" onClick={() => setOpen(null)}>{t("close")}</button></div>
          </div>
        </div>
      )}
    </>
  );
}
