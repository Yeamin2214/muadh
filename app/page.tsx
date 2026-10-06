"use client";
import { BookOpen, Clock, Compass, Languages, ShieldCheck, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { LangSwitch, Logo } from "@/components/Shell";

const FEATURES = [[BookOpen, "lnF1"], [ShieldCheck, "lnF2"], [UserRoundCheck, "lnF3"], [Clock, "lnF4"], [Compass, "lnF5"], [Languages, "lnF6"]] as const;

/** Public landing page: information plus Login and Sign up, nothing else. */
type Tested = { cases: number; correct: number; critical: number; abstention: { must_abstain: number; abstained: number }; fabricated: { cases: number; caught: number }; sources: { answered: number; cited_all: number } };

export default function Landing() {
  const { t } = useApp();
  const [tested, setTested] = useState<Tested | null>(null);
  const [stories, setStories] = useState<{ id: string; title: string; body: string; display_name: string | null }[]>([]);
  const [openStory, setOpenStory] = useState<string | null>(null);
  useEffect(() => { fetch("/api/stories").then((r) => r.json()).then((d) => setStories(d.stories ?? [])).catch(() => {}); }, []);
  useEffect(() => { fetch("/api/eval").then((r) => r.json()).then((d) => setTested(d.run)).catch(() => {}); }, []);
  const p = (a: number, b: number) => `${b ? Math.round((a / b) * 100) : 0}%`;
  return (
    <div className="landing">
      <div className="ln-nav wrap">
        <Logo />
        <nav className="ln-links"><a href="#features">{t("lnFeatures")}</a><a href="#how">{t("lnHow")}</a><a href="#mentors">{t("lnMentorNav")}</a></nav>
        <div className="row">
          <LangSwitch />
          <Link className="btn sec" href="/user/login">{t("lnLogin")}</Link>
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
            <Link className="btn sec" href="/user/login">{t("lnLogin")}</Link>
          </div>
        </div>
      </section>

      <section id="features" className="wrap ln-sec">
        <h2>{t("lnFeatures")}</h2>
        <div className="ln-grid">
          {FEATURES.map(([Icon, key]) => (
            <article key={key} className="card ln-card"><span className="ln-ic" aria-hidden="true"><Icon /></span><h3>{t(`${key}T`)}</h3><p className="mid">{t(`${key}P`)}</p></article>
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

      {stories.length > 0 && (
        <section className="wrap ln-sec">
          <h2>{t("stH")}</h2>
          <div className="ln-grid">
            {stories.map((st) => (
              <article key={st.id} className="card ln-card">
                <h3 style={{ marginTop: 0 }} dir="auto">{st.title}</h3>
                <p className="mid" dir="auto" style={{ whiteSpace: "pre-wrap" }}>{openStory === st.id ? st.body : `${st.body.slice(0, 220)}${st.body.length > 220 ? "…" : ""}`}</p>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="b2" style={{ color: "var(--gold)" }}>{st.display_name ?? t("stAnon")}</span>
                  {st.body.length > 220 && <button className="link b2" onClick={() => setOpenStory(openStory === st.id ? null : st.id)}>{openStory === st.id ? t("stLess") : t("stRead")}</button>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section id="mentors" className="wrap ln-sec">
        <div className="card ln-mentor">
          <div><h2 style={{ marginBottom: 10 }}><UserRoundCheck className="ic" aria-hidden="true" /> {t("lnMentorT")}</h2><p className="mid" style={{ margin: 0 }}>{t("lnMentorP")}</p></div>
          <div className="row">
            <Link className="btn" href="/mentors/apply">{t("mApplyBtn")}</Link>
            <Link className="btn sec" href="/mentor/login">{t("mLoginBtn")}</Link>
          </div>
        </div>
      </section>

      <section className="wrap ln-sec ln-cta">
        <h2>{t("lnCtaT")}</h2>
        <Link className="btn" href="/signup">{t("lnSignup")}</Link>
      </section>
      <footer className="ln-footer">
        <div className="wrap ln-footer-in">
          <div className="ln-fcol ln-fbrand">
            <Logo />
            <p className="b2 mid">{t("ftTag")}</p>
          </div>
          <div className="ln-fcol">
            <b>{t("ftExplore")}</b>
            <a href="#features">{t("lnFeatures")}</a><a href="#how">{t("lnHow")}</a><a href="#mentors">{t("lnMentorNav")}</a>
          </div>
          <div className="ln-fcol">
            <b>{t("ftAccount")}</b>
            <Link href="/signup">{t("lnSignup")}</Link><Link href="/user/login">{t("lnLogin")}</Link>
            <Link href="/mentor/login">{t("mLoginBtn")}</Link><Link href="/mentors/apply">{t("mApplyBtn")}</Link>
          </div>
          <div className="ln-fcol">
            <b>{t("ftSources")}</b>
            <a href="https://quranenc.com" target="_blank" rel="noreferrer">QuranEnc</a>
            <a href="https://hadeethenc.com" target="_blank" rel="noreferrer">HadeethEnc</a>
            <a href="https://dorar.net" target="_blank" rel="noreferrer">Dorar.net</a>
            <a href="https://everyayah.com" target="_blank" rel="noreferrer">EveryAyah</a>
          </div>
        </div>
        <div className="wrap ln-fbottom b2 mid">© 2026 Mu&apos;adh · {t("ftRights")}</div>
      </footer>
    </div>
  );
}
