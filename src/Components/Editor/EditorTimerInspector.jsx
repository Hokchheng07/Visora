import { Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { elementChanged, timerChanged } from "../redux/editorSlice.js";
import { TIMER_MAX_MS, TIMER_MIN_MS, TIMER_SOUNDS } from "./editorDocument.js";
import { SliderNumber } from "./EditorControls.jsx";

/*
 * The timer's own settings, in a column of their own.
 *
 * It exists because a timer carries far more configuration than fits a
 * horizontal bar — duration, sound, message, five style fields, four control
 * toggles and a position pair. The floating property bar keeps what every
 * element has (identity, layer order, delete); everything timer-shaped lives
 * here, once, so the same setting is never in two places.
 *
 * Labelled fields are right for a vertical panel even though they were wrong
 * for the toolbar: a column has room to name what it is showing, and a
 * settings list that hides its labels behind icons is worse, not cleaner.
 */

const SOUND_LABELS = { chime: "Chime", bell: "Bell", "soft-ding": "Soft ding", none: "None" };
const STYLE_SWATCHES = ["#705AE0", "#FFC21C", "#DA4EC9", "#2F7A55", "#C4443E"];
const FONT_SIZES = [72, 96, 120, 144, 180, 240];
const DEFAULT_STYLE = { fill: "#705AE0", fontFamily: "Poppins", fontSize: 120, opacity: 1 };

/* HH:MM:SS as three fields rather than one millisecond number. Each is clamped
   on its own, then the trio is clamped together — a document may legally hold
   00:00:00 while someone is mid-edit, but never a negative or a 25-hour timer.
   Display mode refuses a zero separately, at the moment it is opened. */
function splitDuration(ms) {
  const total = Math.floor(ms / 1000);
  return { hh: Math.floor(total / 3600), mm: Math.floor((total % 3600) / 60), ss: total % 60 };
}

export default function EditorTimerInspector() {
  const dispatch = useAppDispatch();
  const { pages, currentPage, selectedId, selectedIds, gesture } = useAppSelector((state) => state.editor);
  const element = pages[currentPage].elements.find((item) => item.id === selectedId);

  if (!element || element.type !== "timer" || selectedIds.length !== 1) return null;

  const timer = element.timer || {};
  const busy = !!gesture;
  const parts = splitDuration(timer.durationMs || 0);

  const setPart = (key, raw) => {
    const value = Math.max(0, Math.min(key === "hh" ? 24 : 59, Math.round(Number(raw) || 0)));
    const next = { ...parts, [key]: value };
    const ms = (next.hh * 3600 + next.mm * 60 + next.ss) * 1000;
    dispatch(timerChanged({ durationMs: Math.min(TIMER_MAX_MS, Math.max(TIMER_MIN_MS, ms)) }));
  };

  return (
    <aside className="editor-inspector" aria-label="Timer settings">
      <h2 className="editor-inspector-title"><Sparkles size={16} aria-hidden="true" />Customize</h2>

      <section className="editor-inspector-group">
        <h3>Mode</h3>
        {/* Countdown is the only mode that ships; the field exists because the
            schema already carries `mode` and a count-up is the obvious next one. */}
        <select className="editor-inspector-select" aria-label="Timer mode" value="COUNTDOWN" disabled>
          <option value="COUNTDOWN">Countdown</option>
        </select>
      </section>

      <section className="editor-inspector-group">
        <h3>Duration</h3>
        <div className="editor-duration">
          {[["hh", "HH", 24], ["mm", "MM", 59], ["ss", "SS", 59]].map(([key, label, max]) => (
            <label key={key}>
              <input type="text" inputMode="numeric" disabled={busy}
                aria-label={`${label === "HH" ? "Hours" : label === "MM" ? "Minutes" : "Seconds"}`}
                value={String(parts[key]).padStart(2, "0")}
                onChange={(event) => setPart(key, event.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                  event.preventDefault();
                  setPart(key, Math.min(max, Math.max(0, parts[key] + (event.key === "ArrowUp" ? 1 : -1))));
                }} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <p className="editor-inspector-hint">One second to 24 hours.</p>
      </section>

      <section className="editor-inspector-group">
        <h3>When time ends</h3>
        <select className="editor-inspector-select" aria-label="Completion sound" disabled={busy}
          value={timer.onComplete?.sound || "chime"}
          onChange={(event) => dispatch(timerChanged({ onComplete: { sound: event.target.value } }))}>
          {TIMER_SOUNDS.map((sound) => <option key={sound} value={sound}>{SOUND_LABELS[sound]}</option>)}
        </select>
        <input className="editor-inspector-input" type="text" disabled={busy}
          aria-label="Completion message" placeholder="Message (optional) — e.g. Thank you!"
          value={timer.onComplete?.message || ""}
          onChange={(event) => dispatch(timerChanged({ onComplete: { message: event.target.value } }))} />
        <p className="editor-inspector-hint">Leave empty to keep showing 00:00:00.</p>
      </section>

      <section className="editor-inspector-group">
        <h3>Timer style</h3>
        <div className="editor-inspector-swatches">
          {STYLE_SWATCHES.map((colour) => (
            <button type="button" key={colour} style={{ background: colour }} disabled={busy}
              aria-label={colour} aria-pressed={element.fill?.toLowerCase() === colour.toLowerCase()}
              onClick={() => dispatch(elementChanged({ fill: colour }))} />
          ))}
        </div>
        <select className="editor-inspector-select" aria-label="Font" disabled={busy}
          value={element.fontFamily} onChange={(event) => dispatch(elementChanged({ fontFamily: event.target.value }))}>
          <option value="Poppins">Poppins</option>
          <option value="Freehand">Freehand</option>
        </select>
        <select className="editor-inspector-select" aria-label="Font size" disabled={busy}
          value={FONT_SIZES.includes(element.fontSize) ? element.fontSize : 120}
          onChange={(event) => dispatch(elementChanged({ fontSize: Number(event.target.value) }))}>
          {FONT_SIZES.map((size) => <option key={size} value={size}>{size}px</option>)}
        </select>
        <SliderNumber label="Opacity" value={(element.opacity ?? 1) * 100} min={10} max={100} step={1} suffix="%"
          disabled={busy} onChange={(next) => dispatch(elementChanged({ opacity: next / 100 }))} />
      </section>

      <section className="editor-inspector-group">
        <h3>Controls shown</h3>
        {[["startStop", "Start / Stop"], ["pauseResume", "Pause / Resume"], ["reset", "Reset"]].map(([key, label]) => {
          // Start/Stop cannot be switched off: hiding it would leave a timer
          // that can neither be started nor stopped from the backdrop.
          const locked = key === "startStop";
          const on = timer.controls?.[key] !== false;
          return (
            <label key={key} className={`editor-toggle${locked ? " is-locked" : ""}`}>
              <span>{label}</span>
              <input type="checkbox" checked={on} disabled={busy || locked}
                onChange={(event) => dispatch(timerChanged({ controls: { [key]: event.target.checked } }))} />
              <span className="editor-toggle-track" aria-hidden="true" />
            </label>
          );
        })}
        <p className="editor-inspector-hint">Start / Stop is always shown — it is the only way to begin or end the countdown.</p>
      </section>

      <section className="editor-inspector-group">
        <h3>Position</h3>
        <div className="editor-inspector-xy">
          {[["x", "X"], ["y", "Y"]].map(([axis, label]) => (
            <label key={axis}>
              <span>{label}</span>
              <input type="text" inputMode="numeric" disabled={busy} aria-label={`${label} position`}
                value={Math.round(element[axis])}
                onChange={(event) => {
                  const value = Number(event.target.value.replace(/[^0-9-]/g, ""));
                  if (!Number.isNaN(value)) dispatch(elementChanged({ [axis]: value }));
                }} />
              <small>px</small>
            </label>
          ))}
        </div>
      </section>

      {/* Style only. Duration, sound, message, control visibility and position
          are decisions about the timer, not its looks, and a style reset that
          silently wiped them would be a trap. */}
      <button type="button" className="editor-inspector-reset" disabled={busy}
        onClick={() => dispatch(elementChanged(DEFAULT_STYLE))}>Reset style</button>
    </aside>
  );
}
