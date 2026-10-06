"use client";
import { useRef } from "react";

/** A 6-digit code in six boxes. Typing moves forward, backspace moves back, and pasting a full code fills every box. */
export default function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const set = (i: number, d: string) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join("").slice(0, 6));
  };
  return (
    <div className="otp" dir="ltr" onPaste={(e) => {
      const code = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (code) { e.preventDefault(); onChange(code); refs.current[Math.min(code.length, 5)]?.focus(); }
    }}>
      {digits.map((d, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }} className="otp-box" inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1} value={d} aria-label={`Digit ${i + 1}`} autoFocus={i === 0}
          onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(-1); set(i, v); if (v && i < 5) refs.current[i + 1]?.focus(); }}
          onKeyDown={(e) => { if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus(); }} />
      ))}
    </div>
  );
}
