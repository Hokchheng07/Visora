import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
<<<<<<< HEAD

// Design-space size of a page. The rendered pages are scaled to fit the
// workspace, so rulers and the zoom readout derive everything from this pair.
import { CANVAS_WIDTH } from "./elementGeometry.js";
export { CANVAS_WIDTH, CANVAS_HEIGHT } from "./elementGeometry.js";

const INITIAL = { scale: 0, originX: 0, originY: 0, viewWidth: 0, viewHeight: 0 };

function isSame(a, b) {
  return a.scale === b.scale && a.originX === b.originX && a.originY === b.originY
    && a.viewWidth === b.viewWidth && a.viewHeight === b.viewHeight;
}

/* The rulers sit on the workspace edges rather than around a page, so they need
   where the current page starts inside the scroller — not just how big it is.
   There is no zoom control yet, so the scale is observed rather than stored. */
export function useCanvasMetrics() {
  const scrollRef = useRef(null);
  const pageRef = useRef(null);
  const [metrics, setMetrics] = useState(INITIAL);

  const measure = useCallback(() => {
    const scroller = scrollRef.current;
    const page = pageRef.current;
    if (!scroller || !page) return;

    const view = scroller.getBoundingClientRect();
    const rect = page.getBoundingClientRect();
    const next = {
      scale: rect.width / CANVAS_WIDTH,
      originX: rect.left - view.left,
      originY: rect.top - view.top,
      viewWidth: view.width,
      viewHeight: view.height,
    };
    setMetrics((previous) => (isSame(previous, next) ? previous : next));
  }, []);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    if (pageRef.current) observer.observe(pageRef.current);

    return () => {
      observer.disconnect();
    };
  }, [measure]);

  return { scrollRef, pageRef, metrics };
=======
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
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
}
