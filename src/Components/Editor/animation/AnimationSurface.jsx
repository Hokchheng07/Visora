import { useId, useLayoutEffect, useMemo, useRef } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "motion/react";
import { StaticElement } from "../canvas/EditorElement.jsx";
import { visibleElements } from "../model/layerModel.js";
import { createPlaybackController, easeInOut } from "./animationPlayback.js";
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
  const pageMorph = transition?.preset === "morph" && !!previousPage;
  const incomingMorph = useMemo(() => new Set((page.animations || []).filter((row) => row.preset === "morph").map((row) => row.elementId)), [page]);
  const outgoingMorph = useMemo(() => new Set((previousPage?.animations || []).filter((row) => row.preset === "morph").map((row) => row.elementId)), [previousPage]);
  const authored = useMemo(() => new Set((page.animations || []).map((row) => row.elementId)), [page]);
  const hasElementMorph = !!previousPage && (incomingMorph.size > 0 || outgoingMorph.size > 0);
  const visualMorph = pageMorph || hasElementMorph;
  const prefix = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pairs = useMemo(() => {
    if (!visualMorph) return [];
    // Morph rows are temporarily removed for matching so an entrance Morph is
    // considered visible to the overlay. Other entrance animations stay out:
    // they own their motion and the page transition must not override them.
    const matchPage = { ...page, animations: (page.animations || []).filter((row) => row.preset !== "morph") };
    const oldVisibility = { ...previousVisibility };
    outgoingMorph.forEach((id) => { oldVisibility[id] = true; });
    return matchMorph(previousPage, matchPage, oldVisibility).filter((pair) => {
      if (pageMorph) return !pair.to || !authored.has(pair.to.id);
      return (pair.to && incomingMorph.has(pair.to.id)) || (pair.from && outgoingMorph.has(pair.from.id));
    }).map((pair, index) => ({
      from: pair.from && { ...pair.from, id: `${prefix}-old-${index}` },
      to: pair.to && { ...pair.to, id: `${prefix}-new-${index}` },
      targetId: pair.to?.id,
    }));
  }, [visualMorph, page, previousPage, previousVisibility, outgoingMorph, pageMorph, authored, incomingMorph, prefix]);
  const elementMorphTiming = useMemo(() => {
    const rows = [...(page.animations || []), ...(previousPage?.animations || [])].filter((row) => row.preset === "morph");
    if (!rows.length) return null;
    return { preset: "morph", durationMs: Math.max(...rows.map((row) => row.durationMs)), delayMs: Math.min(...rows.map((row) => row.delayMs)) };
  }, [page, previousPage]);
  const callbacks = useRef({ onDone, onNextPage });
  useLayoutEffect(() => { callbacks.current = { onDone, onNextPage }; });
  useLayoutEffect(() => {
    const root = rootRef.current;
    const targets = new Map([...root.querySelectorAll("[data-element-id]")].map((node) => [node.dataset.elementId, node]));
    const fallbackTransition = transition?.preset === "morph" && !pageMorph ? { ...transition, preset: "fade" } : transition;
    const clockTransition = pageMorph ? transition : hasElementMorph ? elementMorphTiming : fallbackTransition;
    const paintMorph = visualMorph && pairs.length ? bindMorph(morphRef.current, pairs, reduceMotion) : null;
    let morphProgress = paintMorph ? 0 : 1;
    const morphTargets = new Set(pairs.map((pair) => pair.targetId).filter(Boolean));
    const controller = createPlaybackController({ page, transition: clockTransition, fallbackTransition, morph: pageMorph, reducedMotion: reduceMotion, preview, drive: animeDriver,
      renderElement(id, frame) {
        const target = targets.get(id); if (!target) return;
        target.style.opacity = frame.opacity; target.style.transform = frame.transform;
        const coveredByMorph = morphTargets.has(id) && morphProgress < 1;
        target.style.visibility = frame.hidden || coveredByMorph ? "hidden" : "visible";
        target.inert = frame.hidden || coveredByMorph;
      },
      renderTransition(progress) {
        if (paintMorph) {
          morphProgress = progress;
          paintMorph(easeInOut(progress));
        }
      },
      onIdle: () => { if (preview && !controller.hasNext) callbacks.current.onDone?.(); },
      onNextPage: () => callbacks.current.onNextPage?.(),
    });
    if (controllerRef) controllerRef.current = controller;
    controller.start();
    return () => { controller.dispose(); if (controllerRef?.current === controller) controllerRef.current = null; };
  }, [page, transition, reduceMotion, preview, controllerRef, pageMorph, hasElementMorph, elementMorphTiming, visualMorph, pairs]);
  return <><div ref={rootRef} className="editor-animation-surface" data-page-id={page.id} style={{ background: page.background?.value || "#FFFFFF" }}>
    {visibleElements(page).map((element) => renderElement ? renderElement(element) : <StaticElement key={element.id} element={element} layered />)}
  </div>{visualMorph && pairs.length > 0 && <MorphOverlay rootRef={morphRef} pairs={pairs} oldPage={previousPage} page={page} reducedMotion={reduceMotion} showBackground={pageMorph} />}</>;
}
