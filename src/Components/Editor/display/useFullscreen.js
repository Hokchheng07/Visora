import { useEffect, useRef } from "react";

/* Native fullscreen can end by routes the app never sees — the browser handles
   Escape itself without a cancellable keydown, and F11 bypasses us entirely.
   `fullscreenchange` is the only reliable signal, so display mode follows it.

   The guard matters: when requestFullscreen is refused the element is null from
   the very first event, and an unguarded listener would close display mode the
   moment it opened. Only an exit we can prove followed an entry counts. */
export function useFullscreen(onExit) {
  const wasFullscreen = useRef(false);

  useEffect(() => {
    function handleChange() {
      if (document.fullscreenElement) {
        wasFullscreen.current = true;
        return;
      }
      if (wasFullscreen.current) onExit();
    }

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, [onExit]);
}

/* Escape is deliberately not intercepted. Keyboard Lock can stop the browser
   acting on it, but it behaves differently across browsers and it fights what
   the key means — someone pressing Escape wants out now, and answering that
   with a dialog is the wrong trade for a presentation tool. The confirmation
   lives on the Stop button instead, where the intent is unambiguous.

   Kept next to the hook so both halves of the fullscreen dance live together.
   Must be called straight from a click handler: browsers only honour the
   request inside a user gesture, and the gesture does not survive a state
   update. A refusal is not an error — the overlay stands on its own. */
export function requestFullscreen(element) {
  element?.requestFullscreen?.().catch(() => {});
}

export function exitFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}
