"use client";
import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useApp } from "./AppProvider";

type Story = { id: string; title: string; body: string; display_name: string | null; status: string; created_at: string };

/** Admin review of shared stories: nothing is public until an admin publishes it. */
export default function StoriesView() {
  const { t, locale } = useApp();
  const [stories, setStories] = useState<Story[] | null>(null);
  const load = useCallback(() => { fetch("/api/admin/stories").then((r) => r.json()).then((d) => setStories(d.stories ?? [])); }, []);
  useEffect(load, [load]);
  const act = async (id: string, action: "approve" | "reject") => {
    await fetch("/api/admin/stories", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action }) });
    load();
  };
  if (!stories) return <p className="mid">{t("loading")}</p>;
  if (!stories.length) return <p className="mid">{t("adNone")}</p>;
  return (
    <>
      {stories.map((s) => (
        <article key={s.id} className="card appcard">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <b>{s.title}</b>
            <span className={`tagp ${s.status === "approved" ? "ok" : ""}`}>{t(`st_${s.status}`)}</span>
          </div>
          <p className="b2" dir="auto" style={{ whiteSpace: "pre-wrap", margin: 0 }}>{s.body}</p>
          <p className="b2 mid" style={{ margin: 0 }}>{s.display_name ?? t("stAnon")} · {new Date(s.created_at).toLocaleDateString(locale)}</p>
          {s.status === "pending" && (
            <div className="row">
              <button className="btn" onClick={() => act(s.id, "approve")}><Check className="ic" aria-hidden="true" /> {t("stApprove")}</button>
              <button className="btn sec" onClick={() => act(s.id, "reject")}><X className="ic" aria-hidden="true" /> {t("stReject")}</button>
            </div>
          )}
        </article>
      ))}
    </>
  );
}
