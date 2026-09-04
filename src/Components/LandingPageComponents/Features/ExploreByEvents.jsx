import { NavLink } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import {
  EASE,
  fadeIn,
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

const EVENT_NAMES = [
  "Graduation",
  "Celebration",
  "Khmer Events",
  "School Event",
  "Wedding",
  "Birthday",
];

const ORBIT_LABELS = (() => {
  const labels = [...EVENT_NAMES, ...EVENT_NAMES, ...EVENT_NAMES];
  const totalUnits = labels.reduce((total, label) => total + label.length + 2, 0);
  let elapsedUnits = 0;

  return labels.map((label) => {
    const startOffset = `${(elapsedUnits / totalUnits) * 100}%`;
    elapsedUnits += label.length + 2;
    return { label, startOffset };
  });
})();

// A true circle derived from the existing arch's apex and two blob crossings.
// Its lower half remains behind the supplied purple artwork for a seamless loop.
const circlePath = (radius) =>
  `M${674 - radius} 788.8 A${radius} ${radius} 0 0 1 ${674 + radius} 788.8 A${radius} ${radius} 0 0 1 ${674 - radius} 788.8`;

const EVENT_CIRCLE_PATH = circlePath(788.8);
const EVENT_TEXT_CIRCLE_PATH = circlePath(852.8);

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

function EventOrbit({ reduceMotion }) {
  return (
    <motion.div
      className={`explore-events-orbit ${
        reduceMotion ? "explore-events-orbit-static" : ""
      }`}
      aria-hidden="true"
      variants={fadeIn}
    >
      <svg
        viewBox="0 -100 1348 1777.6"
        className="explore-events-orbit-svg"
      >
        <defs>
          <path
            id="explore-events-text-path"
            d={EVENT_TEXT_CIRCLE_PATH}
          />
        </defs>

        <path
          d={EVENT_CIRCLE_PATH}
          className="explore-events-orbit-solid"
        />

        <path
          d={EVENT_CIRCLE_PATH}
          transform="translate(0 -14)"
          className="explore-events-orbit-dashed"
        />

        <g className="explore-events-orbit-track">
          {ORBIT_LABELS.map(({ label, startOffset }, index) => (
            <text
              className="explore-events-orbit-label"
              key={`${label}-${index}`}
            >
              <textPath
                href="#explore-events-text-path"
                startOffset={startOffset}
              >
                {label} |
              </textPath>
            </text>
          ))}
        </g>
      </svg>
    </motion.div>
  );
}

export default function ExploreByEvents() {
  const reduceMotion = useReducedMotion();

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

      <EventOrbit reduceMotion={reduceMotion} />

      <motion.img
        src={arrowPointingUp}
        alt=""
        aria-hidden="true"
        className="explore-events-up-arrow"
        variants={fadeInUp}
      />

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
