import { motion, useReducedMotion } from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeInUp, viewportOnce } from "../../lib/animations/animations";
import doodlePlane from "../../assets/Website/AboutUs/DoodlePlane.svg";
import leftBlobs from "../../assets/Website/AboutUs/LeftDoubleBlob(Purple,yellow.svg";
import rightBlobs from "../../assets/Website/AboutUs/RightDoubleBlob(Purple,Yellow).svg";

export default function WhatIsVisora() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="about-what"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
      variants={fadeInUp}
      aria-labelledby="what-is-visora-title"
    >
      <ThemeImage className="about-what-plane" src={doodlePlane} alt="" aria-hidden="true" />
      <ThemeImage className="about-side-blob about-side-blob-left" src={leftBlobs} alt="" aria-hidden="true" />
      <ThemeImage className="about-side-blob about-side-blob-right" src={rightBlobs} alt="" aria-hidden="true" />

      <div className="about-what-copy">
        <h2 id="what-is-visora-title">What is <span>Visora?</span></h2>
        <p>
          Visora is a creative platform that combines the simplicity of Canva with
          the power of PowerPoint. Create stunning backdrops, custom slides, and
          engaging presentations in just a few clicks.
        </p>
      </div>
    </motion.section>
  );
}
