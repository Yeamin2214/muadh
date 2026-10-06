"use client";
import { useEffect, useRef, useState } from "react";
import { Compass as CompassIcon } from "lucide-react";
import CompassDial from "@/components/Compass";
import LocationBar from "@/components/LocationBar";
import Countdown from "@/components/Countdown";
import { useApp } from "@/components/AppProvider";
import { useNow, usePlace } from "@/components/usePlace";
import { distanceToKaabaKm, formatTime, nextPrayer, qiblaDegrees } from "@/lib/client/prayer";

type OrientationEvent = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
type PermissionApi = { requestPermission?: () => Promise<string> };

/**
 * Live qibla compass. Readings are smoothed and the dial is rotated directly (no page re-render per reading),
 * always the short way round, so it moves calmly. Android starts on its own; iPhone starts on the first tap.
 */
export default function QiblaPage() {
  const { t, list, num, locale } = useApp();
  const loc = usePlace();
  const { place } = loc;
  const now = useNow();
  const q = qiblaDegrees(place);
  const face = useRef<HTMLDivElement>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [needsTap, setNeedsTap] = useState(false);
  const buzzed = useRef(false);

  useEffect(() => {
    let sx = 0, sy = 0, rotation = 0, started = false, lastShown = 0, frame = 0;
    const onReading = (e: Event) => {
      const ev = e as OrientationEvent;
      const raw = ev.webkitCompassHeading ?? (ev.alpha != null ? 360 - ev.alpha : null);
      if (raw == null) return;
      // Smooth on the unit circle so 359° and 1° average correctly.
      const r = (raw * Math.PI) / 180;
      sx = started ? sx * 0.8 + Math.cos(r) * 0.2 : Math.cos(r);
      sy = started ? sy * 0.8 + Math.sin(r) * 0.2 : Math.sin(r);
      const smooth = ((Math.atan2(sy, sx) * 180) / Math.PI + 360) % 360;
      // Turn the short way: keep a running rotation instead of jumping from 359° to 0°.
      const previous = ((rotation % 360) + 360) % 360;
      rotation += ((smooth - previous + 540) % 360) - 180;
      started = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { if (face.current) face.current.style.transform = `rotate(${-rotation}deg)`; });
      if (Date.now() - lastShown > 200) { // numbers and status update five times a second, not on every reading
        lastShown = Date.now();
        setHeading(smooth);
        if (ev.webkitCompassAccuracy != null) setAccuracy(ev.webkitCompassAccuracy);
      }
    };
    const type = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    const listen = () => window.addEventListener(type, onReading);
    const api = window.DeviceOrientationEvent as unknown as PermissionApi | undefined;
    let onTap: (() => void) | null = null;
    if (api?.requestPermission) {
      // iPhone: Apple requires a tap. Any tap on the page starts the compass.
      setNeedsTap(true);
      onTap = () => {
        api.requestPermission!().then((r) => { if (r === "granted") { setNeedsTap(false); listen(); } }).catch(() => {});
        if (onTap) document.removeEventListener("click", onTap);
      };
      document.addEventListener("click", onTap);
    } else {
      listen(); // Android and others: start straight away
    }
    return () => {
      window.removeEventListener(type, onReading);
      if (onTap) document.removeEventListener("click", onTap);
      cancelAnimationFrame(frame);
    };
  }, []);

  const diff = heading == null ? null : ((q - heading + 540) % 360) - 180;
  const aligned = diff != null && Math.abs(diff) < 5;
  useEffect(() => {
    if (aligned && !buzzed.current) { navigator.vibrate?.(80); buzzed.current = true; }
    if (!aligned) buzzed.current = false;
  }, [aligned]);

  const np = nextPrayer(place, now);
  const status = needsTap ? t("qTap") : diff == null ? t("noComp") : aligned ? t("facing") : `${diff > 0 ? t("turnR") : t("turnL")} ${num(Math.round(Math.abs(diff)))}°`;

  return (
    <>
      <h1 style={{ textAlign: "center" }}>{t("qH")}</h1>
      <p className="b2 mid" style={{ textAlign: "center", margin: "8px 0 26px" }}>{t("qP")}</p>
      <div className="q2">
        <div className="qdial">
          <div className={`cwrap ${aligned ? "aligned" : ""}`}>
            <div className="glow" />
            <div className="face" ref={face}><CompassDial qibla={q} /></div>
            <svg className="fix" viewBox="0 0 400 400" aria-hidden="true"><path d="M200 2 l12 22 h-24z" fill="#F5F5F5" /></svg>
          </div>
          <div className={`qstat ${aligned ? "ok" : ""}`} aria-live="polite">
            {needsTap && <CompassIcon className="ic" aria-hidden="true" />} {status}
          </div>
          {accuracy != null && accuracy > 25 && <p className="b2 qcalib">{t("calib")}</p>}
        </div>
        <div className="qcards">
          <div className="card qcard"><div className="k">{t("city")}</div>
            <div className="v" style={{ fontSize: 19 }}>{loc.status === "locating" ? t("locating") : loc.label || (place.located ? `${place.lat.toFixed(2)}, ${place.lng.toFixed(2)}` : t("qFromT"))}</div>
            <LocationBar {...loc} />
          </div>
          <div className="card qcard"><div className="k">{t("bearing")}</div><div className="v">{num(Math.round(q))}°</div></div>
          <div className="card qcard"><div className="k">{t("dist")}</div><div className="v">{num(distanceToKaabaKm(place))} <small>{t("km")}</small></div></div>
          <div className="card qcard"><div className="k">{t("heading")}</div><div className="v tabular">{heading == null ? "--" : `${num(Math.round(heading))}°`}</div></div>
          <div className="card qcard"><div className="k">{t("nextAt")}</div>
            <div className="v" style={{ fontSize: 19 }}>{list("prayers")[np.index]} · {formatTime(np.at, place, locale)}</div>
            <div className="b2" style={{ color: "var(--gold)", marginTop: 4 }}><Countdown to={np.at} format={num} /></div>
          </div>
        </div>
      </div>
    </>
  );
}
