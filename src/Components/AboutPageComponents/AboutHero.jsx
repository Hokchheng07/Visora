import { motion, useReducedMotion } from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeIn, fadeInUp, viewportOnce } from "../../lib/animations/animations";
import heroClouds from "../../assets/Website/AboutUs/BigSpiralClouds.svg";
import angkorArtwork from "../../assets/Website/AboutUs/AngkorRactangle.svg";
import doodlePlane from "../../assets/Website/AboutUs/DoodlePlane.svg";
import spiralArrow from "../../assets/Website/AboutUs/SpiralArrow.svg";

export default function AboutHero() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="about-hero"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
      variants={fadeIn}
    >
      <ThemeImage className="about-hero-clouds" src={heroClouds} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-plane" src={doodlePlane} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-arrow" src={spiralArrow} alt="" aria-hidden="true" />

      <div className="about-hero-inner">
        <motion.div className="about-hero-copy" variants={fadeInUp}>
          <p className="about-eyebrow">Creativity made for every celebration</p>
          <h1>About <span>Visora</span></h1>
          <p>
            Visora is a creative backdrop design platform that feels like Canva
            for designing and PowerPoint for presenting. We help users create
            beautiful event backdrops and presentations with ease.
          </p>
        </motion.div>

        <motion.div className="about-hero-art" variants={fadeInUp}>
          <ThemeImage
            src={angkorArtwork}
            alt="A softly illustrated view of Angkor Wat and Cambodian palm trees"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
