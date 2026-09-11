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
    const next = { scale: zoom || fitScale, fitScale, originX: rect.left - view.left + scroller.scrollLeft,
      originY: rect.top - view.top + scroller.scrollTop, viewWidth: view.width, viewHeight: view.height };
    setMetrics((previous) => Object.keys(next).every((key) => Math.abs(previous[key] - next[key]) < .001) ? previous : next);
  }, [zoom]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    const scroller = scrollRef.current; if (!scroller) return;
    const observer = new ResizeObserver(measure); observer.observe(scroller); if (pageRef.current) observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, [measure]);
  return { scrollRef, pageRef, metrics, pageStyle: metrics.scale ? { width: `${CANVAS_WIDTH * metrics.scale}px` } : undefined };
}
