import { useEffect, useRef, useState } from "react";
import CosmicDust from "./CosmicDust.jsx";

/*
 * A page-length dust field, built the way the landing page gets its own: as a
 * stack of window-tall fields rather than one long one.
 *
 * A single CosmicDust on a 4,000px page keeps its canvas one window tall and
 * slides it down as you scroll, so the same specks follow the reader — the
 * dust belongs to the screen. On the landing page each section owns a field
 * about a window tall, so nothing slides and the dust belongs to the page:
 * scrolling brings new specks rather than carrying the old ones along. This
 * stacks one field per windowful to get the same feel on a page that is not
 * cut into sections.
 *
 * Each slab is exactly its canvas's height, so none of them slide, and only
 * the slab on screen is drawn (every CosmicDust pauses itself when it is not).
 */
export default function CosmicDustField({ particleCount = 120, speedMultiplier, particleSize, trails, className = "" }) {
  const ref = useRef(null);
  const [slabs, setSlabs] = useState(1);
  const [near, setNear] = useState(0);

  /* A tall page needs a lot of slabs, and a canvas costs its backing store
     whether or not it is drawn — sixteen of them is well over a hundred
     megabytes. So the slabs are always in the layout, but only the one on
     screen and its neighbours hold a canvas. */
  useEffect(() => {
    const host = ref.current;
    if (!host) return undefined;
    const measure = () => {
      const windowful = window.innerHeight || 1;
      const box = host.getBoundingClientRect();
      setSlabs(Math.max(1, Math.ceil(box.height / windowful)));
      setNear(Math.max(0, Math.round(-box.top / windowful)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  return (
    <div ref={ref} className={`cosmic-dust-field ${className}`} aria-hidden="true">
      {Array.from({ length: slabs }, (_, index) => (
        <div key={index} className="cosmic-dust-slab">
          {Math.abs(index - near) <= 1 && (
            <CosmicDust particleCount={particleCount} speedMultiplier={speedMultiplier} particleSize={particleSize} trails={trails} />
          )}
        </div>
      ))}
    </div>
  );
}
