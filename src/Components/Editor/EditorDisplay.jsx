import { useCallback, useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "motion/react";
import EditorDisplayBar from "./EditorDisplayBar";
import { exitFullscreen, requestFullscreen, useFullscreen } from "./useFullscreen";
import { useIdlePointer } from "./useIdlePointer";
import { StaticElement } from "./EditorElement.jsx";
import DisplayTimer from "./DisplayTimer.jsx";
import EditorExitPrompt from "./EditorExitPrompt.jsx";
import { compileAnimation } from "./animationPresets.js";

const NEXT_KEYS = ["ArrowRight", "ArrowDown", "PageDown", " "];
const PREVIOUS_KEYS = ["ArrowLeft", "ArrowUp", "PageUp"];

export default function EditorDisplay({ pages, initialPage = 0, onClose }) {
  const [slide, setSlide] = useState(initialPage);
  const rootRef = useRef(null);
  const isIdle = useIdlePointer();
  const reduceMotion = useReducedMotion();
  const [liveAnimations, setLiveAnimations] = useState(0);
  const [exitPrompt, setExitPrompt] = useState(null);
  /* Which timers have been started, paused or finished. Only a touched timer
     earns a confirmation — leaving an untouched presentation should just leave. */
  const touchedTimers = useRef(new Set());

  const noteTimer = useCallback((id, touched) => {
    if (touched) touchedTimers.current.add(id);
    else touchedTimers.current.delete(id);
  }, []);

  const goTo = useCallback((index) => {
    // Leaving a page resets its timers, so nothing is left running unseen.
    touchedTimers.current.clear();
    setSlide(Math.max(0, Math.min(pages.length - 1, index)));
  }, [pages.length]);

  const leave = useCallback(() => {
    touchedTimers.current.clear();
    exitFullscreen();
    onClose();
  }, [onClose]);

  /* One gate for every way out — the timer's Stop button, the display bar's
     exit, Escape, and the browser dropping fullscreen on its own. A timer that
     was never started needs no confirmation; there is nothing to interrupt. */
  const requestStop = useCallback(() => {
    if (!touchedTimers.current.size) { leave(); return; }
    setExitPrompt(true);
  }, [leave]);

  /* Escape ends the browser's fullscreen before any of our code runs, and that
     cannot be prevented without Keyboard Lock — which behaves inconsistently
     across browsers and, on Opera, took the whole window out of fullscreen.
     So the exit is not fought: the overlay stays up, asks, and "Keep
     presenting" is the click the browser needs to restore fullscreen. */
  useFullscreen(requestStop);


  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") return requestStop();

      let next = null;
      if (NEXT_KEYS.includes(event.key)) next = slide + 1;
      else if (PREVIOUS_KEYS.includes(event.key)) next = slide - 1;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = pages.length - 1;
      if (next === null) return;

      // Space and the arrows would otherwise scroll whatever is behind us.
      event.preventDefault();
      goTo(next);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [requestStop, goTo, pages.length, slide]);

  // Take focus so keys land here and assistive tech enters the dialog.
  // Handing focus back is deliberately the opener's job (Editor.jsx): the
  // same commit that mounts us marks the chrome behind inert, which blurs
  // whatever was focused before this effect ever runs.
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  useEffect(() => {
    const page = pages[slide]; const root = rootRef.current; if (!page || !root) return;
    const running = [];
    const pageParams = compileAnimation(page.animation, reduceMotion);
    if (pageParams) running.push(animate(root.querySelector(".editor-display-page"), pageParams));
    for (const element of page.elements) {
      const params = compileAnimation(element.animation, reduceMotion); if (!params) continue;
      const target = root.querySelector(`[data-element-id="${CSS.escape(element.id)}"]`); if (target) running.push(animate(target, params));
    }
    setLiveAnimations(running.length);
    return () => { running.forEach((animation) => animation.revert()); };
  }, [pages, slide, reduceMotion]);

  // Backdrops are shown on projectors and TVs, where the screen dimming
  // part-way through an event is the failure people remember. Unsupported in
  // Firefox and older Safari, so every step is guarded.
  useEffect(() => {
    let lock = null;
    let released = false;

    navigator.wakeLock
      ?.request("screen")
      .then((sentinel) => {
        if (released) return sentinel.release().catch(() => {});
        lock = sentinel;
      })
      .catch(() => {});

    return () => {
      released = true;
      lock?.release().catch(() => {});
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`editor-display${isIdle ? " is-idle" : ""}`}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Display mode, page ${slide + 1} of ${pages.length}`}
    >
      <div className="editor-display-frame">
        <div className="editor-display-page" data-page-id={pages[slide]?.id}>
          {pages[slide]?.elements.map((element) => (element.type === "timer"
            ? <DisplayTimer key={element.id} element={element} onRequestStop={requestStop} onRunningChange={noteTimer} />
            : <StaticElement key={element.id} element={element} />))}
        </div>
      </div>
      <EditorDisplayBar
        pages={pages}
        slide={slide}
        onSlideChange={goTo}
        onClose={requestStop}
      />
      {exitPrompt && (
        <EditorExitPrompt
          onKeep={() => {
            setExitPrompt(null);
            /* Restore fullscreen whenever it is gone, not only when the
               fullscreenchange path raised this. Escape can arrive as a plain
               keydown *and* as a fullscreen exit, and whichever landed first
               used to decide whether the presentation came back — leaving the
               presenter stranded in a window. This click is the user gesture
               the browser requires, so it is the one chance to recover. */
            if (!document.fullscreenElement) requestFullscreen(rootRef.current);
          }}
          onStop={() => { setExitPrompt(null); leave(); }}
        />
      )}
      {import.meta.env.DEV && <span className="editor-animation-counter" aria-live="polite">Animations: {liveAnimations}</span>}
    </div>
  );
}
