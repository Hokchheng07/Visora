import { ThemeImage } from '../../../theme/ThemeImage';
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ImageIcon } from "lucide-react";
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

// Pass API records as events when available. Measure again when data or the
// viewport changes so the scroll runway always matches the actual card row.
export default function ExploreByEvents({ events = placeholderEvents }) {
  const journeyRef = useRef(null);
  const stageRef = useRef(null);
  const [stageHeight, setStageHeight] = useState(0);
  const [pinTop, setPinTop] = useState(0);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [desktop, setDesktop] = useState(false);
  const [travel, setTravel] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const pinned = desktop && !reduceMotion && events.length > 1;
  const progress = useMotionValue(0);
  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: [`start ${pinTop}px`, `end ${pinTop + stageHeight}px`],
  });
  const trackTransform = useTransform(progress, (value) =>
    pinned ? `translate3d(${-value * travel}px, 0, 0)` : "none",
  );
  const progressTransform = useTransform(progress, (value) => `scaleX(${value})`);

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
    const measure = () => {
      const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      setTravel(distance);
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
    setActiveIndex(Math.round(value * Math.max(0, events.length - 1)));
  });

  const goToCard = (index, instant = false) => {
    const target = Math.max(0, Math.min(events.length - 1, index));
    const ratio = events.length > 1 ? target / (events.length - 1) : 0;
    const behavior = reduceMotion || instant ? "instant" : "smooth";
    if (pinned) {
      const top = journeyRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - pinTop + ratio * travel, behavior });
    } else {
      viewportRef.current.scrollTo({ left: ratio * travel, behavior });
    }
  };

  const handleKeyDown = (event) => {
    const targets = { ArrowLeft: activeIndex - 1, ArrowRight: activeIndex + 1, Home: 0, End: events.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    goToCard(targets[event.key], true);
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
              aria-describedby="events-scroll-hint"
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
                {events.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} count={events.length} progress={progress} pinned={pinned} />
                ))}
              </motion.div>
              {!events.length && <p className="events-empty"><ImageIcon aria-hidden="true" /> More inspiration is on its way.</p>}
            </div>
          </div>

          <div className="events-navigation">
            <p id="events-scroll-hint" className="events-scroll-hint">
              {pinned ? <ArrowDown size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
              {pinned ? "Scroll to explore" : "Swipe or use the arrows"}
            </p>
            <div className="events-pagination" aria-label="Collection progress">
              <span className="events-current">{String(events.length ? activeIndex + 1 : 0).padStart(2, "0")}</span>
              <div className="events-progress" aria-hidden="true"><motion.div style={{ transform: progressTransform }} /></div>
              <span>{String(events.length).padStart(2, "0")}</span>
            </div>
            <div className="events-controls">
              <button type="button" aria-label="Previous event" aria-controls="events-viewport" disabled={activeIndex === 0 || !events.length} onClick={(event) => goToCard(activeIndex - 1, event.detail === 0)}><ArrowLeft size={20} aria-hidden="true" /></button>
              <button type="button" aria-label="Next event" aria-controls="events-viewport" disabled={activeIndex >= events.length - 1} onClick={(event) => goToCard(activeIndex + 1, event.detail === 0)}><ArrowRight size={20} aria-hidden="true" /></button>
            </div>
          </div>
          {pinned && <a className="events-skip" href="#events-create">Skip to start designing <ArrowRight size={13} aria-hidden="true" /></a>}
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
