import { useEffect, useState } from "react";

/* Display mode fades its controls (and the cursor) once the pointer settles,
   the way a presentation tool does — nothing should sit on top of a backdrop
   that is being projected. Any pointer or key activity wakes it again. */
export function useIdlePointer(delay = 2600) {
  const [isIdle, setIdle] = useState(false);

  useEffect(() => {
    let timer;

    function wake() {
      setIdle((idle) => (idle ? false : idle));
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), delay);
    }

    wake();
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [delay]);

  return isIdle;
}
