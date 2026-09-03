import { NavLink } from "react-router";
import { motion } from "motion/react";
import apsara from "../../assets/Website/LandingPage/KhmerDesignShowCase/apsara.png";
import angkorWat from "../../assets/Website/LandingPage/KhmerDesignShowCase/ankorwat.png";
import topLeft from "../../assets/Website/LandingPage/KhmerDesignShowCase/TopLeftCorner.svg";
import topRight from "../../assets/Website/LandingPage/KhmerDesignShowCase/TopRightCorner.svg";
import bottomLeft from "../../assets/Website/LandingPage/KhmerDesignShowCase/BottomLeftCorner.svg";
import bottomRight from "../../assets/Website/LandingPage/KhmerDesignShowCase/RightLeftCorner.svg";
import ornament from "../../assets/Website/LandingPage/KhmerDesignShowCase/MiddleSection.svg";
import TemplateCard from "../Templates/TemplateCard";
import { templateCards } from "../Templates/templateData";
import {
  EASE,
  fadeInUp,
  scaleIn,
  staggerContainer,
  viewportOnce,
} from "../../lib/animations/animations";

const fadedArtworkReveal = {
  hidden: { opacity: 0, scale: 0.94, y: 30 },
  show: {
    opacity: 0.4,
    scale: 1,
    y: 0,
    transition: { duration: 0.95, ease: EASE },
  },
};

const cornerReveal = {
  hidden: ({ x, y }) => ({ opacity: 0, x, y, scale: 0.9 }),
  show: ({ delay = 0 }) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, delay, ease: EASE },
  }),
};

export default function KhmerDesignShowcase() {
  return (
    <motion.section
      className="khmer-showcase bg-sparkle"
      initial="hidden"
      whileInView="show"
      viewport={{ ...viewportOnce, amount: 0.12 }}
    >
      <div className="khmer-showcase-art" aria-hidden="true">
        <motion.img
          src={apsara}
          className="khmer-showcase-apsara"
          alt=""
          variants={fadedArtworkReveal}
        />
        <motion.img
          src={angkorWat}
          className="khmer-showcase-angkor"
          alt=""
          variants={fadedArtworkReveal}
        />
        <motion.img
          src={topLeft}
          className="khmer-showcase-corner khmer-showcase-corner-tl"
          alt=""
          custom={{ x: -90, y: -70, delay: 0.05 }}
          variants={cornerReveal}
        />
        <motion.img
          src={topRight}
          className="khmer-showcase-corner khmer-showcase-corner-tr"
          alt=""
          custom={{ x: 90, y: -70, delay: 0.1 }}
          variants={cornerReveal}
        />
        <motion.img
          src={bottomLeft}
          className="khmer-showcase-corner khmer-showcase-corner-bl"
          alt=""
          custom={{ x: -90, y: 70, delay: 0.15 }}
          variants={cornerReveal}
        />
        <motion.img
          src={bottomRight}
          className="khmer-showcase-corner khmer-showcase-corner-br"
          alt=""
          custom={{ x: 90, y: 70, delay: 0.2 }}
          variants={cornerReveal}
        />
      </div>
      <div className="khmer-showcase-content">
        <motion.h2 variants={fadeInUp}>
          Khmer Design <span>Showcase</span>
        </motion.h2>
        <motion.div
          className="khmer-showcase-ornament-wrap"
          aria-hidden="true"
          variants={scaleIn}
        >
          <img src={ornament} className="khmer-showcase-ornament" alt="" />
        </motion.div>
        <div className="khmer-showcase-body">
          <motion.div
            className="khmer-showcase-cards"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={staggerContainer(0.16, 0.05)}
          >
            {templateCards.map((template, index) => (
              <TemplateCard
                key={`${template.title}-${index}`}
                template={template}
                index={index}
                animateContent
              />
            ))}
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={fadeInUp}
          >
            <NavLink to="/templates" className="khmer-showcase-button">
              More Templates <span>→</span>
            </NavLink>
          </motion.div>
          <motion.p
            className="khmer-showcase-tagline"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={fadeInUp}
          >
            Celebrate every event with designs inspired by Cambodian culture.
          </motion.p>
        </div>
      </div>
    </motion.section>
  );
}
