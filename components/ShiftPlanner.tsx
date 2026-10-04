"use client";
import { useEffect, useMemo, useState } from "react";
import { prayerWindows, type Place } from "@/lib/client/prayer";
import { useApp } from "./AppProvider";

const at = (base: Date, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
};

/** For night-shift and shift workers: shows when each prayer can be prayed around the shift. */
export default function ShiftPlanner({ place }: { place: Place }) {
  const { t, list, locale } = useApp();
  const [start, setStart] = useState("22:00");
  const [end, setEnd] = useState("06:00");
  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem("muadh.shift") ?? "null"); if (s) { setStart(s.start); setEnd(s.end); } } catch { /* ignore */ }
  }, []);
  useEffect(() => { try { localStorage.setItem("muadh.shift", JSON.stringify({ start, end })); } catch { /* ignore */ } }, [start, end]);

  const fmt = (d: Date) => d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const plan = useMemo(() => {
    const today = new Date();
    const s = at(today, start);
    let e = at(today, end);
    if (e <= s) e = new Date(e.getTime() + 864e5);
    // Prayers that can touch the shift: the rest of today, plus tomorrow's for overnight shifts.
    const windows = [...prayerWindows(place, today), ...prayerWindows(place, new Date(today.getTime() + 864e5))];
    return list("prayers").map((name, k) => {
      const w = [windows[k], windows[k + 5]].find((x) => x.end > s && x.start < e) ?? windows[k];
      if (w.end <= s || w.start >= e) return { name, text: t("shiftFree"), tone: "mid" };
      if (w.start < s) return { name, text: t("shiftBefore", { a: fmt(w.start) }), tone: "ok" };
      if (w.end > e) return { name, text: t("shiftAfter", { b: fmt(w.end) }), tone: "ok" };
      return { name, text: t("shiftBreak", { a: fmt(w.start), b: fmt(w.end) }), tone: "gold" };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, place, locale]);

  return (
    <section className="card tl">
      <b>{t("shiftH")}</b>
      <p className="b2 mid" style={{ margin: "4px 0 12px" }}>{t("shiftP")}</p>
      <div className="row">
        <label className="b2">{t("shiftStart")} <input className="field time" type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label className="b2">{t("shiftEnd")} <input className="field time" type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
      </div>
      <ul className="shift">
        {plan.map((p) => (
          <li key={p.name}><b>{p.name}</b><span style={{ color: p.tone === "gold" ? "var(--gold)" : p.tone === "ok" ? "var(--hi)" : "var(--mid)" }}>{p.text}</span></li>
        ))}
      </ul>
    </section>
  );
}
