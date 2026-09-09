import { motion, useReducedMotion } from "motion/react";
import { NavLink } from "react-router";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeInUp, viewportOnce } from "../../lib/animations/animations";
import purpleWave from "../../assets/pages/about/cta/PurpleWave(Bottom).svg";
import plane from "../../assets/pages/about/misc/bottom-blob/image 110.svg";
import spiral from "../../assets/pages/about/misc/bottom-blob/image 111.svg";
import rays from "../../assets/pages/about/misc/bottom-blob/image 106.svg";
import rightLine from "../../assets/pages/about/misc/bottom-blob/Line 33.svg";
import lowerLine from "../../assets/pages/about/misc/bottom-blob/Line 34.svg";
import leftLine from "../../assets/pages/about/misc/bottom-blob/Line 35.svg";

export default function AboutCTA() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="about-cta"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
      variants={fadeInUp}
      aria-labelledby="about-cta-title"
    >
      <ThemeImage className="about-cta-wave" src={purpleWave} alt="" aria-hidden="true" />
      <div className="about-cta-doodles" aria-hidden="true">
        <ThemeImage className="about-cta-doodle about-cta-doodle-plane" src={plane} alt="" />
        <ThemeImage className="about-cta-doodle about-cta-doodle-spiral" src={spiral} alt="" />
        <ThemeImage className="about-cta-doodle about-cta-doodle-rays" src={rays} alt="" />
        <ThemeImage className="about-cta-doodle about-cta-doodle-right" src={rightLine} alt="" />
        <ThemeImage className="about-cta-doodle about-cta-doodle-lower" src={lowerLine} alt="" />
        <ThemeImage className="about-cta-doodle about-cta-doodle-left" src={leftLine} alt="" />
      </div>
      <div className="about-cta-copy">
        <h2 id="about-cta-title">Ready to Create <span>Something Amazing?</span></h2>
        <p>Bring your next event to life with Visora.</p>
        <NavLink to="/editor">Start Creating</NavLink>
      </div>
    </motion.section>
  );
}
