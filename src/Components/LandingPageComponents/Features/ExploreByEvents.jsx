import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { motion } from "motion/react";
import TemplateCard from "../Templates/TemplateCard";
import {
  EASE,
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from "../../../lib/animations/animations";
import topBackground from "../../../assets/Website/LandingPage/ExploreByEvents/TopBg(ExploreByEvents).svg";
import headingUnderline from "../../../assets/Website/LandingPage/ExploreByEvents/UnderLineForExploreByEvents.svg";
import topLeftDoodle from "../../../assets/Website/LandingPage/ExploreByEvents/TopLeft.svg";
import lightPurpleLayer from "../../../assets/Website/LandingPage/ExploreByEvents/LightPurpleBackground.svg";
import foregroundPurple from "../../../assets/Website/LandingPage/ExploreByEvents/ForegroundPurple.svg";
import leftGlow from "../../../assets/Website/LandingPage/ExploreByEvents/LeftLayerBlur(ExploreByEvents).svg";
import centerGlow from "../../../assets/Website/LandingPage/ExploreByEvents/CenterLayerBlur(ExploreByEvents).svg";
import rightGlow from "../../../assets/Website/LandingPage/ExploreByEvents/RightLayerBlur.svg";
import arrowPointingUp from "../../../assets/Website/LandingPage/ExploreByEvents/ArrowPointingUp(ExploreByEvents).svg";
import paperPlane from "../../../assets/Website/LandingPage/ExploreByEvents/PaperPlane(ExploreByEvents).svg";
import lineTop from "../../../assets/Website/LandingPage/ExploreByEvents/LineTop(ExploreByEvents).svg";
import lineRight from "../../../assets/Website/LandingPage/ExploreByEvents/LineRight(ExploreByEvents).svg";
import lineBottom from "../../../assets/Website/LandingPage/ExploreByEvents/LineBottom(ExploreByEvents).svg";

// Shaped for TemplateCard (the same card Popular Templates renders).
const EVENT_CARDS = [
  { image: null, title: "Graduation", description: "Caps, gowns, and proud moments" },
  { image: null, title: "Celebration", description: "Mark any milestone in style" },
  { image: null, title: "Khmer Events", description: "Traditional motifs, modern layouts" },
  { image: null, title: "School Event", description: "From classroom to main stage" },
  { image: null, title: "Wedding", description: "Backdrops for the big day" },
  { image: null, title: "Birthday", description: "Party scenes for every age" },
];

const sideReveal = {
  hidden: (direction) => ({
    opacity: 0,
    transform: `translateX(${direction * 12}%) scale(0.95)`,
  }),
  show: {
    opacity: 1,
    transform: "translateX(0%) scale(1)",
    transition: { duration: 0.7, ease: EASE },
  },
};

// The carousel scrolls itself — page scroll never drives it. Native
// overflow-x keeps trackpad/touch/keyboard behaviour intact; the arrows just
// page it by one card for mouse users.
function EventCardCarousel() {
  const railRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncEdges = () => {
    const rail = railRef.current;
    if (!rail) return;
    setAtStart(rail.scrollLeft <= 1);
    setAtEnd(rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1);
  };

  useEffect(syncEdges, []);

  const scrollByCard = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("[data-event-card]");
    const step = card ? card.offsetWidth + 32 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <motion.div className="explore-events-carousel" variants={fadeInUp}>
      <div
        ref={railRef}
        className="explore-events-rail"
        onScroll={syncEdges}
        tabIndex={0}
        role="group"
        aria-label="Event categories"
      >
        {EVENT_CARDS.map((event, index) => (
          <div className="explore-events-rail-item" data-event-card key={event.name}>
            <TemplateCard template={event} index={index} />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="explore-events-rail-button explore-events-rail-prev"
        onClick={() => scrollByCard(-1)}
        disabled={atStart}
        aria-label="Previous events"
      >
        ←
      </button>
      <button
        type="button"
        className="explore-events-rail-button explore-events-rail-next"
        onClick={() => scrollByCard(1)}
        disabled={atEnd}
        aria-label="Next events"
      >
        →
      </button>
    </motion.div>
  );
}

export default function ExploreByEvents() {
  return (
    <motion.section
      className="explore-events-section bg-sparkle"
      initial="hidden"
      whileInView="show"
      viewport={{ ...viewportOnce, amount: 0.12 }}
      variants={staggerContainer(0.08, 0.04)}
    >
      <img
        src={topBackground}
        alt=""
        aria-hidden="true"
        className="explore-events-top-background"
      />

      <motion.img
        src={topLeftDoodle}
        alt=""
        aria-hidden="true"
        className="explore-events-top-left"
        custom={-1}
        variants={sideReveal}
      />

      <header className="explore-events-heading">
        <motion.div variants={fadeInUp}>
          <h2>
            Explore By <span className="text-primary">Event</span>
            <span className="text-secondary">s</span>
          </h2>
          <img src={headingUnderline} alt="" aria-hidden="true" />
        </motion.div>
      </header>

      <motion.img
        src={arrowPointingUp}
        alt=""
        aria-hidden="true"
        className="explore-events-up-arrow"
        variants={fadeInUp}
      />

      <EventCardCarousel />

      <div className="explore-events-layers" aria-hidden="true">
        <img
          src={lightPurpleLayer}
          className="explore-events-rear-layer"
          alt=""
        />
        <img
          src={foregroundPurple}
          className="explore-events-foreground-layer"
          alt=""
        />
        <img src={leftGlow} className="explore-events-glow-left" alt="" />
        <img src={centerGlow} className="explore-events-glow-center" alt="" />
        <img src={rightGlow} className="explore-events-glow-right" alt="" />
      </div>

      <motion.div className="explore-events-cta" variants={fadeInUp}>
        <h3>
          Ready to Create <span>Something Amazing?</span>
        </h3>
        <p>Bring your next event to life with Visora.</p>
        <NavLink to="/design">
          Start Designing <span aria-hidden="true">→</span>
        </NavLink>
      </motion.div>

      <motion.img
        src={lineTop}
        alt=""
        aria-hidden="true"
        className="explore-events-line-top"
        custom={-1}
        variants={sideReveal}
      />
      <motion.img
        src={paperPlane}
        alt=""
        aria-hidden="true"
        className="explore-events-paper-plane"
        custom={-1}
        variants={sideReveal}
      />
      <motion.img
        src={lineBottom}
        alt=""
        aria-hidden="true"
        className="explore-events-line-bottom"
        custom={-1}
        variants={sideReveal}
      />
      <motion.img
        src={lineRight}
        alt=""
        aria-hidden="true"
        className="explore-events-line-right"
        custom={1}
        variants={sideReveal}
      />
    </motion.section>
  );
}
