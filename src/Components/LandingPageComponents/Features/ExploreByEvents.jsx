import { ThemeImage } from '../../../theme/ThemeImage';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ImageIcon } from "lucide-react";
import EventCard from "./EventCard";
import { placeholderEvents } from "./eventData";
import headingUnderline from "../../../assets/Website/LandingPage/ExploreByEvents/UnderLineForExploreByEvents.svg";
import paperPlane from "../../../assets/Website/LandingPage/ExploreByEvents/PaperPlane(ExploreByEvents).svg";

import topBackground from "../../../assets/Website/LandingPage/ExploreByEvents/TopBg(ExploreByEvents).svg";
import topLeftDoodle from "../../../assets/Website/LandingPage/ExploreByEvents/TopLeft.svg";
import lightPurpleLayer from "../../../assets/Website/LandingPage/ExploreByEvents/LightPurpleBackground.svg";
import foregroundPurple from "../../../assets/Website/LandingPage/ExploreByEvents/ForegroundPurple.svg";
import leftGlow from "../../../assets/Website/LandingPage/ExploreByEvents/LeftLayerBlur(ExploreByEvents).svg";
import centerGlow from "../../../assets/Website/LandingPage/ExploreByEvents/CenterLayerBlur(ExploreByEvents).svg";
import rightGlow from "../../../assets/Website/LandingPage/ExploreByEvents/RightLayerBlur.svg";
import arrowPointingUp from "../../../assets/Website/LandingPage/ExploreByEvents/ArrowPointingUp(ExploreByEvents).svg";
import lineTop from "../../../assets/Website/LandingPage/ExploreByEvents/LineTop(ExploreByEvents).svg";
import lineRight from "../../../assets/Website/LandingPage/ExploreByEvents/LineRight(ExploreByEvents).svg";
import lineBottom from "../../../assets/Website/LandingPage/ExploreByEvents/LineBottom(ExploreByEvents).svg";

const PINNED_VIEWPORT = "(min-width: 1024px) and (min-height: 700px) and (hover: hover) and (pointer: fine)";
const clamp = (value) => Math.min(1, Math.max(0, value));

const roundCoordinate = (value) => Math.round(value * 100) / 100;

function buildHangingPath(points) {
  if (points.length < 2) return "";

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const distance = point.x - previous.x;
    const sag = Math.min(54, Math.max(28, distance * 0.16));
    const controlY = Math.max(previous.y, point.y) + sag;
    return `${path} C ${roundCoordinate(previous.x + distance * 0.32)} ${roundCoordinate(controlY)}, ${roundCoordinate(point.x - distance * 0.32)} ${roundCoordinate(controlY)}, ${roundCoordinate(point.x)} ${roundCoordinate(point.y)}`;
  }, `M ${roundCoordinate(points[0].x)} ${roundCoordinate(points[0].y)}`);
}

function HangingLine({ geometry }) {
  if (!geometry.path) return null;

  return (
    <svg
      className="hanging-lines"
      width={geometry.width}
      height={geometry.height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      fill="none"
      overflow="visible"
      aria-hidden="true"
    >
      <path
        className="hanging-line-path"
        d={geometry.path}
        stroke="var(--events-line)"
        strokeWidth="3"
        strokeDasharray="8 8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function HangingCardSet({ events, duplicate, setRef }) {
  const cardSetRef = useRef(null);
  const [lineGeometry, setLineGeometry] = useState({ path: "", width: 0, height: 0 });
  const assignCardSetRef = useCallback((node) => {
    cardSetRef.current = node;
    if (setRef) setRef.current = node;
  }, [setRef]);

  useLayoutEffect(() => {
    const cardSet = cardSetRef.current;
    if (!cardSet || events.length < 2) return undefined;

    const measure = () => {
      const setBounds = cardSet.getBoundingClientRect();
      const cards = [...cardSet.querySelectorAll(".hanging-card-slot")];
      const points = cards.map((card, index) => {
        const image = card.querySelector(".hanging-card-image");
        const imageBounds = image.getBoundingClientRect();
        const pin = events[index].pin ?? { x: 0.5, y: 0.15 };
        return {
          x: imageBounds.left - setBounds.left + imageBounds.width * pin.x,
          y: imageBounds.top - setBounds.top + imageBounds.width * pin.y,
        };
      });

      if (points.length < 2) return;
      // End at the first pin of the following copy. This makes the seam use
      // the same measured high-to-high clothesline curve as every other gap.
      points.push({ x: setBounds.width + points[0].x, y: points[0].y });
      const width = roundCoordinate(points.at(-1).x + 2);
      const height = roundCoordinate(Math.max(...points.map((point) => point.y)) + 58);
      const path = buildHangingPath(points);
      setLineGeometry((current) => (
        current.path === path && current.width === width && current.height === height
          ? current
          : { path, width, height }
      ));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(cardSet);
    cardSet.querySelectorAll(".hanging-card-slot, .hanging-card-image").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [events]);

  return (
    <div ref={assignCardSetRef} className="events-card-set" aria-hidden={duplicate || undefined}>
      <HangingLine geometry={lineGeometry} />
      {events.map((event, index) => (
        <EventCard
          key={`${duplicate ? "duplicate" : "event"}-${event.id}`}
          event={event}
          index={index}
          count={events.length}
          duplicate={duplicate}
        />
      ))}
    </div>
  );
}

// Pass API records as events when available. Measure again when data or the
// viewport changes so the scroll runway always matches the actual card row.
export default function ExploreByEvents({ events = placeholderEvents }) {
  const journeyRef = useRef(null);
  const stageRef = useRef(null);
  const [stageHeight, setStageHeight] = useState(0);
  const [pinTop, setPinTop] = useState(0);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const setRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [desktop, setDesktop] = useState(false);
  const [travel, setTravel] = useState(0);
  const [startOffset, setStartOffset] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const pinned = desktop && !reduceMotion && events.length > 1;
  const progress = useMotionValue(0);
  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: [`start ${pinTop}px`, `end ${pinTop + stageHeight}px`],
  });
  const trackTransform = useTransform(progress, (value) =>
    pinned
      ? `translate3d(${-(travel + startOffset + value * travel)}px, 0, 0)`
      : "translate3d(0, 0, 0)",
  );

  useEffect(() => {
    const query = window.matchMedia(PINNED_VIEWPORT);
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const cardSet = setRef.current;
    const measure = () => {
      const firstCard = cardSet?.querySelector(".hanging-card-slot");
      const loopWidth = cardSet?.getBoundingClientRect().width ?? 0;
      const distance = pinned
        ? loopWidth
        : Math.max(0, track.scrollWidth - viewport.clientWidth);
      setTravel(distance);
      setStartOffset(pinned && firstCard ? firstCard.getBoundingClientRect().width * 0.79 : 0);
      setStageHeight(stageRef.current.offsetHeight);
      setPinTop(pinned ? parseFloat(getComputedStyle(stageRef.current).top) || 0 : 0);
      if (!pinned) progress.set(distance ? clamp(viewport.scrollLeft / distance) : 0);
    };
    // Do not add native horizontal scroll to the pinned track's transform.
    viewport.scrollLeft = 0;
    progress.set(0);
    setActiveIndex(0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    if (cardSet) observer.observe(cardSet);
    observer.observe(stageRef.current);
    // The navbar offset can change at a height breakpoint without resizing
    // the cards, so also remeasure on window resize.
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned, events.length, progress]);

  useLayoutEffect(() => {
    if (pinned && travel) {
      progress.set(clamp((pinTop - journeyRef.current.getBoundingClientRect().top) / travel));
    }
  }, [pinned, travel, pinTop, progress]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (pinned) progress.set(clamp(value));
  });
  useMotionValueEvent(progress, "change", (value) => {
    if (!events.length) return setActiveIndex(0);
    const loopPosition = value >= 1 ? 0 : value * events.length;
    setActiveIndex(Math.min(events.length - 1, Math.floor(loopPosition)));
  });

  const goToStep = (step, instant = false) => {
    const target = Math.max(0, Math.min(events.length, step));
    const ratio = events.length ? target / events.length : 0;
    const behavior = reduceMotion || instant ? "instant" : "smooth";
    if (pinned) {
      const top = journeyRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - pinTop + ratio * travel, behavior });
    } else {
      const card = trackRef.current.querySelector(`[data-event-index="${Math.min(target, events.length - 1)}"]`);
      if (!card) return;
      viewportRef.current.scrollTo({
        left: card.offsetLeft - (viewportRef.current.clientWidth - card.offsetWidth) / 2,
        behavior,
      });
    }
  };

  const handleKeyDown = (event) => {
    const currentStep = pinned
      ? Math.min(events.length, Math.round(progress.get() * events.length))
      : activeIndex;
    const targets = {
      ArrowLeft: currentStep - 1,
      ArrowRight: currentStep + 1,
      Home: 0,
      End: Math.max(0, events.length - 1),
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    goToStep(targets[event.key], true);
  };

  return (
    <section
      id="explore-events"
      className="explore-events-section events-section bg-sparkle"
      aria-labelledby="events-title"
      style={{ "--events-scroll-distance": `${pinned ? travel : 0}px` }}
    >
      <ThemeImage src={topBackground} alt="" aria-hidden="true" className="explore-events-top-background" />
      <ThemeImage src={topLeftDoodle} alt="" aria-hidden="true" className="explore-events-top-left" />
      <header className="explore-events-heading">
        <h2 id="events-title">
          Explore By <span className="text-primary">Event</span><span className="text-secondary">s</span>
        </h2>
        <ThemeImage src={headingUnderline} alt="" aria-hidden="true" />
      </header>
      <ThemeImage src={arrowPointingUp} alt="" aria-hidden="true" className="explore-events-up-arrow" />
      <div
        ref={journeyRef}
        className="events-journey"
        data-pinned={pinned}
        data-ready={!pinned || travel > 0}
        style={pinned && stageHeight ? { height: stageHeight + travel } : undefined}
      >
        <div ref={stageRef} className="events-stage">
          <div className="events-gallery">
            <div
              ref={viewportRef}
              id="events-viewport"
              className="events-viewport"
              role="region"
              aria-roledescription="carousel"
              aria-label="Event collections"
              aria-describedby="events-a11y-hint"
              tabIndex={events.length > 1 ? 0 : undefined}
              onKeyDown={handleKeyDown}
              onScroll={() => {
                if (pinned) return;
                const viewport = viewportRef.current;
                const distance = viewport.scrollWidth - viewport.clientWidth;
                progress.set(distance > 0 ? clamp(viewport.scrollLeft / distance) : 0);
              }}
            >
              <motion.div ref={trackRef} className="events-track" style={{ transform: trackTransform }}>
                {pinned ? (
                  [0, 1, 2].map((copyIndex) => (
                    <HangingCardSet
                      key={copyIndex}
                      events={events}
                      duplicate={copyIndex !== 1}
                      setRef={copyIndex === 1 ? setRef : undefined}
                    />
                  ))
                ) : (
                  <HangingCardSet events={events} duplicate={false} setRef={setRef} />
                )}
              </motion.div>
              {!events.length && <p className="events-empty"><ImageIcon aria-hidden="true" /> More inspiration is on its way.</p>}
            </div>
          </div>
          <p id="events-a11y-hint" className="events-a11y-hint">
            {pinned
              ? "Scroll down or use the left and right arrow keys to explore one complete circuit of event cards."
              : "Swipe horizontally or use the left and right arrow keys to explore event cards."}
          </p>
        </div>
      </div>

      <div className="explore-events-layers" aria-hidden="true">
        <ThemeImage src={lightPurpleLayer} className="explore-events-rear-layer" alt="" />
        <ThemeImage src={foregroundPurple} className="explore-events-foreground-layer" alt="" />
        <ThemeImage src={leftGlow} className="explore-events-glow-left" alt="" />
        <ThemeImage src={centerGlow} className="explore-events-glow-center" alt="" />
        <ThemeImage src={rightGlow} className="explore-events-glow-right" alt="" />
      </div>
      <div id="events-create" className="explore-events-cta">
        <h3>Ready to Create <span>Something Amazing?</span></h3>
        <p>Bring your next event to life with Visora.</p>
        <NavLink to="/editor">Start Designing <span aria-hidden="true">→</span></NavLink>
      </div>
      <ThemeImage src={lineTop} alt="" aria-hidden="true" className="explore-events-line-top" />
      <ThemeImage src={paperPlane} alt="" aria-hidden="true" className="explore-events-paper-plane" />
      <ThemeImage src={lineBottom} alt="" aria-hidden="true" className="explore-events-line-bottom" />
      <ThemeImage src={lineRight} alt="" aria-hidden="true" className="explore-events-line-right" />
    </section>
  );
}
