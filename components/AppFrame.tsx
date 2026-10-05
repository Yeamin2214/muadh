"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "./AppProvider";
import { LangSwitch, Logo } from "./Shell";
import RateDialog from "./RateDialog";
import AuthForm from "./AuthForm";

const ICONS: Record<string, string> = {
  dashboard: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  lessons: "M3 5h6a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H3zM21 5h-6a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H21z",
  ask: "M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
  duas: "M8 21c-2.5-3-3.5-6.5-2.5-10.5L7.5 4l2.8 1-1 6M16 21c2.5-3 3.5-6.5 2.5-10.5L16.5 4l-2.8 1 1 6",
  qibla: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5.5-5.5 2 2-5.5z",
  mentor: "M4 6h16v10H8l-4 4zM8 10h8M8 13h5",
  admin: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
};
const LEARNER_NAV = [["/dashboard", "dashboard", "navDash"], ["/lessons", "lessons", "navLessons"], ["/ask", "ask", "navAsk"], ["/duas", "duas", "navDuas"], ["/qibla", "qibla", "navQibla"]];
const MENTOR_NAV = [["/mentor", "mentor", "mTitle"], ["/settings", "settings", "navSettings"]];
const MENTOR_PAGES = ["/mentor", "/settings"];
const ADMIN_NAV = [["/admin", "admin", "adminNav"], ["/settings", "settings", "navSettings"]];
const ADMIN_PAGES = ["/admin", "/settings"];

const Icon = ({ name }: { name: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} /></svg>
);

function useClickOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const on = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    document.addEventListener("mousedown", on);
    return () => document.removeEventListener("mousedown", on);
  }, [open, close]);
  return ref;
}

type Alert = { href: string; text: string };

/** The signed-in app: sidebar on desktop, tabs on mobile, a top bar with notifications and the profile menu. */
export default function AppFrame({ children }: { children: React.ReactNode }) {
  const { profile, loading, t, signOut } = useApp();
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState<"" | "bell" | "user">("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rating, setRating] = useState(false);
  const close = () => setMenu("");
  const bellRef = useClickOutside(menu === "bell", close);
  const userRef = useClickOutside(menu === "user", close);
  const isMentor = profile?.role === "mentor" || profile?.role === "admin";
  const needsOnboarding = profile?.role === "learner" && profile.reads_arabic === null;
  // Each role stays on its own pages: mentors only see the portal and settings; learners never see the portal.
  const applicant = profile?.role === "applicant";
  const admin = profile?.role === "admin";
  const allowed = admin ? ADMIN_PAGES : isMentor ? MENTOR_PAGES : null;
  const wrongPage = !!profile && (applicant || (allowed ? !allowed.some((p) => path.startsWith(p)) : path.startsWith("/mentor") || path.startsWith("/admin")));

  useEffect(() => {
    if (loading) return;
    if (!profile) { if (!path.startsWith("/admin")) router.replace("/login"); }
    else if (needsOnboarding) router.replace("/onboarding");
    else if (applicant) router.replace("/mentors/status");
    else if (wrongPage) router.replace(admin ? "/admin" : isMentor ? "/mentor" : "/dashboard");
  }, [loading, profile, needsOnboarding, wrongPage, applicant, isMentor, router]);

  // Notifications: new mentor replies for learners, new questions for mentors.
  useEffect(() => {
    if (!profile || needsOnboarding) return;
    const load = async () => {
      if (isMentor) {
        const r = await fetch("/api/mentor/tickets?view=open").then((x) => (x.ok ? x.json() : null)).catch(() => null);
        const fresh = (r?.tickets ?? []).filter((x: { status: string }) => x.status === "new");
        setAlerts(fresh.slice(0, 6).map((x: { id: string; reason: string; urgent: boolean; learner: { name: string | null } | null }) => ({
          href: `/mentor?t=${(x as unknown as { id: string }).id}`,
          text: `${x.urgent ? "🔴 " : ""}${t("bellNewQ", { name: x.learner?.name ?? "—" })} · ${t(`r_${x.reason}`)}`,
        })));
      } else {
        const r = await fetch("/api/conversations").then((x) => (x.ok ? x.json() : null)).catch(() => null);
        const unread = (r?.conversations ?? []).filter((c: { unread: number }) => c.unread > 0);
        setAlerts(unread.map((c: { id: string; title: string }) => ({ href: `/ask?c=${c.id}`, text: `${t("bellReply")}: ${c.title}` })));
      }
    };
    load();
    const id = setInterval(load, 60_000);
    window.addEventListener("muadh:alerts", load);
    return () => { clearInterval(id); window.removeEventListener("muadh:alerts", load); };
  }, [profile, needsOnboarding, isMentor, t, path]);

  if (!loading && !profile && path.startsWith("/admin")) return <AuthForm mode="login" audience="admin" />;
  if (loading || !profile || needsOnboarding || wrongPage) {
    return <div className="af-splash" aria-busy="true"><div className="af-mark"><Logo /></div></div>;
  }

  const nav = admin ? ADMIN_NAV : isMentor ? MENTOR_NAV : LEARNER_NAV;
  const current = [...LEARNER_NAV, ...ADMIN_NAV].find(([href]) => path.startsWith(href));
  const initials = (profile.name ?? "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const linkClass = (href: string) => (path.startsWith(href) ? "active" : "");

  return (
    <div className="af">
      <aside className="af-side">
        <Logo href={admin ? "/admin" : isMentor ? "/mentor" : "/dashboard"} />
        <nav aria-label="Main">
          {nav.map(([href, icon, key]) => (
            <Link key={href} href={href} className={linkClass(href)} aria-current={path.startsWith(href) ? "page" : undefined}>
              <Icon name={icon} /><span>{t(key)}</span>
              {href === "/ask" && alerts.length > 0 && <i className="af-dot">{alerts.length}</i>}
            </Link>
          ))}
        </nav>
        {!isMentor && (
          <div className="af-side-foot">
            <Link href="/settings" className={linkClass("/settings")}><Icon name="settings" /><span>{t("navSettings")}</span></Link>
          </div>
        )}
      </aside>

      <div className="af-main">
        <div className="af-top">
          <h1 className="af-title">{current ? t(current[2]) : ""}</h1>
          <div className="af-actions">
            {!admin && <button className="btn sec ratebtn" onClick={() => setRating(true)}>⭐ <span>{t("rtButton")}</span></button>}
            <LangSwitch />
            <div className="af-pop" ref={bellRef}>
              <button className="af-icon" aria-label={t("bellH")} onClick={() => setMenu(menu === "bell" ? "" : "bell")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>
                {alerts.length > 0 && <i className="af-dot">{alerts.length}</i>}
              </button>
              {menu === "bell" && (
                <div className="af-menu" role="menu">
                  <b>{t("bellH")}</b>
                  {alerts.length === 0 ? <p className="b2 mid">{t("bellEmpty")}</p> : alerts.map((a, i) => (
                    <Link key={i} href={a.href} onClick={close} role="menuitem">{a.text}</Link>
                  ))}
                </div>
              )}
            </div>
            <div className="af-pop" ref={userRef}>
              <button className="af-avatar" aria-label={profile.name ?? ""} onClick={() => setMenu(menu === "user" ? "" : "user")}>{initials}</button>
              {menu === "user" && (
                <div className="af-menu" role="menu">
                  <b>{profile.name}</b>
                  <span className="b2 mid">{isMentor ? t("roleMentor") : profile.gender === "female" ? t("sister") : t("brother")}</span>
                  <Link href="/settings" onClick={close} role="menuitem">⚙️ {t("navSettings")}</Link>
                  <button onClick={signOut} role="menuitem">↩ {t("signOut")}</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <main className="af-content">{children}</main>
        {rating && <RateDialog onClose={() => setRating(false)} />}
      </div>

      <nav className="af-tabs" aria-label="Main" style={{ gridTemplateColumns: `repeat(${nav.length}, 1fr)` }}>
        {nav.map(([href, icon, key]) => (
          <Link key={href} href={href} className={linkClass(href)}><Icon name={icon} /><span>{t(key)}</span>
            {href === "/ask" && alerts.length > 0 && <i className="af-dot">{alerts.length}</i>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
