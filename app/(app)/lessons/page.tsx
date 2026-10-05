"use client";
import Link from "next/link";
import { useApp, useProfile } from "@/components/AppProvider";
import { LESSONS, STAGE_IMAGES, STAGE_RANGES, isDone, isOpen, nextLesson } from "@/lib/client/lessons";

export default function Lessons() {
  const profile = useProfile();
  const { t, list, num, lang } = useApp();
  const done = profile.lessons_done ?? [];
  const current = nextLesson(done);

  return (
    <>
      <div className="page" style={{ maxWidth: 900 }}>
        <h1>{t("lessonsH")}</h1>
        <p className="lead">{t("lessonsP")}</p>
        {lang !== "en" && <p className="hint">{t("lessonLangNote")}</p>}
        <div className="mods">
          {STAGE_RANGES.map(([from, to], k) => {
            const items = LESSONS.filter((l) => l.n >= from && l.n <= to);
            const count = items.filter((l) => isDone(done, l.n)).length;
            const active = current.n >= from && current.n <= to;
            return (
              <article key={k} className="card mod" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ height: 110, background: `linear-gradient(90deg,rgba(18,18,18,.92),rgba(18,18,18,.35)),url(/images/${STAGE_IMAGES[k]}.webp) center/cover`, padding: "18px 22px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <div><div className="range">{num(from)}–{num(to)}</div><h3>{list("stageNames")[k]}</h3></div>
                  <span className="b2" style={{ color: "var(--gold)" }}>{num(count)} / {num(items.length)} {t("completed")}</span>
                </div>
                <ol style={{ padding: "0 22px 8px", borderTop: 0 }}>
                  {items.map((l) => {
                    const fin = isDone(done, l.n), open = isOpen(done, l);
                    const cls = fin ? "" : l.n === current.n ? "cur" : open ? "" : "lk";
                    return (
                      <li key={l.n} className={cls}>
                        {open || fin ? <Link href={`/lessons/${l.n}`} style={{ flex: 1 }}>{num(l.n)}. {l.title}</Link> : <span title={t("locked")}>{num(l.n)}. {l.title}</span>}
                        <span className="b2 mid">{fin ? "✓" : open ? t("minutesW", { m: num(l.minutes) }) : "🔒"}</span>
                      </li>
                    );
                  })}
                </ol>
                {active && <div style={{ padding: "0 22px 18px" }}><Link className="btn" href={`/lessons/${current.n}`}>{t("cont")}</Link></div>}
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
