import { useEffect, useRef } from "react";

/*
 * Asked before a presentation ends while a timer has been touched — from the
 * timer's own Stop button, from the display bar's exit, or after the browser
 * has already dropped out of fullscreen on Escape.
 *
 * That last route is why this can't be a native confirm(): by the time the
 * fullscreenchange event reaches us the browser has already left fullscreen,
 * and it will not let script re-enter without a fresh click. So the overlay
 * stays up and this asks whether to carry on — "Keep presenting" is a real
 * click, which is exactly the gesture re-entering fullscreen needs.
 */
export default function EditorExitPrompt({ onKeep, onStop }) {
  const keepRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    keepRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape") {
        // Escape is what may have opened this; it must not also dismiss it into
        // an unclear state. Treat it as "keep presenting".
        event.preventDefault();
        event.stopPropagation();
        onKeep();
        return;
      }
      if (event.key !== "Tab") return;
      // Focus stays inside the dialog: the page behind is mid-presentation.
      const focusable = dialogRef.current?.querySelectorAll("button");
      if (!focusable?.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onKeep]);

  return (
    <div className="editor-exit-scrim" role="presentation">
      <div ref={dialogRef} className="editor-exit-prompt" role="alertdialog" aria-modal="true"
        aria-labelledby="editor-exit-title" aria-describedby="editor-exit-body">
        <h2 id="editor-exit-title">Stop presenting?</h2>
        <p id="editor-exit-body">Returning to the editor will reset all timers to their original durations.</p>
        <div className="editor-exit-actions">
          <button ref={keepRef} type="button" className="editor-exit-keep" onClick={onKeep}>Keep presenting</button>
          <button type="button" className="editor-exit-stop" onClick={onStop}>Stop and return to editor</button>
        </div>
      </div>
    </div>
  );
}
