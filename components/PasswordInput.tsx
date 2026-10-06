"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useApp } from "./AppProvider";

/** A password field with a show / hide button. */
export default function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { t } = useApp();
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input {...props} type={show ? "text" : "password"} className={`field ${props.className ?? ""}`} />
      <button type="button" className="pw-eye" onClick={() => setShow(!show)} aria-label={show ? t("pwHide") : t("pwShow")} aria-pressed={show}>
        {show ? <EyeOff className="ic" aria-hidden="true" /> : <Eye className="ic" aria-hidden="true" />}
      </button>
    </div>
  );
}
