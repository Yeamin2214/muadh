"use client";
import { ExternalLink, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useApp } from "./AppProvider";
import type { AskResult } from "@/lib/engine";

/** One answer from Mu'adh: sourced sentences, a referral, a hadith check, or a gentle redirect. */
function Helpful({ questionId, initial }: { questionId: string; initial: number | null }) {
  const { t } = useApp();
  const [value, setValue] = useState(initial);
  const send = (v: 1 | -1) => {
    setValue(v);
    fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ questionId, value: v }) }).catch(() => {});
  };
  return (
    <div className="helpful">
      <span>{value ? t("fbThanks") : t("fbQ")}</span>
      <button aria-pressed={value === 1} onClick={() => send(1)} aria-label="Helpful"><ThumbsUp className="ic" aria-hidden="true" /></button>
      <button aria-pressed={value === -1} onClick={() => send(-1)} aria-label="Not helpful"><ThumbsDown className="ic" aria-hidden="true" /></button>
    </div>
  );
}

export default function Answer({ r, questionId, feedback = null }: { r: AskResult; questionId?: string; feedback?: number | null }) {
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
                  {tr && p.kind !== "lesson" && <p style={{ margin: "4px 0 0", fontFamily: "var(--read)" }}>{tr}</p>}
                  {p.grade && <span className="b2" style={{ color: "var(--gold)" }}>{p.grade}</span>}
                </div>
              );
            })}
          </div>
        )}
        {questionId && <Helpful questionId={questionId} initial={feedback} />}
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
        {d?.url && <a className="b2" href={d.url} target="_blank" rel="noreferrer" style={{ color: "var(--gold)", display: "inline-block", marginTop: 8 }}>{t("dorarOpen")} <ExternalLink className="ic" aria-hidden="true" /></a>}
      </div>
    );
  }
  if (r.action === "crisis") return <div className="bub ref"><h3>{t("crisisH")}</h3>{t("crisisP")}</div>;
  if (r.action === "refer") {
    const lowSource = r.reason === "no_source" || r.reason === "low_confidence";
    return <div className="bub ref"><h3>{t(lowSource ? "noSrcH" : "refH")}</h3>{t(lowSource ? "noSrcP" : "refP")}</div>;
  }
  if (r.busy) return <div className="bub ref"><h3>{t("busyH")}</h3>{t("busyP")}</div>;
  return <div className="bub">{t("otherP")}</div>;
}
