"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { locate, savedPlace, TABUK, type Place } from "@/lib/client/prayer";

export type LocStatus = "idle" | "locating" | "ok" | "denied" | "unavailable" | "insecure";
type State = { place: Place; label: string; status: LocStatus };

/**
 * One shared location for the whole app, so prayer times, the qibla and the city name
 * all update together the moment permission is given, with no refresh.
 */
let state: State = { place: { ...TABUK, located: false }, label: "", status: "idle" };
const listeners = new Set<() => void>();
const emit = (next: Partial<State>) => { state = { ...state, ...next }; listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
let started = false;

async function cityName(p: Place) {
  try {
    const lang = (localStorage.getItem("muadh.lang") ?? "en").slice(0, 2);
    const r = await fetch(`/api/place?lat=${p.lat}&lng=${p.lng}&lang=${lang}`).then((x) => x.json());
    return [r.city, r.country].filter(Boolean).join(", ");
  } catch { return ""; }
}

async function ask() {
  if (!window.isSecureContext) return emit({ status: "insecure" });
  emit({ status: "locating" });
  try {
    const p = await locate();
    emit({ place: p, status: "ok" });
    const label = await cityName(p);
    emit({ label });
    try { localStorage.setItem("muadh.placeLabel", label); } catch { /* ignore */ }
  } catch (err) {
    emit({ status: (err as GeolocationPositionError)?.code === 1 ? "denied" : "unavailable" });
  }
}

function choose(p: Place, name: string) {
  emit({ place: p, label: name, status: "ok" });
  try { localStorage.setItem("muadh.place", JSON.stringify(p)); localStorage.setItem("muadh.placeLabel", name); } catch { /* ignore */ }
}

/** First visit: ask for location once. Later visits: refresh silently if allowed, and react if the browser setting changes. */
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  let label = "";
  try { label = localStorage.getItem("muadh.placeLabel") ?? ""; } catch { /* ignore */ }
  const saved = savedPlace();
  emit({ place: saved, label, status: saved.located ? "ok" : "idle" });
  if (!window.isSecureContext) return;
  navigator.permissions?.query({ name: "geolocation" as PermissionName }).then((perm) => {
    if (perm.state === "granted") ask();
    else if (perm.state === "prompt" && localStorage.getItem("muadh.locAsked") !== "1") {
      try { localStorage.setItem("muadh.locAsked", "1"); } catch { /* ignore */ }
      ask();
    }
    perm.onchange = () => { if (perm.state === "granted") ask(); };
  }).catch(() => {});
}

export function usePlace() {
  const s = useSyncExternalStore(subscribe, () => state, () => state);
  useEffect(start, []);
  return { place: s.place, label: s.label, status: s.status, ask, choose };
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
