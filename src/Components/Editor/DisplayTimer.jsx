import { useCallback, useEffect, useRef, useState } from "react";
import { createTimer } from "animejs";
import { elementStyle } from "./elementGeometry.js";
import TimerArtwork from "./TimerArtwork.jsx";

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
export default function DisplayTimer({ element, onRequestStop, onRunningChange }) {
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
  }, [status, duration, begin, dispose, onRequestStop]);

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
