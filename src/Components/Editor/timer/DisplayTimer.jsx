import { useCallback, useEffect, useRef, useState } from "react";
import { createTimer } from "animejs";
import { elementStyle } from "../model/elementGeometry.js";
import TimerArtwork from "./TimerArtwork.jsx";
import { TIMER_MAX_MS } from "../model/editorDocument.js";
import { formatElapsed } from "./timerFormat.js";

/*
 * The only live timer in the app. Everywhere else draws TimerArtwork inert.
 *
 * Runtime state lives here and nowhere else — not in Redux. The store is
 * serialised to localStorage on every change, so a ticking countdown in there
 * would rewrite the whole document once a second and bury undo under countdown
 * frames. What Redux holds is the configured duration; what this owns is how
 * much of it is left right now, and that is deliberately thrown away on exit.
 *
 * anime.js counts *up*, so the remaining time is always
 * durationMs - timer.currentTime, recomputed per tick rather than decremented.
 */
/* A countdown and a stopwatch run differently, so each has its own component;
   this only picks one. Picking before any hook runs keeps each one's hooks in
   a fixed order. */
export default function DisplayTimer(props) {
  return props.element.timer?.mode === "STOPWATCH" ? <DisplayStopwatch {...props} /> : <DisplayCountdown {...props} />;
}

/*
 * The stopwatch. Elapsed time is read from the clock, never added up tick by
 * tick: it is the time banked by earlier runs plus (now − when Start was last
 * pressed). A throttled background tab or a slow projector laptop can drop
 * frames, but the reading is still right the moment it is drawn again.
 *
 * Like the countdown, nothing here reaches Redux, and leaving the page or
 * display mode throws it away. The clock retains millisecond precision, but
 * the face redraws only when the displayed whole second changes.
 */
function DisplayStopwatch({ element, onRunningChange }) {
  const [status, setStatus] = useState("ready"); // ready → running ⇄ stopped
  const [elapsedMs, setElapsedMs] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const clock = useRef({ banked: 0, startedAt: 0 });

  useEffect(() => {
    onRunningChange?.(element.id, status !== "ready");
  }, [status, element.id, onRunningChange]);

  useEffect(() => {
    if (status !== "running") return undefined;
    let frame = 0;
    let lastSecond = Math.floor(clock.current.banked / 1000);
    const draw = () => {
      const now = clock.current.banked + performance.now() - clock.current.startedAt;
      // The same 24-hour ceiling as a countdown: stop there rather than grow a third hour digit.
      if (now >= TIMER_MAX_MS) {
        clock.current.banked = TIMER_MAX_MS;
        setElapsedMs(TIMER_MAX_MS);
        setStatus("stopped");
        return;
      }
      const second = Math.floor(now / 1000);
      if (second !== lastSecond) {
        lastSecond = second;
        setElapsedMs(second * 1000);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [status]);

  const control = useCallback((id) => {
    if (id === "startStop") {
      if (status === "running") {
        // Stop freezes the reading; the next Start carries on from it.
        const banked = Math.min(TIMER_MAX_MS, clock.current.banked + performance.now() - clock.current.startedAt);
        clock.current.banked = banked;
        setElapsedMs(banked);
        setStatus("stopped");
        setAnnouncement(`Stopwatch stopped at ${formatElapsed(banked)}`);
        return;
      }
      if (clock.current.banked >= TIMER_MAX_MS) return;
      clock.current.startedAt = performance.now();
      setStatus("running");
      setAnnouncement("Stopwatch started");
      return;
    }
    if (id === "reset") {
      clock.current.banked = 0;
      setElapsedMs(0);
      setStatus("ready");
      setAnnouncement("Stopwatch reset to zero");
    }
  }, [status]);

  return (
    <span className="editor-static-element" data-element-id={element.id}
      style={{ ...elementStyle(element), rotate: `${element.rotation}deg` }}>
      <TimerArtwork element={element} interactive status={status} elapsedMs={elapsedMs} onControl={control} />
      {/* Screen readers hear Start, Stop and Reset, never every tick. */}
      <span className="editor-visually-hidden" aria-live="polite">{announcement}</span>
    </span>
  );
}

function DisplayCountdown({ element, onRequestStop, onRunningChange }) {
  const duration = element.timer?.durationMs || 0;
  const [status, setStatus] = useState("ready");
  const [remainingMs, setRemainingMs] = useState(duration);
  const engine = useRef(null);

  const dispose = useCallback(() => {
    // revert() also undoes anything anime.js wrote to the DOM; cancel() alone
    // would leave the instance registered with the engine.
    engine.current?.revert?.();
    engine.current = null;
  }, []);

  // A page change or a document edit that alters the duration resets this
  // timer, exactly as leaving and returning to the page does.
  useEffect(() => {
    dispose();
    setStatus("ready");
    setRemainingMs(duration);
  }, [duration, element.id, dispose]);

  useEffect(() => dispose, [dispose]);

  // Anything that is not "ready" counts as touched, which is what the exit
  // warning upstream is asking about.
  useEffect(() => {
    onRunningChange?.(element.id, status !== "ready");
  }, [status, element.id, onRunningChange]);

  const begin = useCallback((fromMs) => {
    dispose();
    const total = Math.max(0, fromMs);
    engine.current = createTimer({
      duration: total,
      onUpdate: (self) => setRemainingMs(Math.max(0, total - self.currentTime)),
      onComplete: () => {
        setRemainingMs(0);
        setStatus("completed");
        engine.current = null;
      },
    });
    setStatus("running");
  }, [dispose]);

  const control = useCallback((id) => {
    if (id === "start" || id === "stop") {
      if (id === "start" && (status === "ready" || status === "stopped")) begin(status === "ready" ? duration : remainingMs);
      if (id === "stop" && (status === "running" || status === "paused")) {
        dispose();
        setStatus("stopped");
      }
      return;
    }
    /* Position one carries both meanings: begin the countdown while it is
       ready, leave the presentation once it is running. Resuming is position
       two's job, so Start never has to double as Resume. */
    if (id === "startStop") {
      if (status === "ready") begin(duration);
      else onRequestStop?.();
      return;
    }
    if (id === "pauseResume") {
      if (status === "running") { engine.current?.pause(); setStatus("paused"); return; }
      if (status === "paused") { engine.current?.resume(); setStatus("running"); }
      return;
    }
    if (id === "reset") {
      // Stays in Display mode: stop counting, restore the configured duration,
      // and do not start again on its own.
      dispose();
      setRemainingMs(duration);
      setStatus("ready");
    }
  }, [status, duration, remainingMs, begin, dispose, onRequestStop]);

  return (
    <span className="editor-static-element" data-element-id={element.id}
      style={{ ...elementStyle(element), rotate: `${element.rotation}deg` }}>
      <TimerArtwork
        element={element}
        interactive
        status={status}
        remainingMs={remainingMs}
        onControl={control}
      />
    </span>
  );
}
