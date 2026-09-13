import { Play, Pause, RotateCcw, Square } from "lucide-react";
import { controlState, formatDuration, startStopRole } from "./timerFormat.js";

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

function describe(button, status) {
  if (button.id === "startStop") {
    return startStopRole(status) === "start"
      ? { text: "Start", label: "Start countdown", Icon: Play, tone: "start" }
      : { text: "Stop", label: "Stop presenting and return to editor", Icon: Square, tone: "stop" };
  }
  if (button.id === "pauseResume" && status === "paused") {
    return { text: "Resume", label: "Resume countdown", Icon: Play, tone: "pause" };
  }
  return { text: button.text, label: button.label, Icon: button.icon, tone: button.tone };
}

export default function TimerArtwork({
  element,
  interactive = false,
  status = "ready",
  remainingMs,
  onControl,
}) {
  const timer = element.timer || {};
  const controls = timer.controls || {};
  const enabled = controlState(status);
  const completed = status === "completed";
  const message = timer.onComplete?.message || "";
  // Inert callers show the configured duration; only a live timer counts down.
  const shown = remainingMs === undefined ? timer.durationMs || 0 : remainingMs;

  const face = completed && message
    ? <span className="editor-timer-message">{message}</span>
    : <span className="editor-timer-digits">{formatDuration(shown, timer.format)}</span>;

  return (
    <span
      className={`editor-element-art editor-timer-art${interactive ? " is-live" : ""}`}
      style={{
        color: element.fill,
        opacity: element.opacity,
        fontFamily: element.fontFamily,
        fontSize: px(element.fontSize || 120),
        gap: px(28),
      }}
    >
      {face}
      <span className="editor-timer-controls" style={{ gap: em(.16) }}>
        {BUTTONS.filter((button) => controls[button.id] !== false).map((button) => {
          const { text, label, Icon, tone } = describe(button, status);
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
              style={{ gap: em(.32), padding: `${em(.46)} ${em(.82)}`, borderRadius: em(.4), fontSize: em(.34) }}
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
