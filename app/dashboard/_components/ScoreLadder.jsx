// The score ladder: each scored interview's average on a fixed 1-10 scale,
// oldest to newest. One series in the one data hue (brand), straight 2px
// segments, 5 faint gridlines, no y-axis line, the user's average as a 1px
// dashed reference, and the latest interview labelled. Drawn in SVG so it
// renders on the server with the page.
const W = 760;
const H = 290;
// The one data hue: the brand purple on the main data element.
const DATA = "#4845d2";
const PAD = { top: 28, right: 64, bottom: 30, left: 30 };
const TICKS = [0, 2, 4, 6, 8, 10];

const short = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default function ScoreLadder({ interviews, average }) {
  // oldest first, at most the latest 12 scored interviews
  const points = interviews.filter((i) => i.averageRating !== null).slice(0, 12).reverse();
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v) => PAD.top + plotH - (v / 10) * plotH;
  const last = points[points.length - 1];
  // 4-6 x labels on one step, first and last included when they fit
  const step = Math.max(1, Math.ceil(points.length / 5));
  const labelled = points.map((_, i) => i).filter((i) => i % step === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
      aria-label={`Score per interview, oldest to newest: ${points.map((p) => p.averageRating).join(", ")} out of 10`}>
      {TICKS.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? "#d1d5db" : "#eceef2"} strokeWidth={t === 0 ? 1.5 : 1} />
          <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#5f6672" className="num">{t}</text>
        </g>
      ))}
      {average !== null && (
        <g>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(average)} y2={y(average)} stroke="#4b5563" strokeWidth="1" strokeDasharray="4 4" />
          <text x={W - PAD.right + 8} y={y(average) + 4} fontSize="12" fill="#4b5563">Avg {average}</text>
        </g>
      )}
      {points.length > 1 && (
        <polyline fill="none" stroke={DATA} strokeWidth="2" strokeLinejoin="round"
          points={points.map((p, i) => `${x(i).toFixed(1)},${y(p.averageRating).toFixed(1)}`).join(" ")} />
      )}
      {last && (
        <g>
          <circle cx={x(points.length - 1)} cy={y(last.averageRating)} r="4" fill={DATA} />
          <text x={x(points.length - 1)} y={y(last.averageRating) - 12} textAnchor="middle" fontSize="12" fill="#111827" className="num">
            {last.averageRating}
          </text>
        </g>
      )}
      {labelled.map((i) => (
        <text key={i} x={x(i)} y={H - 8} fontSize="12" fill="#5f6672"
          textAnchor={points.length === 1 ? "middle" : i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}>
          {short(points[i].createdAt)}
        </text>
      ))}
    </svg>
  );
}
