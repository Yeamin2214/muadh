"use client";
import OtpInput from "@/components/OtpInput";
import PasswordInput from "@/components/PasswordInput";
import { GraduationCap, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { useApp } from "./AppProvider";
import { LangSwitch, Logo } from "./Shell";

export default function AuthForm({ mode, audience = "learner" }: { mode: "signup" | "login"; audience?: "learner" | "mentor" | "admin" }) {
  const { t, lang, refresh } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");
  const [info, setInfo] = useState("");
  const signup = mode === "signup";
  const mentor = audience === "mentor";
  const admin = audience === "admin";

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
      if (msg.includes("confirm")) {
        // Signed up earlier but never entered the code: send a fresh one.
        await supabase.auth.resend({ type: "signup", email });
        return setStage("verify");
      }
      return setError(msg.includes("registered") ? t("errTaken") : signup ? t("errGeneric") : t("errLogin"));
    }
    if (signup && !result.data.session) return setStage("verify");
    if (!signup && result.data.user) {
      const { data: p } = await supabase.from("profiles").select("role").eq("id", result.data.user.id).single();
      const role = p?.role ?? "learner";
      const allowed = admin ? role === "admin" : mentor ? role === "mentor" || role === "applicant" : role === "learner";
      if (!allowed) {
        await supabase.auth.signOut();
        return setError(t(role === "admin" ? "errUseAdmin" : role === "learner" ? "errUseLearner" : "errUseMentor"));
      }
    }
    await refresh();
    router.replace(signup ? "/onboarding" : admin ? "/admin" : mentor ? "/mentors/status" : "/dashboard");
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

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error: err } = await browserClient().auth.verifyOtp({ email, token: code.trim(), type: "email" });
    setBusy(false);
    if (err) return setError(t("vWrong"));
    await refresh();
    router.replace("/onboarding");
  }

  async function resend() {
    setError("");
    const { error: err } = await browserClient().auth.resend({ type: "signup", email });
    setInfo(err ? t("fpErr") : t("vResent"));
  }

  if (stage === "verify") {
    return (
      <div className="auth">
        <div className="auth-art" aria-hidden="true" />
        <div className="auth-side">
          <div className="row" style={{ justifyContent: "space-between" }}><Logo /><LangSwitch /></div>
          <form className="auth-form" onSubmit={verify}>
            <h1>{t("vH")}</h1>
            <p className="mid">{t("vP", { email })}</p>
            <OtpInput value={code} onChange={setCode} />
            {error && <p className="err" role="alert">{error}</p>}
            {info && <p className="b2" style={{ color: "var(--gold)", margin: 0 }}>{info}</p>}
            <button className="btn" disabled={busy || code.length < 6} style={{ width: "100%" }}>{busy ? t("loading") : t("vBtn")}</button>
            <button type="button" className="link b2" onClick={resend} style={{ alignSelf: "center" }}>{t("vResend")}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth-art" aria-hidden="true" />
      <div className="auth-side">
        <div className="row" style={{ justifyContent: "space-between" }}><Logo /><LangSwitch /></div>
        <form className="auth-form" onSubmit={submit} noValidate>
          <h1>{t(admin ? "alH" : mentor ? "mlH" : signup ? "signupH" : "loginH")}</h1>
          <p className="mid">{t(admin ? "alP" : mentor ? "mlP" : signup ? "signupP" : "loginP")}</p>
          {admin && <p className="chip" style={{ marginTop: 0 }}>{t("alDemo")}: admin@muadh.app · admin123</p>}
          {signup && (
            <label>{t("nameL")}<input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" required /></label>
          )}
          <label>{t("emailL")}<input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
          <label>{t("passL")}<PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} placeholder={t("passHint")} required /></label>
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
          {!signup && <Link href="/forgot" className="b2" style={{ color: "var(--gold)", alignSelf: "flex-end", marginTop: -6 }}>{t("fpLink")}</Link>}
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn" disabled={busy} style={{ width: "100%" }}>{busy ? t("loading") : t(signup ? "create" : "signIn")}</button>
          {admin ? null : mentor ? (
            <><p className="b2 mid" style={{ textAlign: "center" }}>{t("mlNoAcc")} <Link href="/mentors/apply" style={{ color: "var(--gold)" }}>{t("mlApply")}</Link></p>
          <div className="mentor-link">{t("learnerQ")} <Link href="/user/login">{t("learnerLogin")}</Link></div></>
          ) : (
            <p className="b2 mid" style={{ textAlign: "center" }}>
              {t(signup ? "haveAcc" : "noAcc")}{" "}
              <Link href={signup ? "/user/login" : "/signup"} style={{ color: "var(--gold)" }}>{t(signup ? "signIn" : "signUpLink")}</Link>
            </p>
          )}
          {!admin && <div className="demo-box">
            <p className="b2 mid" style={{ margin: 0 }}>{t("demoH")}</p>
            <div className="row">
              {!mentor && <button type="button" className="btn sec" onClick={() => demo("learner")} disabled={busy}><GraduationCap className="ic" aria-hidden="true" /> {t("demoLearner")}</button>}
              <button type="button" className="btn sec" onClick={() => demo("mentor")} disabled={busy}><UserRoundCheck className="ic" aria-hidden="true" /> {t("demoMentor")}</button>
            </div>
            <button type="button" className="link b2" onClick={() => demo("mentor_f")} disabled={busy}>{t("demoMentorF")}</button>
          </div>}
          {!mentor && !admin && (
            <div className="mentor-link">{t("authMentorQ")}{" "}
              <Link href="/mentor/login">{t("mLoginBtn")}</Link> · <Link href="/mentors/apply">{t("mApplyBtn")}</Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
