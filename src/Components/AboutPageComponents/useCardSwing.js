import { useEffect, useRef } from "react";
import { animate } from "animejs/animation";
import { createScope } from "animejs/scope";
import { spring } from "animejs/easings/spring";
import { set as setProp } from "animejs/utils";

/* The cards hang from their pins, so every motion here is a rotation about the
   pin rather than a translation: grabbing one swings it, letting go lets it
   settle like a pendulum, and scrolling to the group knocks them into motion.
   Everything lives in a single Anime scope so one revert() on unmount tears
   down the animatables, the observer and the pointer handlers together. */

const REST = 0;
const MAX_ANGLE = 55;          // stops a hard drag from flipping the card over

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/* Resolve the pivot once per grab, not per move. The pin sits at the swing
   element's padding-top, which differs per breakpoint, so it has to be read
   rather than hardcoded — but doing that (plus a bounding-rect read) on every
   pointermove forces layout each frame and makes the drag feel gritty. */
function readPivot(el) {
  const r = el.getBoundingClientRect();
  return {
    x: r.left + r.width / 2,
    y: r.top + (parseFloat(getComputedStyle(el).paddingTop) || 0),
  };
}

/** Angle of the pointer measured from straight-down at the pivot, in degrees. */
function angleFromPivot(pivot, clientX, clientY) {
  // atan2 gives 0 along +x, so subtract 90deg to make "hanging straight down" zero.
  const deg = (Math.atan2(clientY - pivot.y, clientX - pivot.x) * 180) / Math.PI - 90;
  return clamp(deg, -MAX_ANGLE, MAX_ANGLE);
}

export function useCardSwing() {
  const root = useRef(null);

  useEffect(() => {
    if (!root.current) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    let observer;
    const scope = createScope({ root }).add(() => {
      const cards = Array.from(root.current.querySelectorAll("[data-swing]"));
      if (!cards.length) return;

      /* Dragging writes rotation straight through utils.set rather than an
         animatable: an animatable keeps a live animation on `rotate`, which
         competes with the spring animations below and leaves the card stuck
         at whatever angle the spring started from.

         Each spring is built per call, never shared — a Spring instance binds
         itself to one JSAnimation via `parent`, so reusing one across the four
         cards makes them fight over it and every card freezes on its start
         angle instead of settling. */
      /* Both springs are tuned by their damping ratio rather than by eye:
         zeta = damping / (2 * sqrt(stiffness * mass)). Around 0.3 the card
         crosses centre two or three times before resting, which is what reads
         as a pendulum; the earlier low-stiffness pair had the same ratio but a
         natural frequency of ~7.6 rad/s, so it took 2.6s to settle and felt
         sluggish. Raising stiffness lifts the frequency and roughly halves
         that without flattening the swing out. */
      const settle = () => spring({ stiffness: 180, damping: 9, mass: 1 });   // zeta 0.34, ~0.9s
      const nudge = () => spring({ stiffness: 200, damping: 8, mass: 1 });    // zeta 0.28, ~1.0s

      /* --- drag to swing ------------------------------------------------ */
      const dragging = new Map();

      function onPointerDown(event, index, el) {
        // Ignore secondary buttons so right-click menus still work.
        if (event.button !== 0) return;
        el.setPointerCapture(event.pointerId);
        dragging.set(event.pointerId, {
          index,
          el,
          pivot: readPivot(el),
          angle: REST,
          moved: false,
        });
        el.classList.add("is-swinging");
      }

      /* Writes are coalesced to one per frame: pointermove can fire several
         times per frame on a high-rate mouse, and each extra write is a wasted
         style recalculation rather than a smoother swing. */
      let frame = 0;
      function flush() {
        frame = 0;
        dragging.forEach((drag) => setProp(drag.el, { rotate: drag.angle }));
      }

      function onPointerMove(event) {
        const drag = dragging.get(event.pointerId);
        if (!drag) return;
        event.preventDefault();
        drag.angle = angleFromPivot(drag.pivot, event.clientX, event.clientY);
        drag.moved = true;
        if (!frame) frame = requestAnimationFrame(flush);
      }

      function onPointerUp(event) {
        const drag = dragging.get(event.pointerId);
        if (!drag) return;
        dragging.delete(event.pointerId);
        drag.el.classList.remove("is-swinging");
        if (drag.el.hasPointerCapture?.(event.pointerId)) {
          drag.el.releasePointerCapture(event.pointerId);
        }
        // A click that never moved leaves no angle to settle, so skip the
        // spring entirely — that keeps a plain click free for navigation later.
        if (!drag.moved) return;
        // Hand the current angle to a spring so it swings past centre and settles.
        animate(drag.el, { rotate: REST, ease: settle() });
      }

      const teardown = [];
      cards.forEach((el, index) => {
        const down = (e) => onPointerDown(e, index, el);
        el.addEventListener("pointerdown", down);
        el.addEventListener("pointermove", onPointerMove);
        el.addEventListener("pointerup", onPointerUp);
        el.addEventListener("pointercancel", onPointerUp);
        teardown.push(() => {
          el.removeEventListener("pointerdown", down);
          el.removeEventListener("pointermove", onPointerMove);
          el.removeEventListener("pointerup", onPointerUp);
          el.removeEventListener("pointercancel", onPointerUp);
        });
      });

      /* --- swing in on scroll ------------------------------------------- */
      // Alternating start angles so the group looks knocked, not marching.
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const index = cards.indexOf(entry.target);
            if (index === -1) return;
            observer.unobserve(entry.target);
            animate(entry.target, {
              rotate: [index % 2 ? 14 : -16, REST],
              ease: nudge(),
              delay: index * 90,
            });
          });
        },
        { threshold: 0.35 },
      );
      cards.forEach((el) => observer.observe(el));

      return () => {
        if (frame) cancelAnimationFrame(frame);
        teardown.forEach((fn) => fn());
      };
    });

    return () => {
      observer?.disconnect();
      scope.revert();
    };
  }, []);

  return root;
}
