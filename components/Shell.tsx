"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./AppProvider";
import type { Lang } from "@/lib/client/text-app";

const TABS = [
  { href: "/", key: "navHome", icon: "M4 21V10.5C4 6.5 7.6 3.6 12 2c4.4 1.6 8 4.5 8 8.5V21zM9 21v-5a3 3 0 0 1 6 0v5" },
  { href: "/lessons", key: "navLessons", icon: "M3 5h6a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H3zM21 5h-6a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H21z" },
  { href: "/ask", key: "navAsk", icon: "M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" },
  { href: "/duas", key: "navDuas", icon: "M8 21c-2.5-3-3.5-6.5-2.5-10.5L7.5 4l2.8 1-1 6M16 21c2.5-3 3.5-6.5 2.5-10.5L16.5 4l-2.8 1 1 6" },
  { href: "/qibla", key: "navQibla", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5.5-5.5 2 2-5.5z" },
];

export function LangSwitch() {
  const { lang, setLang } = useApp();
  const opts: [Lang, string][] = [["en", "EN"], ["ar", "عربي"], ["bn", "বাংলা"]];
  return (
    <div className="langs" role="group" aria-label="Language">
      {opts.map(([l, label]) => (
        <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{label}</button>
      ))}
    </div>
  );
}

export function Logo() {
  return (
    <Link className="logo" href="/">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 29V15C5 8.4 10 4 16 2c6 2 11 6.4 11 13v14z" fill="none" stroke="#D4AF37" strokeWidth="2.2" />
        <path d="M11 29v-9c0-3 2.2-5.4 5-6.6 2.8 1.2 5 3.6 5 6.6v9" fill="none" stroke="#F5F5F5" strokeWidth="2.2" />
      </svg>
      Mu&apos;adh <span className="ar-text" lang="ar">معاذ</span>
    </Link>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const { t, profile, signOut } = useApp();
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const isMentor = profile?.role === "mentor" || profile?.role === "admin";
  return (
    <>
      <header>
        <div className="wrap bar">
          <Logo />
          <nav className="links" aria-label="Main">
            {TABS.map((tab) => (
              <Link key={tab.href} href={tab.href} aria-current={active(tab.href) ? "page" : undefined}>{t(tab.key)}</Link>
            ))}
          </nav>
          <LangSwitch />
          {isMentor && <Link className="pill-out" href="/mentor">{t("portalShort")}</Link>}
          <button className="pill-out" onClick={signOut}>{t("signOut")}</button>
        </div>
      </header>
      <main className="wrap">{children}</main>
      <nav className="tabbar" aria-label="Main">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href} aria-current={active(tab.href) ? "page" : undefined}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={tab.icon} /></svg>
            <span>{t(tab.key)}</span>
          </Link>
        ))}
      </nav>
    </>
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
