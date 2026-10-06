"use client";
import { Hourglass, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { LangSwitch, Logo } from "@/components/Shell";

type Status = { role: string; name: string | null; application: { status: string; note: string | null; created_at: string } | null };

/** Where mentors land after signing in: verified mentors go to the portal; applicants see their review status. */
export default function MentorStatus() {
  const { t, locale, signOut } = useApp();
  const router = useRouter();
  const [s, setS] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/mentors/status").then((r) => (r.status === 401 ? router.replace("/mentor/login") : r.json())).then((data) => {
      if (!data) return;
      if (data.role === "admin") return router.replace("/admin");
      if (data.role === "mentor") return router.replace("/mentor");
      setS(data);
    });
  }, [router]);

  if (!s) return <div className="af-splash"><div className="af-mark"><Logo /></div></div>;
  const app = s.application;
  return (
    <div className="mentor-auth">
      <div className="row" style={{ justifyContent: "space-between" }}><Logo /><LangSwitch /></div>
      <div className="card apply">
        <h1>{t("msH")}</h1>
        {s.role === "learner" && (<><p className="lead">{t("msLearner")}</p><Link className="btn" href="/dashboard">{t("msGoDash")}</Link></>)}
        {s.role === "applicant" && (!app || app.status === "pending") && (
          <>
            <span className="chip"><Hourglass className="ic" aria-hidden="true" /> {t("msPending").split(".")[0]}</span>
            <p className="lead">{t("msPending")}</p>
            {app && <p className="b2 mid">{t("msSubmitted", { d: new Date(app.created_at).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) })}</p>}
            {!app && <Link className="btn" href="/mentors/apply">{t("maSubmit")}</Link>}
          </>
        )}
        {s.role === "applicant" && app?.status === "rejected" && (
          <>
            <p className="lead">{t("msRejected")}</p>
            {app.note && <div className="box"><b>{t("msReason")}</b>{app.note}</div>}
            <Link className="btn" href="/mentors/apply">{t("msUpdate")}</Link>
          </>
        )}
        <button className="btn sec" onClick={signOut} style={{ marginTop: 16 }}><LogOut className="ic" aria-hidden="true" /> {t("signOut")}</button>
      </div>
    </div>
  );
}
