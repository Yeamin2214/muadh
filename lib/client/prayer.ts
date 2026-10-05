import { CalculationMethod, Coordinates, HighLatitudeRule, Madhab, PrayerTimes, Qibla, type CalculationParameters } from "adhan";
import tzlookup from "tz-lookup";

export const KAABA = { lat: 21.4225, lng: 39.8262 };
export const TABUK = { lat: 28.3838, lng: 36.555 };
export type Place = { lat: number; lng: number; located: boolean };

/** Calculation methods a learner can choose in Settings. "auto" picks the one used where they are. */
export const METHODS = {
  UmmAlQura: "Umm al-Qura (Saudi Arabia)",
  MuslimWorldLeague: "Muslim World League",
  Karachi: "Karachi (Bangladesh, Pakistan, India)",
  Egyptian: "Egyptian General Authority",
  Dubai: "Dubai (UAE)",
  Qatar: "Qatar",
  Kuwait: "Kuwait",
  Turkey: "Diyanet (Turkey)",
  Singapore: "Singapore, Malaysia, Indonesia",
  NorthAmerica: "ISNA (North America)",
  Tehran: "Tehran",
} as const;
export type MethodKey = keyof typeof METHODS;

/** The IANA time zone of a place, worked out offline from its coordinates (e.g. Dhaka -> Asia/Dhaka). */
export function timeZoneOf(p: Place): string {
  try { return tzlookup(p.lat, p.lng); } catch { return "Asia/Riyadh"; }
}

/** The method and Asr school commonly used in a time zone's country. */
export function localDefaults(tz: string): { method: MethodKey; hanafi: boolean } {
  const z = tz;
  if (z === "Asia/Riyadh" || z === "Asia/Aden" || z === "Asia/Bahrain" || z === "Asia/Muscat") return { method: "UmmAlQura", hanafi: false };
  if (z === "Asia/Dubai") return { method: "Dubai", hanafi: false };
  if (z === "Asia/Qatar") return { method: "Qatar", hanafi: false };
  if (z === "Asia/Kuwait") return { method: "Kuwait", hanafi: false };
  if (["Asia/Dhaka", "Asia/Karachi", "Asia/Kolkata", "Asia/Calcutta", "Asia/Kabul"].includes(z)) return { method: "Karachi", hanafi: true };
  if (["Asia/Kathmandu", "Asia/Colombo", "Indian/Maldives"].includes(z)) return { method: "Karachi", hanafi: false };
  if (z === "Africa/Cairo") return { method: "Egyptian", hanafi: false };
  if (z === "Europe/Istanbul") return { method: "Turkey", hanafi: true };
  if (z === "Asia/Tehran") return { method: "Tehran", hanafi: false };
  if (["Asia/Kuala_Lumpur", "Asia/Singapore", "Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "Asia/Brunei", "Asia/Pontianak"].includes(z)) return { method: "Singapore", hanafi: false };
  if (z.startsWith("America/")) return { method: "NorthAmerica", hanafi: false };
  return { method: "MuslimWorldLeague", hanafi: false };
}

/** Learner's choice from Settings, or "auto". */
export function prayerSettings(): { method: MethodKey | "auto"; asr: "auto" | "standard" | "hanafi" } {
  try {
    const method = (localStorage.getItem("muadh.method") ?? "auto") as MethodKey | "auto";
    const asr = (localStorage.getItem("muadh.asr") ?? "auto") as "auto" | "standard" | "hanafi";
    return { method: method === "auto" || method in METHODS ? method : "auto", asr };
  } catch {
    return { method: "auto", asr: "auto" };
  }
}

export function activeMethod(p: Place): { method: MethodKey; hanafi: boolean; tz: string } {
  const tz = timeZoneOf(p);
  const local = localDefaults(tz);
  const s = prayerSettings();
  return {
    tz,
    method: s.method === "auto" ? local.method : s.method,
    hanafi: s.asr === "auto" ? local.hanafi : s.asr === "hanafi",
  };
}

function params(p: Place): CalculationParameters {
  const { method, hanafi } = activeMethod(p);
  const c = CalculationMethod[method]();
  c.madhab = hanafi ? Madhab.Hanafi : Madhab.Shafi;
  if (Math.abs(p.lat) > 48) c.highLatitudeRule = HighLatitudeRule.recommended(new Coordinates(p.lat, p.lng));
  return c;
}

/** The calendar date at the place (not the viewer's), as a Date that adhan reads day, month and year from. */
function placeDate(p: Place, at = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timeZoneOf(p), year: "numeric", month: "2-digit", day: "2-digit" }).format(at).split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12);
}

/** The five daily prayers for a place on the place's own calendar day. */
export function prayerTimes(p: Place, at = new Date()): Date[] {
  const t = new PrayerTimes(new Coordinates(p.lat, p.lng), placeDate(p, at), params(p));
  return [t.fajr, t.dhuhr, t.asr, t.maghrib, t.isha];
}

/** Index of the next prayer and when it is; after Isha, the next is tomorrow's Fajr. */
export function nextPrayer(p: Place, now = new Date()) {
  const today = prayerTimes(p, now);
  const i = today.findIndex((d) => d > now);
  if (i >= 0) return { index: i, at: today[i], previous: i > 0 ? today[i - 1] : prayerTimes(p, new Date(now.getTime() - 864e5))[4], today };
  const tomorrow = prayerTimes(p, new Date(now.getTime() + 864e5));
  return { index: 0, at: tomorrow[0], previous: today[4], today };
}

/** A prayer time shown in the place's own local time, e.g. Dhaka times in Dhaka time. */
export function formatTime(d: Date, p: Place, locale: string): string {
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone: timeZoneOf(p) });
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
    if (s && typeof s.lat === "number") return { lat: s.lat, lng: s.lng, located: true };
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

/** Local calendar day on this device, for the prayer tracker. */
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * The time window for each prayer: Fajr to sunrise, Dhuhr to Asr, Asr to Maghrib,
 * Maghrib to Isha, Isha to the middle of the night (between Maghrib and the next Fajr).
 */
export function prayerWindows(p: Place, at = new Date()): { start: Date; end: Date }[] {
  const c = new Coordinates(p.lat, p.lng);
  const t = new PrayerTimes(c, placeDate(p, at), params(p));
  const next = new PrayerTimes(c, placeDate(p, new Date(at.getTime() + 864e5)), params(p));
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
    prayerTimes(p, new Date(Date.now() + i * 864e5)).forEach((at, k) => {
      lines.push(
        "BEGIN:VEVENT", `UID:muadh-${stamp(at)}-${k}@muadh`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(at)}`, "DURATION:PT15M",
        `SUMMARY:${names[k]}`, "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${names[k]}`, "TRIGGER:PT0M", "END:VALARM", "END:VEVENT",
      );
    });
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
