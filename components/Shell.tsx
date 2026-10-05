"use client";
import Link from "next/link";
import { useApp } from "./AppProvider";
import type { Lang } from "@/lib/client/text-app";

export function LangSwitch() {
  const { lang, setLang } = useApp();
  const opts: [Lang, string][] = [["en", "EN"], ["ar", "عربي"], ["bn", "বাংলা"]];
  return (
    <div className="langs" role="group" aria-label="Language">
      {opts.map(([l, label]) => <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{label}</button>)}
    </div>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link className="logo" href={href}>
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 29V15C5 8.4 10 4 16 2c6 2 11 6.4 11 13v14z" fill="none" stroke="#D4AF37" strokeWidth="2.2" />
        <path d="M11 29v-9c0-3 2.2-5.4 5-6.6 2.8 1.2 5 3.6 5 6.6v9" fill="none" stroke="#F5F5F5" strokeWidth="2.2" />
      </svg>
      Mu&apos;adh <span className="ar-text" lang="ar">معاذ</span>
    </Link>
  );
}

export function Modal({ title, onClose, children, closeLabel }: { title: string; onClose: () => void; children: React.ReactNode; closeLabel: string }) {
  return (
    <div className="ob" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="card obc" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: 12 }}>{title}</h2>
        {children}
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 18 }}>
          <button className="btn" onClick={onClose} autoFocus>{closeLabel}</button>
        </div>
      </div>
    </div>
  );
}
