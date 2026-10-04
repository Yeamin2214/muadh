"use client";
import { useEffect, useState } from "react";

export type RemStatus = "off" | "on" | "denied" | "dismissed" | "insecure" | "unsupported";

async function show(title: string, body: string, tag?: string) {
  const options = { body, icon: "/images/stage-prayer.jpg", tag };
  const reg = await navigator.serviceWorker?.getRegistration().catch(() => undefined);
  if (reg) return reg.showNotification(title, options);
  try { new Notification(title, options); } catch { /* not supported here */ }
}

/** Prayer notifications while Mu'adh is open, with a clear status when they cannot work. */
export function useReminders(times: Date[], names: string[], text: (p: string) => { title: string; body: string }) {
  const [status, setStatus] = useState<RemStatus>("off");

  useEffect(() => {
    if (!window.isSecureContext) return setStatus("insecure");
    if (!("Notification" in window)) return setStatus("unsupported");
    if (Notification.permission === "denied") return setStatus("denied");
    try { if (Notification.permission === "granted" && localStorage.getItem("muadh.rem") === "1") setStatus("on"); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (status !== "on") return;
    const now = Date.now();
    const ids = times
      .map((at, i) => ({ at: at.getTime(), name: names[i] }))
      .filter((x) => x.at > now && x.at - now < 864e5)
      .map((x) => setTimeout(() => { const m = text(x.name); show(m.title, m.body, `prayer-${x.at}`); }, x.at - now));
    return () => ids.forEach(clearTimeout);
  }, [status, times, names, text]);

  async function turnOn() {
    if (!window.isSecureContext) return setStatus("insecure");
    if (!("Notification" in window)) return setStatus("unsupported");
    await navigator.serviceWorker?.register("/sw.js").catch(() => undefined);
    const result = await Notification.requestPermission();
    if (result === "granted") {
      try { localStorage.setItem("muadh.rem", "1"); } catch { /* ignore */ }
      setStatus("on");
      show("Mu'adh", "✓");
    } else {
      setStatus(result === "denied" ? "denied" : "dismissed");
    }
  }

  return { status, turnOn };
}
