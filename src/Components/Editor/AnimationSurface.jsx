import { useLayoutEffect, useRef } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "motion/react";
import { StaticElement } from "./EditorElement.jsx";
import { visibleElements } from "./layerModel.js";
import { animationFrame, createPlaybackController } from "./animationPlayback.js";

function animeDriver(duration, update, complete) {
  const clock = { time: 0 };
  const animation = animate(clock, { time: duration, duration, ease: "linear", onUpdate: () => update(clock.time), onComplete: complete });
  return { cancel: () => animation.cancel() };
}

// Shared surface for presentation and canvas preview. Animation styles live only
// on this disposable DOM tree; authored geometry and Redux never receive frames.
export default function AnimationSurface({ page, transition = page.transition, controllerRef, preview = false, onDone, onNextPage, renderElement }) {
  const rootRef = useRef(null), reduceMotion = useReducedMotion();
  const callbacks = useRef({ onDone, onNextPage });
  useLayoutEffect(() => { callbacks.current = { onDone, onNextPage }; });
  useLayoutEffect(() => {
    const root = rootRef.current;
    const targets = new Map([...root.querySelectorAll("[data-element-id]")].map((node) => [node.dataset.elementId, node]));
    const entry = transition?.preset === "morph" ? { ...transition, preset: "fade" } : transition;
    const controller = createPlaybackController({ page, transition: entry, reducedMotion: reduceMotion, preview, drive: animeDriver,
      renderElement(id, frame) {
        const target = targets.get(id); if (!target) return;
        target.style.opacity = frame.opacity; target.style.transform = frame.transform;
        target.style.visibility = frame.hidden ? "hidden" : "visible";
        target.inert = frame.hidden;
      },
      renderTransition(progress) {
        const frame = animationFrame({ kind: "entrance", preset: entry?.preset || "fade", durationMs: 1 }, progress, reduceMotion);
        root.style.opacity = frame.opacity; root.style.transform = frame.transform;
      },
      onIdle: () => { if (preview && !controller.hasNext) callbacks.current.onDone?.(); },
      onNextPage: () => callbacks.current.onNextPage?.(),
    });
    if (controllerRef) controllerRef.current = controller;
    controller.start();
    return () => { controller.dispose(); if (controllerRef?.current === controller) controllerRef.current = null; };
  }, [page, transition, reduceMotion, preview, controllerRef]);
  return <div ref={rootRef} className="editor-animation-surface" data-page-id={page.id} style={{ background: page.background?.value || "#FFFFFF" }}>
    {visibleElements(page).map((element) => renderElement ? renderElement(element) : <StaticElement key={element.id} element={element} layered />)}
  </div>;
}
