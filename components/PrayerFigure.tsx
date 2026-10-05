import type { Pose } from "@/lib/content/prayer";

/** Simple, faceless figures for each prayer position: a solid head, a full torso and limbs. */
const POSES: Record<Pose, { head: [number, number]; torso: string; limbs: string }> = {
  stand: { head: [100, 34], torso: "M100 50 L100 108", limbs: "M100 108 L94 170 M100 108 L106 170 M100 64 L88 82 L110 86" },
  takbir: { head: [100, 34], torso: "M100 50 L100 108", limbs: "M100 108 L94 170 M100 108 L106 170 M98 62 L82 58 L78 38 M102 62 L118 58 L122 38" },
  ruku: { head: [58, 96], torso: "M74 98 L130 102", limbs: "M130 102 L126 170 M130 102 L134 170 M82 100 L122 136" },
  sujood: { head: [62, 160], torso: "M76 156 L122 130", limbs: "M122 130 L128 170 L160 170 M88 150 L82 170 L100 170" },
  sit: { head: [112, 74], torso: "M112 90 L114 148", limbs: "M114 148 L76 160 L122 170 M112 104 L86 150" },
};

export default function PrayerFigure({ pose }: { pose: Pose }) {
  const p = POSES[pose];
  return (
    <svg viewBox="0 0 200 190" className="prayer-figure" aria-hidden="true">
      <line x1="20" y1="174" x2="180" y2="174" stroke="#2f5d4c" strokeWidth="3" strokeLinecap="round" />
      <g fill="none" stroke="#D4AF37" strokeLinecap="round" strokeLinejoin="round">
        <path d={p.torso} strokeWidth="16" />
        <path d={p.limbs} strokeWidth="9" />
      </g>
      <circle cx={p.head[0]} cy={p.head[1]} r="13" fill="#D4AF37" />
    </svg>
  );
}
