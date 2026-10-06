"use client";
import { useState } from "react";
import { useApp } from "./AppProvider";

/** A learner shares how they came to Islam. Published only after review. */
export default function StoryShare() {
  const { t } = useApp();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showName, setShowName] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  async function send() {
    setState("busy");
    const res = await fetch("/api/stories", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, body, showName }) }).catch(() => null);
    const body2 = res ? await res.json().catch(() => ({})) : {};
    setState(res?.ok ? "sent" : "error");
    if (!res?.ok) setErr(body2.error === "too_short" ? t("stShort") : res?.status === 500 ? t("stNotReady") : t("errGeneric"));
  }
  if (state === "sent") return <section className="card tl"><b>{t("stShareH")}</b><p className="mid">{t("stSent")}</p></section>;
  return (
    <section className="card tl">
      <b>{t("stShareH")}</b>
      <p className="b2 mid" style={{ margin: "4px 0 0" }}>{t("stShareP")}</p>
      <label className="setrow">{t("stTitle")}<input className="field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} dir="auto" /></label>
      <label className="setrow">{t("stBody")}<textarea className="field" rows={6} value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} dir="auto" />
        <span className="b2 mid" style={{ fontWeight: 400 }}>{body.trim().length < 30 ? t("stMin", { n: 30 - body.trim().length }) : `${body.trim().length} / 5000`}</span></label>
      <div className="agree" style={{ marginTop: 12 }}>
        <input id="showName" type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
        <label htmlFor="showName">{t("stName")}</label>
      </div>
      {state === "error" && <p className="err">{err}</p>}
      <button className="btn" style={{ marginTop: 12 }} onClick={send} disabled={state === "busy" || title.trim().length < 3 || body.trim().length < 30}>{state === "busy" ? t("saving") : t("stSend")}</button>
    </section>
  );
}
