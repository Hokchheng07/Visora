import { useMemo } from "react";

const STEP_CHOICES = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
const MIN_LABEL_GAP = 62; // px between labelled ticks, so numbers never collide
const MIN_TICK_GAP = 7;
const MAX_TICKS = 400;

/* Ticks are spaced in design pixels and placed with the measured scale. The
   ruler spans the whole workspace, so it keeps counting past the page edges —
   negative values to the left of the page, like Figma. */
function buildTicks(origin, length, scale) {
  if (!scale || !length) return [];

  const major = STEP_CHOICES.find((choice) => choice * scale >= MIN_LABEL_GAP) ?? STEP_CHOICES.at(-1);
  const minor = major / 5;
  const step = minor * scale >= MIN_TICK_GAP ? minor : major;

  const firstValue = Math.floor(-origin / scale / step) * step;
  const count = Math.min(Math.ceil(length / scale / step) + 1, MAX_TICKS);

  const ticks = [];
  for (let index = 0; index <= count; index += 1) {
    const value = firstValue + index * step;
    ticks.push({ value, offset: origin + value * scale, isMajor: value % major === 0 });
  }
  return ticks;
}

export default function EditorRuler({ orientation, origin, length, scale }) {
  const ticks = useMemo(() => buildTicks(origin, length, scale), [origin, length, scale]);
  const axis = orientation === "vertical" ? "top" : "left";

  return (
    <div className={`editor-ruler is-${orientation}`} aria-hidden="true">
      {ticks.map(({ value, offset, isMajor }) => (
        <span
          key={value}
          className={`editor-ruler-tick${isMajor ? " is-major" : ""}`}
          style={{ [axis]: `${offset}px` }}
        >
          {isMajor && <span className="editor-ruler-label">{value}</span>}
        </span>
      ))}
    </div>
  );
}
