"use client";
import { useEffect, useRef, useState } from "react";
import CompassDial from "@/components/Compass";
import LocationBar from "@/components/LocationBar";
import Countdown from "@/components/Countdown";
import { useApp, useProfile } from "@/components/AppProvider";
import { useNow, usePlace } from "@/components/usePlace";
import { distanceToKaabaKm, formatTime, nextPrayer, qiblaDegrees } from "@/lib/client/prayer";

type OrientationEvent = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };

export default function QiblaPage() {
  const profile = useProfile();
  const { t, list, num, lang, locale } = useApp();
  const loc = usePlace();
  const { place, ask, status: locStatus } = loc;
  const now = useNow();
  const [city, setCity] = useState("");
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [asking, setAsking] = useState(false);
  const buzzed = useRef(false);
  const q = qiblaDegrees(place);

  // Ask for location on first visit to this page; it is the one place it is clearly needed.
  useEffect(() => {
    if (!place.located && !asking && window.isSecureContext) { setAsking(true); ask().finally(() => setAsking(false)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!place.located) return;
    fetch(`/api/place?lat=${place.lat}&lng=${place.lng}&lang=${lang}`).then((r) => r.json())
      .then((p) => setCity([p.city, p.country].filter(Boolean).join(", "))).catch(() => {});
  }, [place, lang]);

  const listen = () => {
    const on = (e: Event) => {
      const ev = e as OrientationEvent;
      const h = ev.webkitCompassHeading ?? (ev.alpha != null ? 360 - ev.alpha : null);
      if (h == null) return;
      setHeading(h);
      if (ev.webkitCompassAccuracy != null) setAccuracy(ev.webkitCompassAccuracy);
    };
    const type = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(type, on);
    return () => window.removeEventListener(type, on);
  };
  useEffect(() => {
    const Orientation = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    if (!Orientation?.requestPermission) return listen();
  }, []);
  const enableCompass = async () => {
    const Orientation = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    if (Orientation?.requestPermission) { if ((await Orientation.requestPermission()) === "granted") listen(); } else listen();
  };

  const diff = heading == null ? null : ((q - heading + 540) % 360) - 180;
  const aligned = diff != null && Math.abs(diff) < 5;
  useEffect(() => {
    if (aligned && !buzzed.current) { navigator.vibrate?.(80); buzzed.current = true; }
    if (!aligned) buzzed.current = false;
  }, [aligned]);
  const np = nextPrayer(place, now);
  const status = diff == null ? t("noComp") : aligned ? t("facing") : `${diff > 0 ? t("turnR") : t("turnL")} ${num(Math.round(Math.abs(diff)))}°`;

  return (
    <>
      <h1 style={{ textAlign: "center" }}>{t("qH")}</h1>
      <p className="b2 mid" style={{ textAlign: "center", margin: "8px 0 26px" }}>{t("qP")}</p>
      <div className="q2">
        <div>
          <div className={`cwrap ${aligned ? "aligned" : ""}`}>
            <div className="glow" />
            <div className="face" style={{ transform: heading == null ? undefined : `rotate(${-heading}deg)` }}><CompassDial qibla={q} /></div>
            <svg className="fix" viewBox="0 0 400 400" aria-hidden="true"><path d="M200 2 l12 22 h-24z" fill="#F5F5F5" /></svg>
          </div>
          <div className={`qstat ${aligned ? "ok" : ""}`} aria-live="polite">{status}</div>
          {accuracy != null && accuracy > 25 && <p className="b2" style={{ textAlign: "center", color: "var(--gold)" }}>{t("calib")}</p>}
        </div>
        <div className="qcards">
          <div className="card qcard"><div className="k">{t("city")}</div>
            <div className="v" style={{ fontSize: 19 }}>{asking || locStatus === "locating" ? t("locating") : loc.label || city || (place.located ? `${place.lat.toFixed(2)}, ${place.lng.toFixed(2)}` : t("qFromT"))}</div>
            <LocationBar {...loc} />
          </div>
          <div className="card qcard"><div className="k">{t("bearing")}</div><div className="v">{num(Math.round(q))}°</div></div>
          <div className="card qcard"><div className="k">{t("dist")}</div><div className="v">{num(distanceToKaabaKm(place))} <small>{t("km")}</small></div></div>
          <div className="card qcard"><div className="k">{t("heading")}</div><div className="v">{heading == null ? "--" : `${num(Math.round(heading))}°`}</div>
            {heading == null && <button className="btn sec" style={{ marginTop: 12 }} onClick={enableCompass}>{t("enable")}</button>}
          </div>
          <div className="card qcard"><div className="k">{t("nextAt")}</div><div className="v" style={{ fontSize: 19 }}>{list("prayers")[np.index]} · {formatTime(np.at, place, locale)}</div>
            <div className="b2" style={{ color: "var(--gold)", marginTop: 4 }}><Countdown to={np.at} format={num} /></div></div>
        </div>
      </div>
    </>
  );
}
