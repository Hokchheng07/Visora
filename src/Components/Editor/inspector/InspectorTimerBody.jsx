import { useAppDispatch } from "../../redux/hook.js";
import { targetChanged } from "../../redux/editorSlice.js";
import { TIMER_BUTTON_COLORS, TIMER_FORMATS, TIMER_MAX_MS, TIMER_MIN_MS, TIMER_SOUNDS } from "../model/editorDocument.js";
import {
  ColourRow, DraftInput, FieldLabel, InspectorSection, LayoutFields, ResetStyle, SelectField, TextStrokeSection, ToggleRow,
} from "./EditorInspectorFields.jsx";
import { Segmented } from "../ui/EditorControls.jsx";
import { elementsTarget, timerTarget } from "./inspectorEdit.js";
import { EDITOR_FONT_OPTIONS } from "../model/fontCatalog.js";
import { DEFAULT_EDITOR_TEXT_COLOR } from "../model/editorDefaults.js";

/*
 * The timer's settings: mode, duration, what happens at zero, style, which
 * controls show on the backdrop, and position. Same rows as before the shared
 * fields existed; what changed is how they write. Typed values commit once on
 * Enter or blur, the opacity slider is one undo step per drag, and every write
 * names this timer, so a commit after the selection moved still lands here.
 */

const SOUND_LABELS = { chime: "Chime", bell: "Bell", "soft-ding": "Soft ding", none: "None" };
const STYLE_SWATCHES = [DEFAULT_EDITOR_TEXT_COLOR, "#705AE0", "#FFC21C", "#DA4EC9", "#2F7A55", "#C4443E"];
const FONT_SIZES = [72, 96, 120, 144, 180, 240];
const DEFAULT_STYLE = { fill: DEFAULT_EDITOR_TEXT_COLOR, fontFamily: "Poppins", fontSize: 120, opacity: 1 };
const BUTTON_ROLES = [["start", "Start"], ["pause", "Pause / Resume"], ["stop", "Stop"], ["reset", "Reset"]];
// A stopwatch has no Pause: its Stop freezes the count and Start carries on.
const STOPWATCH_ROLES = [["start", "Start"], ["stop", "Stop"], ["reset", "Reset"]];
const FORMAT_LABELS = { "HH:MM:SS": "Hours, minutes, seconds (00:05:00)", "MM:SS": "Minutes, seconds (05:00)" };
const COUNTDOWN_CONTROLS = [["startStop", "Start / Stop"], ["pauseResume", "Pause / Resume"], ["reset", "Reset"]];
const STOPWATCH_CONTROLS = [["startStop", "Start / Stop"], ["reset", "Reset"]];
const PARTS = [["hh", "HH", "Hours", 24], ["mm", "MM", "Minutes", 59], ["ss", "SS", "Seconds", 59]];

/* HH:MM:SS as three fields. Each part clamps on its own, then the whole is
   clamped to one second through 24 hours. */
function splitDuration(ms) {
  const total = Math.floor(ms / 1000);
  return { hh: Math.floor(total / 3600), mm: Math.floor((total % 3600) / 60), ss: total % 60 };
}
const joinDuration = ({ hh, mm, ss }) => Math.min(TIMER_MAX_MS, Math.max(TIMER_MIN_MS, (hh * 3600 + mm * 60 + ss) * 1000));

export default function InspectorTimerBody({ element, pageId, busy }) {
  const dispatch = useAppDispatch();
  const timer = element.timer || {};
  const parts = splitDuration(timer.durationMs || 0);
  const settings = timerTarget(pageId, element.id);
  const style = elementsTarget(pageId, [element.id]);
  const setTimer = (changes, target = settings) => dispatch(targetChanged({ target, changes }));
  const setStyle = (changes) => dispatch(targetChanged({ target: style, changes }));
  const stopwatch = timer.mode === "STOPWATCH";

  return (
    <>
      {/* Switching keeps everything: a countdown's duration and completion
          settings stay on the timer while it is a stopwatch, so switching back
          loses nothing. */}
      <InspectorSection title="Timer">
        <Segmented label="Timer type" hideLabel value={stopwatch ? "STOPWATCH" : "COUNTDOWN"} disabled={busy}
          onChange={(mode) => setTimer({ mode })} options={[
            { value: "COUNTDOWN", label: "Countdown" },
            { value: "STOPWATCH", label: "Stopwatch" },
          ]} />
        {stopwatch && <p className="editor-inspector-hint">Counts up from 00:00:00 (hours:minutes:seconds). Start/Stop freezes and continues the count; Reset puts it back to zero.</p>}
      </InspectorSection>

      {!stopwatch && <>
      <InspectorSection title="Countdown">
        <FieldLabel>Format</FieldLabel>
        <SelectField label="Countdown format" value={TIMER_FORMATS.includes(timer.format) ? timer.format : "HH:MM:SS"} disabled={busy}
          options={TIMER_FORMATS.map((format) => ({ value: format, label: FORMAT_LABELS[format] }))}
          onChange={(format) => setTimer({ format })} />
        <FieldLabel>Duration</FieldLabel>
        <div className="editor-duration">
          {PARTS.map(([key, short, long, max]) => {
            const parse = (raw) => {
              const digits = String(raw).replace(/[^0-9]/g, "");
              return digits === "" ? null : Math.max(0, Math.min(max, Number(digits)));
            };
            return (
              <label key={key}>
                <DraftInput inputMode="numeric" aria-label={long} disabled={busy} value={String(parts[key]).padStart(2, "0")}
                  parse={(raw) => { const value = parse(raw); return value === null ? null : String(value).padStart(2, "0"); }}
                  context={settings}
                  onCommit={(value, target) => setTimer({ durationMs: joinDuration({ ...parts, [key]: Number(value) }) }, target)}
                  onStep={(current, step) => String(Math.max(0, Math.min(max, Number(current) + Math.sign(step)))).padStart(2, "0")} />
                <span>{short}</span>
              </label>
            );
          })}
        </div>
      </InspectorSection>

      <InspectorSection title="When time ends">
        <SelectField label="Completion sound" value={timer.onComplete?.sound || "chime"} disabled={busy}
          options={TIMER_SOUNDS.map((sound) => ({ value: sound, label: `Sound: ${SOUND_LABELS[sound]}` }))}
          onChange={(sound) => setTimer({ onComplete: { sound } })} />
        <DraftInput className="editor-inspector-input" disabled={busy} aria-label="Completion message"
          placeholder="Message instead of 00:00:00 (optional)" value={timer.onComplete?.message || ""}
          parse={(raw) => String(raw)} context={settings}
          onCommit={(message, target) => setTimer({ onComplete: { message } }, target)} />
      </InspectorSection>
      </>}

      <InspectorSection title="Style">
        <div className="editor-inspector-grid">
          <SelectField label="Font" value={element.fontFamily} disabled={busy}
            options={EDITOR_FONT_OPTIONS}
            onChange={(fontFamily) => setStyle({ fontFamily })} />
          <SelectField label="Font size" value={String(FONT_SIZES.includes(element.fontSize) ? element.fontSize : 120)} disabled={busy}
            options={FONT_SIZES.map((size) => ({ value: String(size), label: `${size} px` }))}
            onChange={(size) => setStyle({ fontSize: Number(size) })} />
        </div>
        <ColourRow label="Timer colour" value={element.fill} opacity={element.opacity ?? 1} target={style} disabled={busy}
          toChanges={(fill) => ({ fill })} quickSwatches={STYLE_SWATCHES} />
      </InspectorSection>

      <TextStrokeSection element={element} target={style} busy={busy} />

      <InspectorSection title="Controls shown">
        {(stopwatch ? STOPWATCH_CONTROLS : COUNTDOWN_CONTROLS).map(([key, label]) => (
          // Start/Stop cannot be switched off: hiding it would leave a timer
          // that can neither be started nor stopped from the backdrop.
          <ToggleRow key={key} label={label} checked={timer.controls?.[key] !== false} disabled={busy}
            locked={key === "startStop"} onChange={(checked) => setTimer({ controls: { [key]: checked } })} />
        ))}
      </InspectorSection>

      {/* Written to the timer, not the element style, so the colours travel
          with the timer settings through save, export and Display mode. */}
      <InspectorSection title="Button colours">
        {/* Each row is named for its button, so the three swatches are never a guessing game. */}
        {(stopwatch ? STOPWATCH_ROLES : BUTTON_ROLES).map(([role, label]) => (
          <div key={role} className="editor-inspector-labelled-row">
            <FieldLabel>{label}</FieldLabel>
            <ColourRow label={`${label} button`} value={timer.buttonColors?.[role] || TIMER_BUTTON_COLORS[role]}
              target={settings} property={`buttonColors.${role}`} disabled={busy}
              toChanges={(colour) => ({ buttonColors: { [role]: colour } })} />
          </div>
        ))}
        <ResetStyle disabled={busy} onReset={() => setTimer({ buttonColors: TIMER_BUTTON_COLORS })}>Reset button colours</ResetStyle>
      </InspectorSection>

      <InspectorSection title="Layout">
        <LayoutFields element={element} target={style} disabled={busy} />
      </InspectorSection>

      {/* Style only. Duration, sound, message, control visibility and position
          are decisions about the timer, not its looks, and a style reset that
          silently wiped them would be a trap. */}
      <ResetStyle disabled={busy} onReset={() => setStyle(DEFAULT_STYLE)} />
    </>
  );
}
