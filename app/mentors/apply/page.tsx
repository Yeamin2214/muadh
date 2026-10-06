"use client";
import PasswordInput from "@/components/PasswordInput";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { useApp } from "@/components/AppProvider";
import { LangSwitch, Logo } from "@/components/Shell";
import PhoneInput from "@/components/PhoneInput";

const LANGUAGES = ["Arabic", "English", "Bangla", "Urdu", "Other"];

/** Mentor application: creates an "applicant" account (never a mentor) and saves the details for admin review. */
export default function MentorApply() {
  const { t, lang, profile, refresh, signOut } = useApp();
  const router = useRouter();
  const resubmit = profile?.role === "applicant";
  const [f, setF] = useState({ full_name: "", email: "", password: "", phone: "", location: "", organisation: "", position: "", qualifications: "", experience_years: "" });
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [langs, setLangs] = useState<string[]>(["Arabic"]);
  const [agreed, setAgreed] = useState(false);
  const [docs, setDocs] = useState<(File | null)[]>([null, null, null]);
  const uploadDocs = async () => {
    const files = docs.filter((f): f is File => !!f);
    if (!files.length) return;
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    await fetch("/api/mentors/docs", { method: "POST", body: form }).catch(() => null);
  };
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  if (profile && profile.role !== "applicant") {
    return (
      <div className="ob" style={{ background: "var(--s1)" }}><div className="card obc">
        <p className="lead">{t("maLearnerAcc")}</p>
        <button className="btn" onClick={signOut}>{t("signOut")}</button>
      </div></div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const accountOk = resubmit || (f.email && f.password.length >= 8 && gender);
    if (!accountOk || !f.full_name.trim() || !f.phone.trim() || !f.organisation.trim() || !f.qualifications.trim() || !agreed) {
      return setError(f.password && f.password.length < 8 ? t("errPass") : t("maMissing"));
    }
    setBusy(true);
    if (!resubmit) {
      const res = await fetch("/api/mentors/register", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...f, gender, languages: langs, agreed, language: lang }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) { setBusy(false); return setError(body.error === "taken" ? t("errTaken") : body.error === "missing_fields" ? t("maMissing") : t("errGeneric")); }
      await browserClient().auth.signInWithPassword({ email: f.email, password: f.password });
      await uploadDocs();
      await refresh();
      return router.replace("/mentors/status");
    }
    const res = await fetch("/api/mentors/apply", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...f, languages: langs, agreed }),
    });
    if (res.ok) await uploadDocs();
    setBusy(false);
    if (!res.ok) return setError(t("errGeneric"));
    await refresh();
    router.replace("/mentors/status");
  }

  return (
    <div className="mentor-auth">
      <div className="row" style={{ justifyContent: "space-between" }}><Logo /><LangSwitch /></div>
      <form className="card apply" onSubmit={submit} noValidate>
        <h1>{t("maH")}</h1>
        <p className="mid" style={{ margin: 0 }}>{t("maP")}</p>

        {!resubmit && (
          <fieldset><legend>{t("maAccount")}</legend>
            <label>{t("maFull")} *<input className="field" value={f.full_name} onChange={set("full_name")} autoComplete="name" /></label>
            <label>{t("emailL")} *<input className="field" type="email" value={f.email} onChange={set("email")} autoComplete="email" /></label>
            <label>{t("passL")} *<PasswordInput value={f.password} onChange={set("password")} placeholder={t("passHint")} autoComplete="new-password" /></label>
            <div className="lbl">{t("genderQ")} *</div>
            <div className="opts inline" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <button type="button" className="opt" aria-pressed={gender === "male"} onClick={() => setGender("male")}>{t("brother")}</button>
              <button type="button" className="opt" aria-pressed={gender === "female"} onClick={() => setGender("female")}>{t("sister")}</button>
            </div>
            <p className="b2 mid" style={{ margin: 0 }}>{t("maGenderWhy")}</p>
          </fieldset>
        )}
        {resubmit && <label>{t("maFull")} *<input className="field" value={f.full_name} onChange={set("full_name")} /></label>}

        <fieldset><legend>{t("maContact")}</legend>
          <div className="lbl">{t("maPhone")} *</div>
          <PhoneInput value={f.phone} onChange={(v) => setF((x) => ({ ...x, phone: v }))} />
          <label>{t("maLocation")}<input className="field" value={f.location} onChange={set("location")} /></label>
        </fieldset>

        <fieldset><legend>{t("maBackground")}</legend>
          <label>{t("maOrg")} *<input className="field" value={f.organisation} onChange={set("organisation")} /></label>
          <label>{t("maPos")}<input className="field" value={f.position} onChange={set("position")} /></label>
          <div className="lbl">{t("maLangs")}</div>
          <div className="chips">
            {LANGUAGES.map((l) => (
              <button type="button" key={l} className="opt" aria-pressed={langs.includes(l)}
                onClick={() => setLangs(langs.includes(l) ? langs.filter((x) => x !== l) : [...langs, l])}>{l}</button>
            ))}
          </div>
          <label>{t("maQual")} *<textarea className="field" rows={4} value={f.qualifications} onChange={set("qualifications")} placeholder={t("maQualPh")} /></label>
          <label>{t("maExp")}<input className="field" type="number" min={0} max={60} value={f.experience_years} onChange={set("experience_years")} /></label>
        </fieldset>

        <fieldset><legend>{t("docsH")}</legend>
          <p className="b2 mid" style={{ margin: 0 }}>{t("docsP")}</p>
          {docs.map((_, i) => (
            <input key={i} className="field" type="file" accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => setDocs((d) => d.map((x, k) => (k === i ? e.target.files?.[0] ?? null : x)))} />
          ))}
        </fieldset>

        <div className="agree">
          <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <label htmlFor="agree">{t("maAgree")} *</label>
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn" disabled={busy} style={{ width: "100%" }}>{busy ? t("saving") : t("maSubmit")}</button>
        {!resubmit && <p className="b2 mid" style={{ textAlign: "center" }}>{t("haveAcc")} <Link href="/mentor/login" style={{ color: "var(--gold)" }}>{t("mLoginBtn")}</Link></p>}
      </form>
    </div>
  );
}
