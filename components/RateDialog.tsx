"use client";
import { useState } from "react";
import { useApp } from "./AppProvider";

function Stars({ value, onChange, label, big }: { value: number; onChange: (n: number) => void; label: string; big?: boolean }) {
  return (
    <div className="ratefield">
      <span>{label}</span>
      <div className={`stars ${big ? "big" : ""}`} role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n}`} className={n <= value ? "on" : ""} onClick={() => onChange(n)}>★</button>
        ))}
      </div>
    </div>
  );
}

/** "Rate Mu'adh": overall stars, three quick aspects and an optional comment. */
export default function RateDialog({ onClose, onDone }: { onClose: () => void; onDone?: () => void }) {
  const { t } = useApp();
  const [r, setR] = useState({ overall: 0, ease: 0, trust: 0, useful: 0 });
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function submit() {
    if (!r.overall) return;
    setState("busy");
    const res = await fetch("/api/rating", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ overall: r.overall, ease: r.ease || null, trust: r.trust || null, useful: r.useful || null, comment }),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
    if (res?.ok) onDone?.();
  }

  return (
    <div className="ob" role="dialog" aria-modal="true" aria-label={t("rtH")} onClick={onClose}>
      <div className="card obc" onClick={(e) => e.stopPropagation()}>
        {state === "done" ? (
          <>
            <h2>{t("rtThanks")}</h2>
            <p className="mid">{t("rtThanksP")}</p>
            <div className="row" style={{ justifyContent: "flex-end" }}><button className="btn" onClick={onClose} autoFocus>{t("close")}</button></div>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: 4 }}>{t("rtH")}</h2>
            <p className="b2 mid" style={{ margin: "0 0 14px" }}>{t("rtP")}</p>
            <Stars big label={t("rtOverall")} value={r.overall} onChange={(n) => setR({ ...r, overall: n })} />
            <Stars label={t("rtEase")} value={r.ease} onChange={(n) => setR({ ...r, ease: n })} />
            <Stars label={t("rtTrust")} value={r.trust} onChange={(n) => setR({ ...r, trust: n })} />
            <Stars label={t("rtUseful")} value={r.useful} onChange={(n) => setR({ ...r, useful: n })} />
            <textarea className="field" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("rtComment")} style={{ marginTop: 12 }} dir="auto" />
            {state === "error" && <p className="err">{t("errGeneric")}</p>}
            <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
              <button className="btn sec" onClick={onClose}>{t("close")}</button>
              <button className="btn" onClick={submit} disabled={!r.overall || state === "busy"}>{state === "busy" ? t("saving") : t("rtSend")}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
