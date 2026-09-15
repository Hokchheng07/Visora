
/** Thumbnail illustrations — each is one SVG with a fixed viewBox so it always
 *  scales cleanly to fill the card and never overflows or reflows. */
export function DesignArt({ kind }) {
  if (kind === "portfolio") {
    return (
      <svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {/* gingham border frame */}
        <defs>
          <pattern id="gingham" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#eff6ff" />
            <rect width="20" height="10" fill="#bfdbfe" />
            <rect width="10" height="20" fill="#bfdbfe" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="480" height="300" fill="url(#gingham)" />
        <rect x="14" y="14" width="452" height="272" rx="10" fill="#ffffff" />

        {/* scattered stars */}
        <g fill="#dc2626">
          <path d="M62 44 l4 10 11 1 -8 7 3 11 -10 -6 -10 6 3 -11 -8 -7 11 -1 z" />
          <path d="M420 70 l3 7 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1 z" />
          <path d="M436 220 l3 7 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1 z" />
          <path d="M60 250 l3 7 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1 z" />
        </g>

        {/* red starburst behind the badge */}
        <polygon
          points="120,40 135,95 195,80 150,120 185,170 125,145 120,210 108,145 50,170 90,120 45,80 105,95"
          fill="#dc2626"
        />

        {/* jagged badge / call-out shape */}
        <path
          d="M95 95
             L120 80 L145 95 L175 82 L195 100 L230 88 L255 105
             L290 92 L320 112 L355 100 L378 122
             L360 150 L385 175 L350 185 L365 210
             L325 198 L305 220 L275 200 L245 215
             L220 195 L185 208 L165 182 L130 190
             L120 160 L88 165 L100 135 L70 120 Z"
          fill="#dc2626"
        />
        <text x="235" y="140" textAnchor="middle" fontSize="40" fontWeight="800" fill="#ffffff" fontFamily="Georgia, serif">
          Creative
        </text>
        <text x="235" y="185" textAnchor="middle" fontSize="40" fontWeight="800" fill="#ffffff" fontFamily="Georgia, serif">
          Portfolio
        </text>

        {/* polaroid photo cutout, top right */}
        <g transform="translate(392,52) rotate(14)">
          <rect x="-30" y="-25" width="60" height="66" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
          <rect x="-24" y="-19" width="48" height="38" fill="#e2e8f0" />
          <circle cx="0" cy="0" r="10" fill="#cbd5e1" />
          <path d="M-8 12 Q0 2 8 12 Z" fill="#cbd5e1" />
          <path d="M-22 -34 q10 -10 20 0" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
          <circle cx="-2" cy="-34" r="3" fill="#94a3b8" />
        </g>

        {/* polaroid photo cutout, bottom left */}
        <g transform="translate(85,235) rotate(-10)">
          <rect x="-28" y="-22" width="56" height="60" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
          <rect x="-22" y="-16" width="44" height="34" fill="#e2e8f0" />
          <circle cx="0" cy="0" r="9" fill="#cbd5e1" />
          <path d="M-7 10 Q0 2 7 10 Z" fill="#cbd5e1" />
          <path d="M-20 -30 q9 -9 18 0" fill="none" stroke="#94a3b8" strokeWidth="2.2" />
          <circle cx="-2" cy="-30" r="2.6" fill="#94a3b8" />
        </g>
      </svg>
    );
  }

  if (kind === "exam") {
    return (
      <svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <rect width="480" height="300" fill="#ffffff" />

        {/* scattered stars */}
        <path d="M46 100 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z" fill="#a855f7" />
        <path d="M440 66 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z" fill="#ef4444" />
        <path d="M34 210 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z" fill="#f97316" />
        <path d="M330 44 l2 5 6 1 -4 4 1 6 -5 -3 -5 3 1 -6 -4 -4 6 -1 z" fill="#22c55e" />

        {/* dashed curved arrow */}
        <path d="M70 40 Q95 30 110 55" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
          </marker>
        </defs>

        <text x="240" y="52" textAnchor="middle" fontSize="26" fontWeight="700" fill="#d4a017" fontFamily="Georgia, serif">
          FRONTEND
        </text>
        <text x="240" y="86" textAnchor="middle" fontSize="30" fontWeight="800" fill="#111827">
          EXAMINATION
        </text>

        {/* timer card */}
        <rect x="150" y="105" width="180" height="82" rx="10" fill="#ffffff" stroke="#ddd6fe" strokeWidth="2" />
        <rect x="192" y="97" width="96" height="16" rx="8" fill="#22c55e" />
        <text x="240" y="109" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff">
          TIME REMAINING
        </text>
        <text x="240" y="150" textAnchor="middle" fontSize="26" fontWeight="800" fill="#111827" fontFamily="ui-monospace, monospace">
          01:30:00
        </text>
        <text x="240" y="172" textAnchor="middle" fontSize="9" fill="#94a3b8">
          Hours&#160;&#160;&#160;:&#160;&#160;&#160;Minutes&#160;&#160;&#160;:&#160;&#160;&#160;Seconds
        </text>

        {/* control buttons */}
        <g fontSize="11" fontWeight="700" fill="#ffffff">
          <rect x="130" y="200" width="62" height="22" rx="6" fill="#22c55e" />
          <text x="161" y="215" textAnchor="middle">▶ Start</text>
          <rect x="198" y="200" width="62" height="22" rx="6" fill="#facc15" />
          <text x="229" y="215" textAnchor="middle">❙❙ Pause</text>
          <rect x="266" y="200" width="58" height="22" rx="6" fill="#ef4444" />
          <text x="295" y="215" textAnchor="middle">■ Stop</text>
          <rect x="330" y="200" width="68" height="22" rx="6" fill="#94a3b8" />
          <text x="364" y="215" textAnchor="middle">↻ Restart</text>
        </g>

        {/* chick-with-laptop illustration, bottom left */}
        <g transform="translate(58,235)">
          <rect x="-34" y="8" width="70" height="8" rx="2" fill="#94a3b8" />
          <path d="M-30 8 L-24 -22 L24 -22 L30 8 Z" fill="#334155" />
          <rect x="-20" y="-18" width="40" height="22" fill="#7dd3fc" />
          <circle cx="-4" cy="-30" r="13" fill="#fde047" />
          <path d="M-16 -30 l-8 -4 8 -1 z" fill="#f59e0b" />
          <rect x="-38" y="-52" width="66" height="20" rx="10" fill="#ffffff" stroke="#e2e8f0" />
          <text x="-5" y="-38" textAnchor="middle" fontSize="8" fontWeight="700" fill="#334155">
            &lt;/Chick Codes&gt;
          </text>
        </g>

        {/* alarm clock illustration, right */}
        <g transform="translate(430,215)">
          <circle cx="0" cy="6" r="7" fill="#93c5fd" />
          <circle cx="26" cy="6" r="7" fill="#93c5fd" />
          <circle cx="13" cy="14" r="24" fill="#ffffff" stroke="#60a5fa" strokeWidth="3" />
          <line x1="13" y1="14" x2="13" y2="0" stroke="#334155" strokeWidth="2" />
          <line x1="13" y1="14" x2="22" y2="14" stroke="#334155" strokeWidth="2" />
        </g>

        {/* small code / app chips, bottom right */}
        <rect x="360" y="238" width="26" height="20" rx="5" fill="#38bdf8" />
        <text x="373" y="252" textAnchor="middle" fontSize="9" fill="#ffffff" fontWeight="700">
          &lt;/&gt;
        </text>
        <rect x="392" y="238" width="26" height="20" rx="5" fill="#f472b6" />

        {/* grassy hill footer */}
        <path
          d="M0 300 L0 275 Q40 255 80 275 T160 275 T240 275 T320 275 T400 275 T480 275 L480 300 Z"
          fill="#86efac"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="480" height="300" fill="#e9e5da" />

      {/* faint bow, top left */}
      <g transform="translate(78,55)" opacity="0.55">
        <path d="M0 0 Q-16 -6 -18 8 Q-16 20 0 4 Z" fill="none" stroke="#efe9dd" strokeWidth="3" />
        <path d="M0 0 Q16 -6 18 8 Q16 20 0 4 Z" fill="none" stroke="#efe9dd" strokeWidth="3" />
      </g>

      {/* red outlined bow, bottom center */}
      <g transform="translate(240,275)">
        <path d="M0 0 Q-20 -8 -22 10 Q-20 26 0 6 Z" fill="none" stroke="#9f2b2b" strokeWidth="3" />
        <path d="M0 0 Q20 -8 22 10 Q20 26 0 6 Z" fill="none" stroke="#9f2b2b" strokeWidth="3" />
        <circle cx="0" cy="2" r="3" fill="#9f2b2b" />
      </g>

      {/* title text */}
      <text
        x="255"
        y="110"
        textAnchor="middle"
        fontSize="56"
        fontWeight="700"
        fill="#ffffff"
        stroke="#b31d2c"
        strokeWidth="4"
        paintOrder="stroke"
        fontFamily="'Comic Sans MS', 'Segoe Print', cursive"
        transform="rotate(-3 255 110)"
      >
        Title Topic
      </text>

      {/* butterfly, near title */}
      <g transform="translate(400,95) rotate(15)">
        <path d="M0 0 C-10 -14 -26 -10 -22 4 C-18 16 -6 12 0 0 Z" fill="#7a1a1a" />
        <path d="M0 0 C10 -14 26 -10 22 4 C18 16 6 12 0 0 Z" fill="#b91c1c" />
        <path d="M0 0 C-8 6 -18 10 -16 18 C-12 24 -4 16 0 0 Z" fill="#7a1a1a" />
        <path d="M0 0 C8 6 18 10 16 18 C12 24 4 16 0 0 Z" fill="#b91c1c" />
        <line x1="0" y1="-2" x2="0" y2="20" stroke="#3f0f0f" strokeWidth="2" />
      </g>

      {/* cherries, bottom left */}
      <g transform="translate(115,225)">
        <path d="M8 -60 Q0 -30 -10 -10" fill="none" stroke="#86a06a" strokeWidth="3" />
        <path d="M8 -60 Q30 -35 24 -8" fill="none" stroke="#86a06a" strokeWidth="3" />
        <circle cx="-10" cy="10" r="26" fill="#8f2a2a" />
        <circle cx="26" cy="18" r="30" fill="#a33232" />
        <ellipse cx="-18" cy="0" rx="7" ry="10" fill="#c15252" opacity="0.6" />
      </g>

      {/* star badge with "01", bottom right */}
      <g transform="translate(430,240)">
        <path
          d="M0 -34 L9 -11 34 -11 14 4 22 28 0 13 -22 28 -14 4 -34 -11 -9 -11 Z"
          fill="#b3242e"
        />
        <text x="0" y="6" textAnchor="middle" fontSize="14" fontWeight="700" fill="#ffffff">
          01
        </text>
      </g>
    </svg>
  );
}
