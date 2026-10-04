"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { useApp } from "./AppProvider";
import { LangSwitch, Logo } from "./Shell";

export default function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const { t, lang, refresh } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (signup && !name.trim()) return setError(t("errName"));
    if (signup && !gender) return setError(t("errGender"));
    if (password.length < 8) return setError(t("errPass"));
    setBusy(true);
    const supabase = browserClient();
    const result = signup
      ? await supabase.auth.signUp({ email, password, options: { data: { name: name.trim(), gender, language: lang } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) {
      const msg = result.error.message.toLowerCase();
      return setError(msg.includes("registered") ? t("errTaken") : msg.includes("confirm") ? t("errConfirm") : signup ? t("errGeneric") : t("errLogin"));
    }
    if (signup && !result.data.session) return setError(t("errConfirm"));
    await refresh();
    router.replace(signup ? "/onboarding" : "/");
  }

  async function demo(role: "learner" | "mentor" | "mentor_f") {
    setError("");
    setBusy(true);
    const res = await fetch("/api/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ role }) });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(t("demoFail"));
    await refresh();
    router.replace(body.to);
  }

  return (
    <div className="auth">
      <div className="auth-art" aria-hidden="true" />
      <div className="auth-side">
        <div className="row" style={{ justifyContent: "space-between" }}><Logo /><LangSwitch /></div>
        <form className="auth-form" onSubmit={submit} noValidate>
          <h1>{t(signup ? "signupH" : "loginH")}</h1>
          <p className="mid">{t(signup ? "signupP" : "loginP")}</p>
          {signup && (
            <label>{t("nameL")}<input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" required /></label>
          )}
          <label>{t("emailL")}<input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
          <label>{t("passL")}<input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} placeholder={t("passHint")} required /></label>
          {signup && (
            <fieldset className="gender">
              <legend>{t("genderQ")}</legend>
              <div className="opts inline" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <button type="button" className="opt" aria-pressed={gender === "male"} onClick={() => setGender("male")}>{t("brother")}</button>
                <button type="button" className="opt" aria-pressed={gender === "female"} onClick={() => setGender("female")}>{t("sister")}</button>
              </div>
              <p className="b2 mid" style={{ margin: 0 }}>{t("genderWhy")}</p>
            </fieldset>
          )}
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn" disabled={busy} style={{ width: "100%" }}>{busy ? t("loading") : t(signup ? "create" : "signIn")}</button>
          <p className="b2 mid" style={{ textAlign: "center" }}>
            {t(signup ? "haveAcc" : "noAcc")}{" "}
            <Link href={signup ? "/login" : "/signup"} style={{ color: "var(--gold)" }}>{t(signup ? "signIn" : "signUpLink")}</Link>
          </p>
          <div className="demo-box">
            <p className="b2 mid" style={{ margin: 0 }}>{t("demoH")}</p>
            <div className="row">
              <button type="button" className="btn sec" onClick={() => demo("learner")} disabled={busy}>🎓 {t("demoLearner")}</button>
              <button type="button" className="btn sec" onClick={() => demo("mentor")} disabled={busy}>🧑‍🏫 {t("demoMentor")}</button>
            </div>
            <button type="button" className="link b2" onClick={() => demo("mentor_f")} disabled={busy}>{t("demoMentorF")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
