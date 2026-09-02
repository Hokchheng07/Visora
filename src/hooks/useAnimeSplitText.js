import { animate } from "animejs/animation";
import { createScope } from "animejs/scope";
import { splitText } from "animejs/text";
import { stagger } from "animejs/utils";
import { useEffect, useRef } from "react";

/**
 * Reveals a heading word-by-word while keeping Anime.js scoped to the React
 * element and cleaning up the generated wrappers on unmount.
 */
export function useAnimeSplitText() {
  const root = useRef(null);

  useEffect(() => {
    if (!root.current) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    let split;
    const scope = createScope({ root }).add(() => {
      split = splitText(root.current, {
        words: { wrap: "clip" },
        accessible: true,
      });

      // `Backdrops` is nested inside a colored span, so include nested word
      // wrappers as well as the top-level words returned by Anime.js.
      const words = root.current.querySelectorAll("[data-word]");

      animate(words, {
        opacity: [0, 1],
        y: ["100%", "0%"],
        duration: 650,
        ease: "outCubic",
        delay: stagger(70),
      });
    });

    return () => {
      split?.revert();
      scope.revert();
    };
  }, []);

  return root;
}
