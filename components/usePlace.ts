"use client";
import { useEffect, useState } from "react";
import { locate, savedPlace, TABUK, type Place } from "@/lib/client/prayer";

export type LocStatus = "idle" | "locating" | "ok" | "denied" | "unavailable" | "insecure";

/** The user's place: remembered, refreshed silently when allowed, or set by typing a city. */
export function usePlace() {
  const [place, setPlace] = useState<Place>({ ...TABUK, located: false });
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState<LocStatus>("idle");

  useEffect(() => {
    setPlace(savedPlace());
    try { setLabel(localStorage.getItem("muadh.placeLabel") ?? ""); } catch { /* ignore */ }
    if (!window.isSecureContext) return;
    navigator.permissions?.query({ name: "geolocation" as PermissionName })
      .then((p) => { if (p.state === "granted") locate().then((x) => { setPlace(x); setStatus("ok"); }).catch(() => {}); })
      .catch(() => {});
  }, []);

  const ask = async () => {
    if (!window.isSecureContext) return setStatus("insecure");
    setStatus("locating");
    try {
      const p = await locate();
      setPlace(p);
      setStatus("ok");
      setLabel("");
      try { localStorage.removeItem("muadh.placeLabel"); } catch { /* ignore */ }
    } catch (err) {
      setStatus((err as GeolocationPositionError)?.code === 1 ? "denied" : "unavailable");
    }
  };

  const choose = (p: Place, name: string) => {
    setPlace(p);
    setLabel(name);
    setStatus("ok");
    try {
      localStorage.setItem("muadh.place", JSON.stringify(p));
      localStorage.setItem("muadh.placeLabel", name);
    } catch { /* ignore */ }
  };

  return { place, label, status, ask, choose };
}

/** Re-renders on an interval so times stay current. */
export function useNow(ms = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
