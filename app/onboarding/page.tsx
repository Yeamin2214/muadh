"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { useApp } from "@/components/AppProvider";
import { LangSwitch } from "@/components/Shell";

/** Three short questions after sign-up. Everything is self-reported; nothing is guessed. */
export default function Onboarding() {
  const { t, list, num, profile, loading, refresh } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [read, setRead] = useState<number | null>(null);
  const [work, setWork] = useState<number | null>(null);
  const [contact, setContact] = useState<boolean | null>(null);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !profile) router.replace("/login");
  }, [loading, profile, router]);

  async function finish() {
    if (!profile) return;
    setBusy(true);
    await browserClient().from("profiles").update({
      reads_arabic: read ?? 0,
      work_pattern: work ?? 0,
      phone_consent: contact === true && phone.trim().length > 5,
      phone: contact === true ? phone.trim() : null,
    }).eq("id", profile.id);
    await refresh();
    router.replace("/dashboard");
  }

  const steps = [
    <div key="read">
      <h2>{t("ob3H")}</h2><p className="mid">{t("ob3P")}</p>
      <div style={{ marginTop: 16, fontWeight: 600 }}>{t("readQ")}</div>
      <div className="opts inline">{list("readA").map((a, i) => <button key={a} className="opt" aria-pressed={read === i} onClick={() => setRead(i)}>{a}</button>)}</div>
      <div style={{ fontWeight: 600 }}>{t("workQ")}</div>
      <div className="opts inline">{list("workA").map((a, i) => <button key={a} className="opt" aria-pressed={work === i} onClick={() => setWork(i)}>{a}</button>)}</div>
    </div>,
    <div key="phone">
      <h2>{t("phoneQ")}</h2><p className="mid">{t("phoneOpt")}</p>
      <div className="opts">
        <button className="opt" aria-pressed={contact === true} onClick={() => setContact(true)}>{t("phoneYes")}</button>
        <button className="opt" aria-pressed={contact === false} onClick={() => setContact(false)}>{t("phoneNo")}</button>
      </div>
      {contact && <><input className="field" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("phoneL")} autoComplete="tel" /><p className="b2 mid">{t("phoneNote")}</p></>}
    </div>,
    <div key="done"><h2>{t("ob4H")}</h2><p className="mid">{t("ob4P")}</p></div>,
  ];

  return (
    <div className="ob" style={{ background: "var(--s1)" }}>
      <div className="card obc">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="stepn">{t("obStep")} {num(step + 1)} {t("obOf")} {num(steps.length)}</span><LangSwitch />
        </div>
        {steps[step]}
        <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
          {step > 0 ? <button className="btn sec" onClick={() => setStep(step - 1)}>{t("prev")}</button> : <span />}
          {step < steps.length - 1
            ? <button className="btn" onClick={() => setStep(step + 1)}>{t("next")}</button>
            : <button className="btn" onClick={finish} disabled={busy}>{busy ? t("saving") : t("start")}</button>}
        </div>
      </div>
    </div>
  );
}
