import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate } from "animejs/animation";
import { spring } from "animejs/easings/spring";
import { splitText } from "animejs/text";
import { set, stagger } from "animejs/utils";

/*
 * The "Your backdrop is in review" receipt, as one sequence:
 *
 *   0ms      the heading rises word by word through a clip, then every
 *            letter hops and flips once — the home page hero's move
 *            (hooks/useAnimeSplitText.js), played once rather than on idle.
 *   500ms    the progress line starts filling towards "In review", slowly
 *            and eased at both ends, so it reads as filling up rather than
 *            snapping across.
 *   arrival  the "In review" step, grey until now, lights up: the ring pops
 *            on a spring, the dot springs in, and a soft ripple keeps pulsing
 *            out of it — the design is sitting with an admin, still moving.
 *
 * The line itself is CSS (it is a pseudo-element); its timing comes from the
 * constants below through --line-delay / --line-duration, so the arrival can
 * never drift from it. With reduced motion everything is shown finished.
 */
export const LINE_DELAY_MS = 500;
export const LINE_DURATION_MS = 1400;

const prefersReducedMotion = () => !window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useReviewReceiptMotion(active) {
  const headingRef = useRef(null), currentStepRef = useRef(null);
  const [reached, setReached] = useState(false);

  // The heading is split and hidden before the first paint, so it never flashes in finished.
  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!active || !heading || prefersReducedMotion()) return undefined;
    const split = splitText(heading, { words: { wrap: "clip" }, chars: true, accessible: true });
    const words = heading.querySelectorAll("[data-word]:not([data-char])");
    const chars = [...heading.querySelectorAll("[data-char]")];
    set(words, { opacity: 0, y: "100%" });
    let hop;
    const reveal = animate(words, {
      opacity: [0, 1], y: ["100%", "0%"], duration: 650, ease: "outCubic", delay: stagger(70, { start: 120 }),
      onComplete: () => {
        // The clip would cut the top off a hopping letter, so it is lifted first.
        words.forEach((word) => { if (word.parentElement) word.parentElement.style.overflow = "visible"; });
        hop = animate(chars, {
          y: [{ to: "-0.55em", duration: 280, ease: "outQuad" }, { to: 0, ease: spring({ stiffness: 260, damping: 14, mass: 1 }) }],
          rotate: { from: 0, to: 360, duration: 480, ease: "inOutQuad" },
          delay: stagger(30),
        });
      },
    });
    return () => { reveal.revert(); hop?.revert(); split.revert(); };
  }, [active]);

  // Focus moves to the heading, so a screen reader announces the receipt.
  // "In review" lights up the moment the line reaches it.
  useEffect(() => {
    if (!active) { setReached(false); return undefined; }
    headingRef.current?.focus();
    if (prefersReducedMotion()) { setReached(true); return undefined; }
    const timer = setTimeout(() => setReached(true), LINE_DELAY_MS + LINE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    const step = currentStepRef.current;
    if (!reached || !step || prefersReducedMotion()) return undefined;
    const icon = step.querySelector(".editor-publish-review-step-icon");
    const dot = step.querySelector(".editor-publish-review-step-dot");
    const pop = animate(icon, { scale: [{ to: 1.18, duration: 150, ease: "outQuad" }, { to: 1, ease: spring({ stiffness: 300, damping: 12 }) }] });
    const grow = dot && animate(dot, { scale: [0, 1], ease: spring({ stiffness: 320, damping: 11 }), delay: 60 });
    return () => { pop.revert(); grow?.revert(); };
  }, [reached]);

  return {
    headingRef, currentStepRef, reached,
    lineStyle: { "--line-delay": `${LINE_DELAY_MS}ms`, "--line-duration": `${LINE_DURATION_MS}ms` },
  };
}
