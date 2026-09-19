import { useId, useLayoutEffect, useMemo, useRef } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "motion/react";
import { StaticElement } from "../canvas/EditorElement.jsx";
import { visibleElements } from "../model/layerModel.js";
import { animationFrame, createPlaybackController, easeInOut } from "./animationPlayback.js";
import MorphOverlay from "./MorphOverlay.jsx";
import { bindMorph, matchMorph } from "./morph.js";

function animeDriver(duration, update, complete) {
  const clock = { time: 0 };
  const animation = animate(clock, { time: duration, duration, ease: "linear", onUpdate: () => update(clock.time), onComplete: complete });
  return { cancel: () => animation.cancel() };
}

// Shared surface for presentation and canvas preview. Animation styles live only
// on this disposable DOM tree; authored geometry and Redux never receive frames.
export default function AnimationSurface({ page, transition = page.transition, controllerRef, preview = false, onDone, onNextPage, renderElement, previousPage, previousVisibility }) {
  const rootRef = useRef(null), reduceMotion = useReducedMotion();
  const morphRef = useRef(null);
  const morph = transition?.preset === "morph" && !!previousPage;
  const prefix = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pairs = useMemo(() => morph ? matchMorph(previousPage, page, previousVisibility).map((pair, index) => ({
    from: pair.from && { ...pair.from, id: `${prefix}-old-${index}` },
    to: pair.to && { ...pair.to, id: `${prefix}-new-${index}` },
  })) : [], [morph, previousPage, page, previousVisibility, prefix]);
  const callbacks = useRef({ onDone, onNextPage });
  useLayoutEffect(() => { callbacks.current = { onDone, onNextPage }; });
  useLayoutEffect(() => {
    const root = rootRef.current;
    const targets = new Map([...root.querySelectorAll("[data-element-id]")].map((node) => [node.dataset.elementId, node]));
    const entry = transition?.preset === "morph" && !morph ? { ...transition, preset: "fade" } : transition;
    const paintMorph = morph ? bindMorph(morphRef.current, pairs, reduceMotion) : null;
    const controller = createPlaybackController({ page, transition: entry, morph, reducedMotion: reduceMotion, preview, drive: animeDriver,
      renderElement(id, frame) {
        const target = targets.get(id); if (!target) return;
        target.style.opacity = frame.opacity; target.style.transform = frame.transform;
        target.style.visibility = frame.hidden ? "hidden" : "visible";
        target.inert = frame.hidden;
      },
      renderTransition(progress) {
        if (paintMorph) {
          paintMorph(easeInOut(progress));
          root.style.visibility = progress < 1 ? "hidden" : "visible";
          root.style.opacity = progress < 1 ? "0" : "1";
          root.inert = progress < 1;
          return;
        }
        const frame = animationFrame({ kind: "entrance", preset: entry?.preset || "fade", durationMs: 1 }, progress, reduceMotion);
        root.style.opacity = frame.opacity; root.style.transform = frame.transform;
      },
      onIdle: () => { if (preview && !controller.hasNext) callbacks.current.onDone?.(); },
      onNextPage: () => callbacks.current.onNextPage?.(),
    });
    if (controllerRef) controllerRef.current = controller;
    controller.start();
    return () => { controller.dispose(); if (controllerRef?.current === controller) controllerRef.current = null; };
  }, [page, transition, reduceMotion, preview, controllerRef, morph, pairs]);
  return <><div ref={rootRef} className="editor-animation-surface" data-page-id={page.id} style={{ background: page.background?.value || "#FFFFFF" }}>
    {visibleElements(page).map((element) => renderElement ? renderElement(element) : <StaticElement key={element.id} element={element} layered />)}
  </div>{morph && <MorphOverlay rootRef={morphRef} pairs={pairs} oldPage={previousPage} page={page} reducedMotion={reduceMotion} />}</>;
}
