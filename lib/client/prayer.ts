import { CalculationMethod, Coordinates, PrayerTimes, Qibla } from "adhan";

export const KAABA = { lat: 21.4225, lng: 39.8262 };
export const TABUK = { lat: 28.3838, lng: 36.555 };
export type Place = { lat: number; lng: number; located: boolean };

/** The five daily prayers for a place and day, using the Umm al-Qura method. */
export function prayerTimes(p: Place, day = new Date()): Date[] {
  const t = new PrayerTimes(new Coordinates(p.lat, p.lng), day, CalculationMethod.UmmAlQura());
  return [t.fajr, t.dhuhr, t.asr, t.maghrib, t.isha];
}

/** Index of the next prayer and when it is; after Isha, the next is tomorrow's Fajr. */
export function nextPrayer(p: Place, now = new Date()) {
  const today = prayerTimes(p, now);
  const i = today.findIndex((d) => d > now);
  if (i >= 0) return { index: i, at: today[i], previous: i > 0 ? today[i - 1] : new Date(prayerTimes(p, new Date(now.getTime() - 864e5))[4]), today };
  const tomorrow = prayerTimes(p, new Date(now.getTime() + 864e5));
  return { index: 0, at: tomorrow[0], previous: today[4], today };
}

export const qiblaDegrees = (p: Place) => Qibla(new Coordinates(p.lat, p.lng));

export function distanceToKaabaKm(p: Place): number {
  const r = Math.PI / 180;
  const dLat = (KAABA.lat - p.lat) * r, dLng = (KAABA.lng - p.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(p.lat * r) * Math.cos(KAABA.lat * r) * Math.sin(dLng / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(h)));
}

/** Remembered place, so prayer times load instantly on the next visit. */
export function savedPlace(): Place {
  try {
    const s = JSON.parse(localStorage.getItem("muadh.place") ?? "null");
    if (s && typeof s.lat === "number") return { ...s, located: true };
  } catch { /* ignore */ }
  return { ...TABUK, located: false };
}

export function locate(): Promise<Place> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("unsupported"));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, located: true };
        try { localStorage.setItem("muadh.place", JSON.stringify(p)); } catch { /* ignore */ }
        resolve(p);
      },
      reject,
      { timeout: 9000, maximumAge: 3_600_000 },
    );
  });
}

/** Local calendar day, so "today" matches the user's own clock. */
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * The time window for each prayer: Fajr to sunrise, Dhuhr to Asr, Asr to Maghrib,
 * Maghrib to Isha, Isha to the middle of the night (between Maghrib and the next Fajr).
 */
export function prayerWindows(p: Place, day = new Date()): { start: Date; end: Date }[] {
  const c = new Coordinates(p.lat, p.lng);
  const t = new PrayerTimes(c, day, CalculationMethod.UmmAlQura());
  const next = new PrayerTimes(c, new Date(day.getTime() + 864e5), CalculationMethod.UmmAlQura());
  const midnight = new Date((t.maghrib.getTime() + next.fajr.getTime()) / 2);
  return [
    { start: t.fajr, end: t.sunrise }, { start: t.dhuhr, end: t.asr }, { start: t.asr, end: t.maghrib },
    { start: t.maghrib, end: t.isha }, { start: t.isha, end: midnight },
  ];
}

/** A calendar file with every prayer for the next 30 days, each with an alert at prayer time. */
export function prayerCalendar(p: Place, names: string[], days = 30): string {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Muadh//Prayer times//EN", "CALSCALE:GREGORIAN"];
  for (let i = 0; i < days; i++) {
    const day = new Date(Date.now() + i * 864e5);
    prayerTimes(p, day).forEach((at, k) => {
      lines.push(
        "BEGIN:VEVENT", `UID:muadh-${stamp(at)}-${k}@muadh`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(at)}`, "DURATION:PT15M",
        `SUMMARY:${names[k]}`, "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${names[k]}`, "TRIGGER:PT0M", "END:VALARM", "END:VEVENT",
      );
    });
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
