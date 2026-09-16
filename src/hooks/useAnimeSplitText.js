import { animate } from "animejs/animation";
import { spring } from "animejs/easings/spring";
import { createScope } from "animejs/scope";
import { splitText } from "animejs/text";
import { stagger } from "animejs/utils";
import { useEffect, useRef } from "react";

// How long the visitor has to sit still on the hero before the letters bounce,
// and again between bounces while they stay idle.
const IDLE_MS = 7000;
// Desktop only: a real pointer and room for the full hero composition.
const DESKTOP_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "wheel", "scroll", "keydown", "touchstart"];

/**
 * Reveals the hero heading word-by-word, followed by its supporting copy and
 * actions, while keeping Anime.js scoped and reverting its wrappers on unmount.
 *
 * On desktop, once the reveal is done each letter flies up, flips once and
 * springs back down, one after another. The same bounce then replays every
 * IDLE_MS for as long as the visitor stays idle on the hero.
 */
export function useAnimeHeroCopy() {
  const root = useRef(null);

  useEffect(() => {
    if (!root.current) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const desktop = window.matchMedia(DESKTOP_QUERY);
    let split;
    let chars = [];
    let introDone = false;
    let inView = false;
    let idleTimer;
    let bounce;

    const canBounce = () =>
      introDone && inView && desktop.matches && document.visibilityState === "visible" && chars.length > 0;

    // Every call restarts the countdown, so any activity pushes the next bounce
    // IDLE_MS into the future. A bounce already playing is left to land.
    const armIdle = () => {
      clearTimeout(idleTimer);
      if (canBounce()) idleTimer = setTimeout(playBounce, IDLE_MS);
    };

    // Each letter launches, does one quick full flip in the air and lands
    // with a spring, left to right. The flip always starts from 0deg, so the
    // 360deg it ends on is invisible between runs.
    function playBounce() {
      if (!canBounce()) return;
      bounce?.revert();
      bounce = animate(chars, {
        y: [
          { to: "-0.9em", duration: 320, ease: "outQuad" },
          { to: 0, ease: spring({ stiffness: 260, damping: 14, mass: 1 }) },
        ],
        rotate: { from: 0, to: 360, duration: 520, ease: "inOutQuad" },
        delay: stagger(55),
        onComplete: armIdle,
      });
    }

    const scope = createScope({ root }).add(() => {
      const heading = root.current.querySelector("h1");
      if (!heading) return;

      split = splitText(heading, {
        words: { wrap: "clip" },
        chars: true,
        accessible: true,
      });

      // Anime.js tags letters with data-word too, so skip them here. `Backdrops`
      // is nested inside a colored span, so query rather than use split.words.
      const words = heading.querySelectorAll("[data-word]:not([data-char])");
      chars = [...heading.querySelectorAll("[data-char]")];
      const supportingCopy = root.current.querySelectorAll(
        "[data-anime-hero-copy]",
      );

      animate(words, {
        opacity: [0, 1],
        y: ["100%", "0%"],
        duration: 650,
        ease: "outCubic",
        delay: stagger(70, { start: 250 }),
        onComplete: () => {
          // The reveal slides words up through a clipping wrapper; that clip
          // would cut the top off a hopping letter, so lift it afterwards.
          words.forEach((word) => {
            if (word.parentElement) word.parentElement.style.overflow = "visible";
          });
          introDone = true;
          // Play once straight after the reveal, then fall into the idle loop
          // (playBounce re-arms the countdown when it finishes).
          if (canBounce()) playBounce();
          else armIdle();
        },
      });

      animate(supportingCopy, {
        opacity: [0, 1],
        y: [28, 0],
        duration: 620,
        ease: "outCubic",
        delay: stagger(130, { start: 760 }),
      });
    });

    // Only count idle time while at least half of the hero copy is on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        armIdle();
      },
      { threshold: 0.5 },
    );
    observer.observe(root.current);

    ACTIVITY_EVENTS.forEach((type) => window.addEventListener(type, armIdle, { passive: true }));
    document.addEventListener("visibilitychange", armIdle);
    desktop.addEventListener("change", armIdle);

    return () => {
      clearTimeout(idleTimer);
      observer.disconnect();
      ACTIVITY_EVENTS.forEach((type) => window.removeEventListener(type, armIdle));
      document.removeEventListener("visibilitychange", armIdle);
      desktop.removeEventListener("change", armIdle);
      bounce?.revert();
      split?.revert();
      scope.revert();
    };
  }, []);

  return root;
}
