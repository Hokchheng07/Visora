import { useId } from "react";

// Ribbon crescents are sampled once at module load (static geometry, not animation).
const C = 60;
function ribbon({ a0, a1, r, w, cx = C, cy = C, peak = 0.5, steps = 48 }) {
  const outer = [], inner = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const k = u < peak ? u / peak : (1 - u) / (1 - peak);
    const half = (w / 2) * Math.pow(Math.sin((k * Math.PI) / 2), 0.75);
    const a = ((a0 + (a1 - a0) * u) * Math.PI) / 180;
    const cos = Math.cos(a), sin = Math.sin(a);
    outer.push(`${(cx + cos * (r + half)).toFixed(2)} ${(cy + sin * (r + half)).toFixed(2)}`);
    inner.push(`${(cx + cos * (r - half)).toFixed(2)} ${(cy + sin * (r - half)).toFixed(2)}`);
  }
  return `M${outer.join(" L")} L${inner.reverse().join(" L")} Z`;
}
function arc({ a0, a1, r, cx = C, cy = C }) {
  const p = (a) => [cx + Math.cos((a * Math.PI) / 180) * r, cy + Math.sin((a * Math.PI) / 180) * r].map((v) => v.toFixed(2)).join(" ");
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M${p(a0)} A${r} ${r} 0 ${large} ${sweep} ${p(a1)}`;
}

// Outer ribbon: lower-left, over the top, to the right. Inner ribbon: left, under the bottom, up to the right.
const OUTER = { a0: 132, a1: 352, r: 43, w: 13, peak: 0.34 };
const INNER = { a0: 188, a1: -28, r: 39, w: 12, cx: 60, cy: 62, peak: 0.72 };
const OUTER_D = ribbon(OUTER);
const INNER_D = ribbon(INNER);
const OUTER_ARC = arc(OUTER);
const INNER_ARC = arc(INNER);

const PETAL_CENTER =
  "M60 38 C62 45.5 70.5 50 70.5 57.5 C70.5 62.5 65.5 65.5 60 68.5 C54.5 65.5 49.5 62.5 49.5 57.5 C49.5 50 58 45.5 60 38 Z " +
  "M60 51 C61.6 55 65.4 57.2 65.4 60.6 C65.4 63.2 62.7 64.8 60 66.4 C57.3 64.8 54.6 63.2 54.6 60.6 C54.6 57.2 58.4 55 60 51 Z";
const PETAL_LEFT = "M40.5 57 C48 57.8 55.5 64 58.4 71.2 C59.2 73.4 59.7 75.6 60 77.4 C51.5 78.4 43.8 73.4 42.8 66.2 C42.3 62.2 43.2 59.4 40.5 57 Z";
const PETAL_RIGHT = "M79.5 57 C72 57.8 64.5 64 61.6 71.2 C60.8 73.4 60.3 75.6 60 77.4 C68.5 78.4 76.2 73.4 77.2 66.2 C77.7 62.2 76.8 59.4 79.5 57 Z";
const SPARK = "M0 -4 Q0.7 -0.7 4 0 Q0.7 0.7 0 4 Q-0.7 0.7 -4 0 Q-0.7 -0.7 0 -4 Z";

export default function VisoraLoader({
  label = "Crafting your canvas…",
  className = "",
  compact = false,
}) {
  const id = useId().replace(/:/g, "");
  const g = (n) => `visora-loader-${n}-${id}`;
  return (
    <div
      className={`visora-loader ${compact ? "visora-loader-compact" : ""} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="visora-loader-mark" aria-hidden="true">
        <span className="visora-loader-glow" />
        <svg className="visora-loader-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={g("outer")} x1="14" y1="40" x2="104" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0" className="visora-loader-stop-primary" />
              <stop offset="0.6" className="visora-loader-stop-accent" />
              <stop offset="1" className="visora-loader-stop-secondary" />
            </linearGradient>
            <linearGradient id={g("inner")} x1="20" y1="60" x2="100" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0" className="visora-loader-stop-primary" />
              <stop offset="0.45" className="visora-loader-stop-accent" />
              <stop offset="0.85" className="visora-loader-stop-secondary" />
            </linearGradient>
            <linearGradient id={g("lotus")} x1="44" y1="44" x2="78" y2="74" gradientUnits="userSpaceOnUse">
              <stop offset="0" className="visora-loader-stop-accent" />
              <stop offset="1" className="visora-loader-stop-secondary" />
            </linearGradient>
            <mask id={g("m-outer")} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
              <path className="visora-loader-draw visora-loader-draw-outer" d={OUTER_ARC} pathLength="100" />
            </mask>
            <mask id={g("m-inner")} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
              <path className="visora-loader-draw visora-loader-draw-inner" d={INNER_ARC} pathLength="100" />
            </mask>
          </defs>

          <g className="visora-loader-track">
            <path d={OUTER_D} fill={`url(#${g("outer")})`} />
            <path d={INNER_D} fill={`url(#${g("inner")})`} />
          </g>

          <g className="visora-loader-ring">
            <path d={OUTER_D} fill={`url(#${g("outer")})`} mask={`url(#${g("m-outer")})`} />
            <path d={INNER_D} fill={`url(#${g("inner")})`} mask={`url(#${g("m-inner")})`} />
          </g>

          <g className="visora-loader-lotus" fill={`url(#${g("lotus")})`}>
            <path className="visora-loader-petal visora-loader-petal-left" d={PETAL_LEFT} />
            <path className="visora-loader-petal visora-loader-petal-right" d={PETAL_RIGHT} />
            <path className="visora-loader-petal visora-loader-petal-center" d={PETAL_CENTER} fillRule="evenodd" />
          </g>

          <g className="visora-loader-sparks">
            <g transform="translate(101 50)"><path className="visora-loader-spark visora-loader-spark-one" d={SPARK} /></g>
            <g transform="translate(88 19) scale(.7)"><path className="visora-loader-spark visora-loader-spark-two" d={SPARK} /></g>
            <g transform="translate(23 96) scale(.6)"><path className="visora-loader-spark visora-loader-spark-three" d={SPARK} /></g>
          </g>
        </svg>
      </span>

      <p className="visora-loader-label">{label}</p>
    </div>
  );
}
