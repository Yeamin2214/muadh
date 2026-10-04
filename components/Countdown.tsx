"use client";
import { useEffect, useState } from "react";

/** A live hh:mm:ss countdown, updated every second without re-rendering the whole page. */
export default function Countdown({ to, format }: { to: Date; format: (n: number) => string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, Math.floor((to.getTime() - now) / 1000));
  const pad = (n: number) => format(n).padStart(2, format(0));
  return <span className="countdown" aria-live="off">{pad(Math.floor(left / 3600))}:{pad(Math.floor((left % 3600) / 60))}:{pad(left % 60)}</span>;
}
