import { useCallback, useEffect, useRef, useState } from "react";
import EditorDisplayBar from "./EditorDisplayBar";
import { exitFullscreen, requestFullscreen, useFullscreen } from "./useFullscreen";
import { useIdlePointer } from "./useIdlePointer";
import { StaticElement } from "../canvas/EditorElement.jsx";
import DisplayTimer from "../timer/DisplayTimer.jsx";
import EditorExitPrompt from "../shell/EditorExitPrompt.jsx";
import AnimationSurface from "../animation/AnimationSurface.jsx";
import { playbackInput } from "../animation/animationPlayback.js";

export default function EditorDisplay({ pages, initialPage = 0, onClose }) {
  const [visit, setVisit] = useState({ slide: initialPage, serial: 0, transition: true });
  const slide = visit.slide;
  const rootRef = useRef(null);
  const isIdle = useIdlePointer();
  const controllerRef = useRef(null);
  const [exitPrompt, setExitPrompt] = useState(null);
  /* Which timers have been started, paused or finished. Only a touched timer
     earns a confirmation — leaving an untouched presentation should just leave. */
  const touchedTimers = useRef(new Set());

  const noteTimer = useCallback((id, touched) => {
    if (touched) touchedTimers.current.add(id);
    else touchedTimers.current.delete(id);
  }, []);

  const goTo = useCallback((index, forward = false) => {
    // Leaving a page resets its timers, so nothing is left running unseen.
    if (index < 0 || index >= pages.length) return;
    const previousVisibility = controllerRef.current?.visibility();
    controllerRef.current?.dispose();
    touchedTimers.current.clear();
    setVisit((old) => ({ slide: index, serial: old.serial + 1, transition: forward && index === old.slide + 1,
      previousPage: forward ? pages[old.slide] : null, previousVisibility }));
  }, [pages]);

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
      if (event.repeat || exitPrompt) return;
      if (event.key === "Escape") return requestStop();
      const action = playbackInput(event); if (!action) return;
      event.preventDefault();
      if (action === "next") controllerRef.current?.next();
      else goTo(action === "previous" ? slide - 1 : action === "home" ? 0 : pages.length - 1);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [requestStop, goTo, pages.length, slide, exitPrompt]);

  // Take focus so keys land here and assistive tech enters the dialog.
  // Handing focus back is deliberately the opener's job (Editor.jsx): the
  // same commit that mounts us marks the chrome behind inert, which blurs
  // whatever was focused before this effect ever runs.
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

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
      <div className="editor-display-frame" onClick={(event) => { if (!exitPrompt && playbackInput(event) === "next") controllerRef.current?.next(); }}>
        <div className="editor-display-page" data-page-id={pages[slide]?.id}>
          {pages[slide] && <AnimationSurface key={visit.serial} page={pages[slide]} transition={visit.transition ? pages[slide].transition : null}
            controllerRef={controllerRef} previousPage={visit.previousPage} previousVisibility={visit.previousVisibility} onNextPage={() => goTo(slide + 1, true)}
            renderElement={(element) => (element.type === "timer"
            ? <DisplayTimer key={element.id} element={element} onRequestStop={requestStop} onRunningChange={noteTimer} />
            : <StaticElement key={element.id} element={element} layered />)} />}
        </div>
      </div>
      <EditorDisplayBar
        pages={pages}
        slide={slide}
        onSlideChange={goTo}
        onNext={() => { if (!exitPrompt) controllerRef.current?.next(); }}
        onPrevious={() => { if (!exitPrompt) goTo(slide - 1); }}
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
    </div>
  );
}
