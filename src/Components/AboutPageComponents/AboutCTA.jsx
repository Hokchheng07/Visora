import { motion, useReducedMotion } from "motion/react";
import { NavLink } from "react-router";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeInUp, viewportOnce } from "../../lib/animations/animations";
import purpleWave from "../../assets/Website/AboutUs/PurpleWave(Bottom).svg";
import doodlePlane from "../../assets/Website/AboutUs/DoodlePlane(AboutUs).svg";

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
      <ThemeImage className="about-cta-plane" src={doodlePlane} alt="" aria-hidden="true" />
      <div className="about-cta-copy">
        <p className="about-eyebrow">Your idea is next</p>
        <h2 id="about-cta-title">Ready to Create <span>Something Amazing?</span></h2>
        <p>Bring your next event to life with Visora.</p>
        <NavLink to="/editor">Start Creating</NavLink>
      </div>
    </motion.section>
  );
}
