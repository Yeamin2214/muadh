"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { useApp } from "@/components/AppProvider";
import { LangSwitch, Logo } from "@/components/Shell";

/** Forgot password: a 6-digit code by email; if it matches, set a new password. */
export default function Forgot() {
  const { t, refresh } = useApp();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setBusy(true);
    const { error: err } = await browserClient().auth.resetPasswordForEmail(email.trim());
    setBusy(false);
    if (err) return setError(t("fpErr"));
    setStep("code");
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError(t("errPass"));
    setBusy(true);
    const supabase = browserClient();
    const { error: codeErr } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "recovery" });
    if (codeErr) { setBusy(false); return setError(t("vWrong")); }
    const { error: passErr } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (passErr) return setError(t("errGeneric"));
    await refresh();
    router.replace("/dashboard"); // the app then sends mentors and admins to their own pages
  }

  return (
    <div className="mentor-auth" style={{ maxWidth: 520 }}>
      <div className="row" style={{ justifyContent: "space-between" }}><Logo /><LangSwitch /></div>
      {step === "email" ? (
        <form className="card apply" onSubmit={sendCode}>
          <h1>{t("fpH")}</h1>
          <p className="mid" style={{ margin: 0 }}>{t("fpP")}</p>
          <label>{t("emailL")}<input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
          {error && <p className="err">{error}</p>}
          <button className="btn" disabled={busy || !email}>{busy ? t("saving") : t("fpSend")}</button>
          <Link href="/login" className="b2" style={{ color: "var(--gold)" }}>{t("signIn")}</Link>
        </form>
      ) : (
        <form className="card apply" onSubmit={reset}>
          <h1>{t("rpH")}</h1>
          <p className="mid" style={{ margin: 0 }}>{t("fpCodeP", { email })}</p>
          <label>{t("vCode")}<input className="field code-input" inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} autoFocus /></label>
          <label>{t("rpNew")}<input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("passHint")} autoComplete="new-password" /></label>
          {error && <p className="err">{error}</p>}
          <button className="btn" disabled={busy || code.length < 6}>{busy ? t("saving") : t("rpSave")}</button>
          <button type="button" className="link b2" onClick={() => sendCode()}>{t("vResend")}</button>
        </form>
      )}
    </div>
  );
}
