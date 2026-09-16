import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./elementGeometry.js";
export { CANVAS_HEIGHT, CANVAS_WIDTH } from "./elementGeometry.js";

const INITIAL = { scale: 0, fitScale: 0, originX: 0, originY: 0, viewWidth: 0, viewHeight: 0 };

export function useCanvasMetrics(zoom = null) {
  const scrollRef = useRef(null), pageRef = useRef(null), [metrics, setMetrics] = useState(INITIAL);
  const measure = useCallback(() => {
    const scroller = scrollRef.current, page = pageRef.current; if (!scroller || !page) return;
    const view = scroller.getBoundingClientRect(), rect = page.getBoundingClientRect();
    const controls = scroller.querySelector(".editor-canvas-bar")?.getBoundingClientRect().height || 0;
    // 108 = the floating bar's own height plus the scroll padding that keeps
    // the sheet clear of it, so Fit never tucks the sheet under the bar.
    const fitScale = Math.max(.1, Math.min((view.width - 48) / CANVAS_WIDTH, (view.height - controls - 108) / CANVAS_HEIGHT));
    /* The page's origin as the rulers see it: measured from the visible corner
       of the workspace, not from the start of the scrolled content. The page
       now sits in the middle of a work area three times its size, so the two
       are a whole page apart and the rulers would count from the wrong place. */
    const next = { scale: zoom || fitScale, fitScale, originX: rect.left - view.left,
      originY: rect.top - view.top, viewWidth: view.width, viewHeight: view.height };
    setMetrics((previous) => Object.keys(next).every((key) => Math.abs(previous[key] - next[key]) < .001) ? previous : next);
  }, [zoom]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    const scroller = scrollRef.current; if (!scroller) return;
    const observer = new ResizeObserver(measure); observer.observe(scroller); if (pageRef.current) observer.observe(pageRef.current);
    // Scrolling moves the page under the rulers, so they have to be re-measured with it.
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer.disconnect(); scroller.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [measure]);
  return { scrollRef, pageRef, metrics, pageStyle: metrics.scale ? { width: `${CANVAS_WIDTH * metrics.scale}px` } : undefined };
}
