import { useEffect, useState } from "react";

// True while any pointer button is down anywhere in the window. A lost pointer
// (released outside the window, or the window losing focus) counts as released.
export function usePointerHeld() {
  const [held, setHeld] = useState(false);
  useEffect(() => {
    const down = () => setHeld(true);
    const up = () => setHeld(false);
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", up, true);
    window.addEventListener("blur", up);
    return () => {
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", up, true);
      window.removeEventListener("blur", up);
    };
  }, []);
  return held;
}
