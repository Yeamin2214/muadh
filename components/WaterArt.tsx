/** Animated ewer pouring water into a basin, used in the purity lessons. */
export default function WaterArt() {
  return (
    <svg viewBox="0 0 360 220" className="water" aria-hidden="true" style={{ display: "block", width: "100%", maxHeight: 240 }}>
      <ellipse cx="210" cy="196" rx="92" ry="14" fill="#0b2a20" stroke="#D4AF37" strokeOpacity=".5" />
      <ellipse className="rip" cx="210" cy="194" rx="40" ry="6" fill="none" stroke="#9fe0f0" strokeWidth="1.5" />
      <ellipse className="rip" cx="210" cy="194" rx="40" ry="6" fill="none" stroke="#9fe0f0" strokeWidth="1.5" />
      <path className="stream" d="M200 62 C206 98 208 140 210 190" stroke="#9fe0f0" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".85" />
      <circle className="drop" cx="204" cy="120" r="3" fill="#bfeefa" />
      <circle className="drop" cx="214" cy="130" r="2.4" fill="#bfeefa" />
      <circle className="drop" cx="208" cy="110" r="2" fill="#bfeefa" />
      <g transform="rotate(-28 120 90)">
        <path d="M70 70 q0 -26 30 -30 h36 q30 4 30 30 v40 q0 34 -48 38 q-48 -4 -48 -38z" fill="#12261f" stroke="#D4AF37" strokeWidth="2.5" />
        <path d="M166 82 q34 -6 58 -30" stroke="#D4AF37" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M70 82 q-26 4 -24 30 q2 18 26 18" stroke="#D4AF37" strokeWidth="4" fill="none" />
        <rect x="96" y="30" width="44" height="10" rx="3" fill="#D4AF37" />
      </g>
    </svg>
  );
}
