"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { LangSwitch, Logo } from "@/components/Shell";

const FEATURES = [["📖", "lnF1"], ["🛡️", "lnF2"], ["🧑‍🏫", "lnF3"], ["🕌", "lnF4"], ["🧭", "lnF5"], ["🌍", "lnF6"]];

/** Public landing page: information plus Login and Sign up, nothing else. */
type Tested = { cases: number; correct: number; critical: number; abstention: { must_abstain: number; abstained: number }; fabricated: { cases: number; caught: number }; sources: { answered: number; cited_all: number } };

export default function Landing() {
  const { t } = useApp();
  const [tested, setTested] = useState<Tested | null>(null);
  useEffect(() => { fetch("/api/eval").then((r) => r.json()).then((d) => setTested(d.run)).catch(() => {}); }, []);
  const p = (a: number, b: number) => `${b ? Math.round((a / b) * 100) : 0}%`;
  return (
    <div className="landing">
      <div className="ln-nav wrap">
        <Logo />
        <nav className="ln-links"><a href="#features">{t("lnFeatures")}</a><a href="#how">{t("lnHow")}</a><a href="#mentors">{t("lnMentorNav")}</a></nav>
        <div className="row">
          <LangSwitch />
          <Link className="btn sec" href="/login">{t("lnLogin")}</Link>
          <Link className="btn" href="/signup">{t("lnSignup")}</Link>
        </div>
      </div>

      <section className="ln-hero">
        <div className="hero-bg kaaba" aria-hidden="true" />
        <div className="hero-bg madinah" aria-hidden="true" />
        <div className="ln-hero-in wrap">
          <span className="ar-text" lang="ar" style={{ color: "var(--gold)", fontSize: 22 }}>معاذ</span>
          <h1>{t("lnHeroT")}</h1>
          <p>{t("lnHeroP")}</p>
          <div className="row">
            <Link className="btn" href="/signup">{t("lnSignup")}</Link>
            <Link className="btn sec" href="/login">{t("lnLogin")}</Link>
          </div>
        </div>
      </section>

      <section id="features" className="wrap ln-sec">
        <h2>{t("lnFeatures")}</h2>
        <div className="ln-grid">
          {FEATURES.map(([icon, key]) => (
            <article key={key} className="card ln-card"><span className="ln-ic" aria-hidden="true">{icon}</span><h3>{t(`${key}T`)}</h3><p className="mid">{t(`${key}P`)}</p></article>
          ))}
        </div>
      </section>

      <section id="how" className="wrap ln-sec">
        <h2>{t("lnHow")}</h2>
        <div className="ln-steps">
          {["lnS1", "lnS2", "lnS3"].map((key, i) => (
            <div key={key} className="ln-step"><span className="ln-num">{i + 1}</span><h3>{t(`${key}T`)}</h3><p className="mid">{t(`${key}P`)}</p></div>
          ))}
        </div>
      </section>

      <section className="wrap ln-sec">
        <div className="card ln-trust" style={{ backgroundImage: "linear-gradient(90deg,rgba(18,18,18,.95),rgba(18,18,18,.6)),url(/images/stage-faith.webp)" }}>
          <h2>{t("lnTrustT")}</h2><p>{t("lnTrustP")}</p>
        </div>
      </section>

      {tested && (
        <section className="wrap ln-sec">
          <h2>{t("lnTestedT")}</h2>
          <p className="mid" style={{ marginTop: -12 }}>{t("lnTestedP", { n: tested.cases })}</p>
          <div className="ln-tested">
            <div className="card"><b>{p(tested.correct, tested.cases)}</b><span>{t("lnT1")}</span></div>
            <div className="card"><b>{p(tested.sources.cited_all, tested.sources.answered)}</b><span>{t("lnT2")}</span></div>
            <div className="card"><b>{p(tested.fabricated.caught, tested.fabricated.cases)}</b><span>{t("lnT3")}</span></div>
            <div className="card"><b>{p(tested.abstention.abstained, tested.abstention.must_abstain)}</b><span>{t("lnT4")}</span></div>
          </div>
        </section>
      )}

      <section id="mentors" className="wrap ln-sec">
        <div className="card ln-mentor">
          <div><h2 style={{ marginBottom: 10 }}>🧑‍🏫 {t("lnMentorT")}</h2><p className="mid" style={{ margin: 0 }}>{t("lnMentorP")}</p></div>
          <div className="row">
            <Link className="btn" href="/mentors/apply">{t("mApplyBtn")}</Link>
            <Link className="btn sec" href="/mentors/login">{t("mLoginBtn")}</Link>
          </div>
        </div>
      </section>

      <section className="wrap ln-sec ln-cta">
        <h2>{t("lnCtaT")}</h2>
        <Link className="btn" href="/signup">{t("lnSignup")}</Link>
      </section>
    </div>
  );
}
