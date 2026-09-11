import { useCallback, useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "motion/react";
import EditorDisplayBar from "./EditorDisplayBar";
import { exitFullscreen, useFullscreen } from "./useFullscreen";
import { useIdlePointer } from "./useIdlePointer";
import { StaticElement } from "./EditorElement.jsx";
import { compileAnimation } from "./animationPresets.js";

const NEXT_KEYS = ["ArrowRight", "ArrowDown", "PageDown", " "];
const PREVIOUS_KEYS = ["ArrowLeft", "ArrowUp", "PageUp"];

export default function EditorDisplay({ pages, initialPage = 0, onClose }) {
  const [slide, setSlide] = useState(initialPage);
  const rootRef = useRef(null);
  const isIdle = useIdlePointer();
  const reduceMotion = useReducedMotion();
  const [liveAnimations, setLiveAnimations] = useState(0);

  const goTo = useCallback(
    (index) => setSlide(Math.max(0, Math.min(pages.length - 1, index))),
    [pages.length],
  );

  // Leaving fullscreen by the browser's own Escape or F11 should close the
  // overlay too, otherwise the editor would stay hidden behind it.
  useFullscreen(onClose);

  const close = useCallback(() => {
    exitFullscreen();
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") return close();

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
  }, [close, goTo, pages.length, slide]);

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
          {pages[slide]?.elements.map((element) => <StaticElement key={element.id} element={element} />)}
        </div>
      </div>
      <EditorDisplayBar
        pages={pages}
        slide={slide}
        onSlideChange={goTo}
        onClose={close}
      />
      {import.meta.env.DEV && <span className="editor-animation-counter" aria-live="polite">Animations: {liveAnimations}</span>}
    </div>
  );
}
