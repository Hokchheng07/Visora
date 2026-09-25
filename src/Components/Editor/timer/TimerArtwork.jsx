import { Play, Pause, RotateCcw, Square } from "lucide-react";
import { TIMER_BUTTON_COLORS } from "../model/editorDocument.js";
import { textStrokeStyle } from "../model/textStroke.js";
import { controlState, formatDuration, formatElapsed, startStopRole, stopwatchRole } from "./timerFormat.js";

/*
 * The one visual implementation of a timer, drawn identically everywhere it
 * appears — editor canvas, page thumbnail, and the projected screen.
 *
 * It owns no time of its own. `interactive` is false for every caller except
 * DisplayTimer: that is what keeps a working Start button out of a 96x54px
 * thumbnail, and what stops a click in the editor from starting a countdown
 * while the design is still being made. Inert buttons are drawn but never
 * receive the pointer, so clicking one selects the element like any other part
 * of it.
 *
 * Sizes are in cqw against the page container, the same unit text uses
 * (1cqw = 19.2 design px), so the whole face scales with the sheet.
 */

const px = (design) => `${design / 19.2}cqw`;
/* Controls are sized in em against the timer's own type, not in cqw.
   .editor-timer-art is a container (so a long completion message can clamp to
   the box), which re-bases any cqw written inside it onto the element's width
   instead of the sheet's — that quietly shrank these to 47%. em keeps the
   controls proportional to the digits wherever the element is used. */
const em = (ratio) => `${ratio}em`;

/* Three positions. The first is one control with two identities — Start until
   the countdown begins, Stop after — so there is never a dead Stop sitting
   beside a Start, and Stop always means "stop presenting", never "stop the
   clock" (Reset does that, without leaving Display mode). */
const BUTTONS = [
  { id: "startStop", tone: null, icon: null, text: null, label: null },
  { id: "pauseResume", tone: "pause", icon: Pause, text: "Pause", label: "Pause countdown" },
  { id: "reset", tone: "reset", icon: RotateCcw, text: "Reset", label: "Reset timer to the configured duration" },
];

/* A stopwatch has two positions: Start/Stop, which starts and freezes the
   count, and Reset, which puts it back to zero. */
const STOPWATCH_BUTTONS = [
  { id: "startStop", tone: null, icon: null, text: null, label: null },
  { id: "reset", tone: "reset", icon: RotateCcw, text: "Reset", label: "Reset stopwatch to zero" },
];

// The exam backdrop uses four always-visible positions. It is still the same
// live countdown: Start begins or resumes it, Stop freezes it, and Restart resets it.
const EXAM_BUTTONS = [
  { id: "start", tone: "start", icon: Play, text: "Start", label: "Start countdown" },
  { id: "pauseResume", tone: "pause", icon: Pause, text: "Pause", label: "Pause countdown" },
  { id: "stop", tone: "stop", icon: Square, text: "Stop", label: "Stop countdown" },
  { id: "reset", tone: "reset", icon: RotateCcw, text: "Restart", label: "Reset timer to the configured duration" },
];

function describe(button, status, stopwatch) {
  if (button.id === "pauseResume" && status === "paused") {
    return { text: "Resume", label: "Resume countdown", Icon: Play, tone: "pause" };
  }
  if (button.id === "start" || button.id === "stop") {
    return { text: button.text, label: button.label, Icon: button.icon, tone: button.tone };
  }
  if (button.id === "startStop" && stopwatch) {
    return stopwatchRole(status) === "stop"
      ? { text: "Stop", label: "Stop the stopwatch", Icon: Square, tone: "stop" }
      : { text: "Start", label: status === "stopped" ? "Start the stopwatch again from here" : "Start the stopwatch", Icon: Play, tone: "start" };
  }
  if (button.id === "startStop") {
    return startStopRole(status) === "start"
      ? { text: "Start", label: "Start countdown", Icon: Play, tone: "start" }
      : { text: "Stop", label: "Stop presenting and return to editor", Icon: Square, tone: "stop" };
  }
  return { text: button.text, label: button.label, Icon: button.icon, tone: button.tone };
}

export default function TimerArtwork({
  element,
  interactive = false,
  status = "ready",
  remainingMs,
  elapsedMs,
  onControl,
}) {
  const timer = element.timer || {};
  const controls = timer.controls || {};
  const stopwatch = timer.mode === "STOPWATCH";
  const exam = !stopwatch && timer.layout === "exam";
  // Both stopwatch buttons always work: Reset clears a running count too.
  const enabled = stopwatch ? { startStop: true, reset: true } : exam
    ? { start: status === "ready" || status === "stopped", pauseResume: status === "running" || status === "paused", stop: status === "running" || status === "paused", reset: true }
    : controlState(status);
  const completed = status === "completed";
  const message = timer.onComplete?.message || "";
  // Inert callers show the configured duration; only a live timer counts down.
  const shown = remainingMs === undefined ? timer.durationMs || 0 : remainingMs;

  // The outline rides on the digits and the completion message, never on the button labels.
  const digitStroke = textStrokeStyle(element);
  const face = stopwatch
    ? <span className="editor-timer-digits is-stopwatch" role={interactive ? "timer" : undefined} style={digitStroke || undefined}>{formatElapsed(elapsedMs || 0)}</span>
    : completed && message
      ? <span className="editor-timer-message" style={digitStroke || undefined}>{message}</span>
      : <span className="editor-timer-digits" style={digitStroke || undefined}>{formatDuration(shown, timer.format)}</span>;

  return (
    <span
      className={`editor-element-art editor-timer-art${interactive ? " is-live" : ""}${exam ? " is-exam" : ""}`}
      style={{
        color: element.fill,
        opacity: element.opacity,
        fontFamily: element.fontFamily,
        fontSize: px(element.fontSize || 120),
        gap: px(28),
      }}
    >
      {face}
      <span className="editor-timer-controls" style={{ gap: em(exam ? .22 : .16) }}>
        {(stopwatch ? STOPWATCH_BUTTONS : exam ? EXAM_BUTTONS : BUTTONS).filter((button) => controls[button.id] !== false).map((button) => {
          const { text, label, Icon, tone } = describe(button, status, stopwatch);
          // StaticElement sits inside the page-thumbnail button. Rendering an
          // inert <button> here would create invalid nested buttons, so only
          // DisplayTimer receives real controls; the editor and thumbnail get
          // visually identical, accessibility-hidden spans.
          const Control = interactive ? "button" : "span";
          return (
            <Control
              key={button.id}
              {...(interactive ? {
                type: "button",
                disabled: !enabled[button.id],
                "aria-label": label,
                onClick: () => onControl?.(button.id),
              } : { "aria-hidden": true })}
              className={`editor-timer-button is-${tone}`}
              style={exam ? {
                background: timer.buttonColors?.[tone] || TIMER_BUTTON_COLORS[tone],
                gap: em(.25), padding: "0", borderRadius: em(.5), fontSize: em(.22), width: em(5.3), height: em(2.2),
              } : {
                background: timer.buttonColors?.[tone] || TIMER_BUTTON_COLORS[tone],
                gap: em(.32), padding: `${em(.46)} ${em(.82)}`, borderRadius: em(.4), fontSize: em(.34),
              }}
              tabIndex={interactive ? 0 : -1}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{text}</span>
            </Control>
          );
        })}
      </span>
    </span>
  );
}
