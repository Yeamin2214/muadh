"use client";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { useApp } from "./AppProvider";
import type { LocStatus } from "./usePlace";
import type { Place } from "@/lib/client/prayer";

/** Location status with a clear reason when it fails, and a city search as a fallback. */
export default function LocationBar({ place, label, status, ask, choose }: {
  place: Place; label: string; status: LocStatus; ask: () => void; choose: (p: Place, name: string) => void;
}) {
  const { t, lang } = useApp();
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 2) return;
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/place?q=${encodeURIComponent(q.trim())}&lang=${lang}`).then((r) => r.json()).catch(() => null);
    setBusy(false);
    if (res?.lat) { choose({ lat: res.lat, lng: res.lng, located: true }, [res.city, res.country].filter(Boolean).join(", ")); setQ(""); }
    else setMsg(t("cityNotFound"));
  }

  const reason = status === "insecure" ? t("locInsecure") : status === "denied" ? t("locDenied") : status === "unavailable" ? t("locUnavailable") : "";
  return (
    <div className="locbar">
      <span className="b2 mid">
        <MapPin className="ic" aria-hidden="true" /> {label || (place.located ? t("locNote") : t("locFallback"))}{" "}
        {status === "locating" ? t("locating") : <button className="link" onClick={ask}>{t("useLoc")}</button>}
      </span>
      {reason && <p className="b2" style={{ color: "var(--gold)", margin: "6px 0 0" }}>{reason}</p>}
      <form className="citysearch" onSubmit={search}>
        <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("cityPh")} aria-label={t("cityPh")} />
        <button className="btn sec" disabled={busy}>{busy ? "…" : t("citySearch")}</button>
      </form>
      {msg && <p className="b2 err">{msg}</p>}
    </div>
  );
}
