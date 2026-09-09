import { useCallback, useLayoutEffect, useRef } from "react";
import {
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import {
  createSmoothPath,
  dashCentrelinePoints,
  getPathData,
} from "../../lib/animations/svgPath";
import dashedJourneySvg from "../../assets/pages/about/journey/BigMiddleDashLine.svg?raw";
// The Home page's doodle scissors, reused so About stays in the same hand-drawn
// language. It has no dark variant; theme.css inverts it instead.
import doodleScissors from "../../assets/pages/home/hero/DoodleScissors.png";

/*
 * A scissors that rides the long dashed journey line as you scroll.
 *
 * The line itself is a filled shape with one closed subpath per dash, so there
 * is nothing to follow directly — the centreline is rebuilt from the dashes at
 * import time (see lib/animations/svgPath.js). The light and dark exports of
 * the line are geometrically identical (max coordinate delta 0.0099 units), so
 * one centreline serves both themes and only the light asset is read here.
 */
const JOURNEY_CENTRELINE = createSmoothPath(
  dashCentrelinePoints(getPathData(dashedJourneySvg)),
);

/* The dashed artwork's own coordinate space. */
const VIEWBOX = { width: 1194, height: 4270 };

/*
 * The line is drawn with `object-fit: fill`, so it is stretched unevenly: its
 * box is 92% of the canvas width by 55.75% of a 1440/7320 canvas, which is a
 * fixed aspect no matter how wide the canvas gets. Positions are therefore
 * plain percentages and need no correction, but a tangent measured in the
 * artwork's coordinates has to have its x component scaled by this before it
 * describes the angle actually seen on screen.
 *   (0.92 * 1440) / (0.5575 * 7320) = 0.32463 box aspect
 *   0.32463 * (4270 / 1194) = 1.161
 */
const TANGENT_X_SCALE = 1.161;

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/*
 * Progress implied by the track's current position, matching the
 * ["start center", "end center"] offset below: 0 when the top of the line
 * reaches the middle of the viewport, 1 when its bottom does.
 */
function progressFromRect(element) {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  if (!rect.height) return 0;
  return clamp01((window.innerHeight / 2 - rect.top) / rect.height);
}

export default function JourneyScissors() {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef(null);
  const pathRef = useRef(null);
  const scissorsRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start center", "end center"],
  });

  /* The value the scissors actually follows. Kept separate from
     scrollYProgress because it only ever moves forward. */
  const progress = useMotionValue(0);

  const place = useCallback((value) => {
    const path = pathRef.current;
    const scissors = scissorsRef.current;
    if (!path || !scissors) return;

    const length = path.getTotalLength();
    const distance = length * value;
    const point = path.getPointAtLength(distance);

    scissors.style.left = `${(point.x / VIEWBOX.width) * 100}%`;
    scissors.style.top = `${(point.y / VIEWBOX.height) * 100}%`;

    /* Direction of travel, sampled either side of the scissors rather than
       ahead of it: sampling forward alone collapses to a zero-length vector at
       the very end of the path, and atan2(0, 0) would snap the rotation to 0. */
    const from = path.getPointAtLength(Math.max(0, distance - 0.5));
    const to = path.getPointAtLength(Math.min(length, distance + 0.5));
    const angle =
      (Math.atan2(to.y - from.y, (to.x - from.x) * TANGENT_X_SCALE) * 180) /
      Math.PI;
    scissors.style.setProperty("--scissors-angle", `${angle}deg`);
  }, []);

  /* Forward only: scrolling back up leaves the scissors where it got to. */
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduceMotion) return;
    progress.set(Math.max(progress.get(), clamp01(value)));
  });

  useMotionValueEvent(progress, "change", place);

  useLayoutEffect(() => {
    const seed = reduceMotion ? 0 : progressFromRect(trackRef.current);
    progress.set(seed);
    /* Place directly rather than leaving it to the change event above: that
       listener is attached in a passive effect which has not run yet, and a
       set() to an unchanged value emits nothing either way. Without this the
       scissors would sit wherever CSS left it — which matters on a reload
       part-way down the page, or when the browser restores a scroll position. */
    place(seed);
  }, [place, progress, reduceMotion]);

  /* An empty centreline means the artwork was re-exported into a shape the
     extraction no longer recognises. It throws in dev; in production the
     scissors just stays away rather than rendering at a nonsense position. */
  if (!JOURNEY_CENTRELINE) return null;

  return (
    <div className="about-journey-scissors-track" ref={trackRef} aria-hidden="true">
      {/* Measured, never seen: getPointAtLength needs a real path in the
          document, and this one is the line's centre rather than its dashes. */}
      <svg
        className="about-journey-scissors-path"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        focusable="false"
      >
        <path ref={pathRef} d={JOURNEY_CENTRELINE} fill="none" />
      </svg>
      <ThemeImage
        className="about-journey-scissors"
        ref={scissorsRef}
        src={doodleScissors}
        alt=""
      />
    </div>
  );
}
