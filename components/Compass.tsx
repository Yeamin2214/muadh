/** The compass dial: degree marks, cardinal points, and the Kaaba placed at the qibla bearing. */
export default function CompassDial({ qibla }: { qibla: number }) {
  const ticks = [];
  for (let a = 0; a < 360; a += 5) {
    const big = a % 30 === 0;
    ticks.push(<line key={a} x1="200" y1={200 - (big ? 182 : 188)} x2="200" y2="4" transform={`rotate(${a} 200 200)`} stroke={big ? "#D4AF37" : "#4a4a4a"} strokeWidth={big ? 2 : 1} />);
  }
  const labels = ["N", "E", "S", "W"].map((l, i) => (
    <text key={l} x="200" y="44" transform={`rotate(${i * 90} 200 200)`} textAnchor="middle" fill={l === "N" ? "#D4AF37" : "#A0A0A0"} fontSize="18" fontWeight="700">{l}</text>
  ));
  const degrees = [30, 60, 120, 150, 210, 240, 300, 330].map((a) => (
    <text key={a} x="200" y="50" transform={`rotate(${a} 200 200)`} textAnchor="middle" fill="#6d6d6d" fontSize="11">{a}</text>
  ));
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <circle cx="200" cy="200" r="198" fill="#161616" stroke="#2A2A2A" />
      <circle cx="200" cy="200" r="150" fill="#121212" stroke="#232323" />
      {ticks}{labels}{degrees}
      <g transform={`rotate(${qibla} 200 200)`}>
        <path d="M200 200 L200 64" stroke="#D4AF37" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
        <g transform="translate(200 58)">
          <rect x="-15" y="-15" width="30" height="30" rx="3" fill="#0c0c0c" stroke="#D4AF37" strokeWidth="2" />
          <rect x="-15" y="-6" width="30" height="5" fill="#D4AF37" />
        </g>
      </g>
      <circle cx="200" cy="200" r="8" fill="#0F4C3A" stroke="#D4AF37" strokeWidth="2" />
    </svg>
  );
}
