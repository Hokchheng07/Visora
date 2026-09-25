const COLORS = {
  outline: "#d6d0f7",
  purple: "#7562df",
  deep: "#6151d8",
  lavender: "#cab6ff",
  pink: "#efb0ed",
  yellow: "#ffe5a8",
};

function BrowserArtwork({ standard = false }) {
  const width = standard ? 240 : 320;
  const clipId = standard ? "canvas-picker-standard-clip" : "canvas-picker-wide-clip";
  return (
    <svg className={`canvas-picker-artwork ${standard ? "is-standard" : "is-wide"}`} viewBox={`0 0 ${width} 180`} fill="none" focusable="false">
      <defs><clipPath id={clipId}><rect x="3" y="3" width={width - 6} height="174" rx="12" /></clipPath></defs>
      <rect x="3" y="3" width={width - 6} height="174" rx="12" fill="#fff" stroke={COLORS.outline} strokeWidth="3" />
      <g clipPath={`url(#${clipId})`}>
        <rect x="4" y="4" width={width - 8} height="27" fill={COLORS.purple} />
        {[19, 34, 49].map((cx) => <circle key={cx} cx={cx} cy="17" r="4.6" fill="#fff" />)}
        {standard && <path d="M4 126C27 132 18 169 51 175H4Z" fill={COLORS.yellow} opacity=".86" />}
        <path d={standard ? "M90 177C99 135 123 113 153 118C181 120 186 145 211 138C224 135 229 127 240 126V180H90Z" : "M173 177C184 138 204 117 234 116C260 116 275 141 291 136C302 132 310 125 320 124V180H173Z"} fill={COLORS.lavender} opacity=".88" />
        <path d={standard ? "M160 178C178 133 190 107 222 104C229 104 235 106 240 109V180H160Z" : "M240 179C256 145 268 109 300 103C308 101 315 101 320 103V180H240Z"} fill={COLORS.pink} opacity=".76" />
        <path d={standard ? "M139 180C153 149 175 136 194 140C216 144 220 153 240 143V180H139Z" : "M225 180C241 151 265 139 285 143C300 147 309 152 320 141V180H225Z"} fill={COLORS.deep} opacity=".91" />
      </g>
    </svg>
  );
}

function PhoneArtwork() {
  const clipId = "canvas-picker-phone-clip";
  return (
    <svg className="canvas-picker-artwork is-phone" viewBox="0 0 160 280" fill="none" focusable="false">
      <defs><clipPath id={clipId}><rect x="8" y="9" width="144" height="262" rx="19" /></clipPath></defs>
      <rect x="8" y="9" width="144" height="262" rx="19" fill="#fff" stroke={COLORS.outline} strokeWidth="2.8" />
      <g clipPath={`url(#${clipId})`}>
        <circle cx="31" cy="31" r="10" fill={COLORS.lavender} />
        <rect x="49" y="27" width="62" height="7" rx="3.5" fill="#e4e2f5" />
        <rect x="13" y="53" width="134" height="200" fill="#fff" />
        <path d="M13 135C33 148 33 179 44 191C51 199 61 199 67 213V253H13Z" fill={COLORS.yellow} opacity=".9" />
        <path d="M13 194C34 183 51 188 62 208C70 224 89 229 112 227C126 226 140 231 147 240V253H13Z" fill={COLORS.pink} opacity=".85" />
        <path d="M13 199C34 205 46 218 54 235C63 250 91 249 113 253H13Z" fill={COLORS.lavender} opacity=".84" />
        <path d="M13 209C35 205 48 215 57 233C61 243 65 249 70 253H13Z" fill={COLORS.deep} />
        <rect x="65" y="260" width="30" height="4" rx="2" fill="#e4e2f5" />
      </g>
    </svg>
  );
}

function DocumentArtwork() {
  const clipId = "canvas-picker-document-clip";
  return (
    <svg className="canvas-picker-artwork is-document" viewBox="0 0 190 270" fill="none" focusable="false">
      <defs><clipPath id={clipId}><path d="M10 4H143L180 41V264H10Z" /></clipPath></defs>
      <path d="M10 4H143L180 41V264H10Z" fill="#fff" stroke={COLORS.outline} strokeWidth="2.8" strokeLinejoin="round" />
      <g clipPath={`url(#${clipId})`}>
        <path d="M10 73C33 84 41 108 39 139C37 170 47 189 65 205C82 221 88 242 86 264H10Z" fill={COLORS.yellow} opacity=".85" />
        <path d="M10 181C47 180 62 192 86 217C102 234 125 232 142 244C154 252 165 259 180 259V265H10Z" fill={COLORS.pink} opacity=".82" />
        <path d="M10 183C40 186 55 193 68 214C81 234 91 240 117 264H10Z" fill={COLORS.lavender} opacity=".85" />
        <path d="M10 208C37 208 51 219 58 239C61 248 64 257 65 264H10Z" fill={COLORS.deep} opacity=".93" />
      </g>
      <path d="M143 4V41H180Z" fill={COLORS.purple} />
      <path d="M143 4V41H180" stroke={COLORS.outline} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function CanvasPresetArtwork({ id }) {
  if (id === "presentation-16-9") return <BrowserArtwork />;
  if (id === "presentation-4-3") return <BrowserArtwork standard />;
  if (id === "portrait") return <PhoneArtwork />;
  return <DocumentArtwork />;
}
