"use client";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { useApp, useProfile } from "@/components/AppProvider";
import { LangSwitch } from "@/components/Shell";
import { METHODS, activeMethod, prayerSettings, savedPlace, type MethodKey } from "@/lib/client/prayer";

/** Profile and preferences. Learners can change everything they told us during onboarding. */
export default function Settings() {
  const profile = useProfile();
  const { t, list, refresh, signOut } = useApp();
  const [name, setName] = useState(profile.name ?? "");
  const [read, setRead] = useState(profile.reads_arabic ?? 0);
  const [work, setWork] = useState(profile.work_pattern ?? 0);
  const [contact, setContact] = useState(false);
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [method, setMethod] = useState(() => (typeof window === "undefined" ? "auto" : prayerSettings().method));
  const [asr, setAsr] = useState(() => (typeof window === "undefined" ? "auto" : prayerSettings().asr));
  const auto = typeof window === "undefined" ? null : activeMethod({ ...savedPlace(), located: true });
  const choosePrayer = (m: string, a: string) => {
    setMethod(m as MethodKey | "auto"); setAsr(a as "auto" | "standard" | "hanafi");
    try { localStorage.setItem("muadh.method", m); localStorage.setItem("muadh.asr", a); } catch { /* ignore */ }
  };
  const [busy, setBusy] = useState(false);
  const learner = profile.role === "learner";

  async function save() {
    setBusy(true);
    const update: Record<string, unknown> = { name: name.trim() || profile.name };
    if (learner) Object.assign(update, { reads_arabic: read, work_pattern: work, phone_consent: contact && phone.trim().length > 5, phone: contact ? phone.trim() : null });
    await browserClient().from("profiles").update(update).eq("id", profile.id);
    await refresh();
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <section className="card tl" style={{ marginTop: 0 }}>
        <b>{t("setProfile")}</b>
        <label className="setrow">{t("setName")}<input className="field" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <div className="setrow">{t("setLang")}<LangSwitch /></div>
        {learner && (
          <>
            <div className="setrow">{t("setRead")}
              <div className="opts inline">{list("readA").map((a, i) => <button key={a} className="opt" aria-pressed={read === i} onClick={() => setRead(i)}>{a}</button>)}</div>
            </div>
            <div className="setrow">{t("setWork")}
              <div className="opts inline">{list("workA").map((a, i) => <button key={a} className="opt" aria-pressed={work === i} onClick={() => setWork(i)}>{a}</button>)}</div>
            </div>
            <label className="setrow check"><input type="checkbox" checked={contact} onChange={(e) => setContact(e.target.checked)} /> {t("setPhone")}</label>
            {contact && <input className="field" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("setPhoneNum")} />}
          </>
        )}
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn" onClick={save} disabled={busy}>{busy ? t("saving") : t("setSave")}</button>
          {saved && <span className="chip" style={{ marginTop: 0 }}>✓ {t("setSaved")}</span>}
        </div>
      </section>
      {learner && (
        <section className="card tl">
          <b>{t("setPrayer")}</b>
          <p className="b2 mid" style={{ margin: "4px 0 0" }}>{t("setPrayerP")}</p>
          <label className="setrow">{t("setMethod")}
            <select className="field" value={method} onChange={(e) => choosePrayer(e.target.value, asr)}>
              <option value="auto">{t("setAuto")}{auto ? ` (${METHODS[auto.method]})` : ""}</option>
              {(Object.keys(METHODS) as MethodKey[]).map((k) => <option key={k} value={k}>{METHODS[k]}</option>)}
            </select>
          </label>
          <label className="setrow">{t("setAsr")}
            <select className="field" value={asr} onChange={(e) => choosePrayer(method, e.target.value)}>
              <option value="auto">{t("setAuto")}{auto ? ` (${auto.hanafi ? "Hanafi" : t("setStandard")})` : ""}</option>
              <option value="standard">{t("setStandard")}</option>
              <option value="hanafi">Hanafi</option>
            </select>
          </label>
          {auto && <p className="b2 mid" style={{ margin: "8px 0 0" }}>🕒 {auto.tz}</p>}
        </section>
      )}
      <section className="card tl">
        <b>{t("setAccount")}</b>
        <p className="b2 mid">{profile.name} · {learner ? (profile.gender === "female" ? t("sister") : t("brother")) : t("roleMentor")}</p>
        <button className="btn sec" onClick={signOut}>↩ {t("signOut")}</button>
      </section>
    </div>
  );
}
