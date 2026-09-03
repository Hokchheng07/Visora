import { animate } from "animejs/animation";
import { createScope } from "animejs/scope";
import { splitText } from "animejs/text";
import { stagger } from "animejs/utils";
import { useEffect, useRef } from "react";

/**
 * Reveals the hero heading word-by-word, followed by its supporting copy and
 * actions, while keeping Anime.js scoped and reverting its wrappers on unmount.
 */
export function useAnimeHeroCopy() {
  const root = useRef(null);

  useEffect(() => {
    if (!root.current) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    let split;
    const scope = createScope({ root }).add(() => {
      const heading = root.current.querySelector("h1");
      if (!heading) return;

      split = splitText(heading, {
        words: { wrap: "clip" },
        accessible: true,
      });

      // `Backdrops` is nested inside a colored span, so include nested word
      // wrappers as well as the top-level words returned by Anime.js.
      const words = heading.querySelectorAll("[data-word]");
      const supportingCopy = root.current.querySelectorAll(
        "[data-anime-hero-copy]",
      );

      animate(words, {
        opacity: [0, 1],
        y: ["100%", "0%"],
        duration: 650,
        ease: "outCubic",
        delay: stagger(70, { start: 250 }),
      });

      animate(supportingCopy, {
        opacity: [0, 1],
        y: [28, 0],
        duration: 620,
        ease: "outCubic",
        delay: stagger(130, { start: 760 }),
      });
    });

    return () => {
      split?.revert();
      scope.revert();
    };
  }, []);

  return root;
}
