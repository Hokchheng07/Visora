import { motion, useReducedMotion } from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeInUp, viewportOnce } from "../../lib/animations/animations";
import heroPlane from "../../assets/Website/AboutUs/UpsideDownHeroPlane.svg";
import blackExclamation from "../../assets/Website/AboutUs/BlackExclimationMark.svg";
import yellowSwoosh from "../../assets/Website/AboutUs/DashYellowUnderStory.svg";
import dashedLeftLine from "../../assets/Website/AboutUs/DashedLeftLine.svg";
import solidLeftLine from "../../assets/Website/AboutUs/LeftSolidLine.svg";
import solidRightLine from "../../assets/Website/AboutUs/RightSolid.svg";
import dashedRightLine from "../../assets/Website/AboutUs/RightDashedLine.svg";
import snailOne from "../../assets/Website/AboutUs/Snail1.svg";
import snailTwo from "../../assets/Website/AboutUs/Snail2.svg";
import yellowFrame from "../../assets/Website/AboutUs/YellowFrameHero.svg";
import purpleFrame from "../../assets/Website/AboutUs/PurpleFrame.svg";

export default function AboutHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-hero" aria-labelledby="about-hero-title">
      <ThemeImage className="about-hero-plane" src={heroPlane} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-exclamation" src={blackExclamation} alt="" aria-hidden="true" />

      <motion.div
        className="about-hero-copy"
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeInUp}
      >
        <h1 id="about-hero-title">About <span>Visora</span></h1>
        <p>
          Visora is a creative backdrop design platform that feels like Canva
          for designing and PowerPoint for presenting. We help users create
          beautiful event backdrops and presentations with ease.
        </p>
      </motion.div>

      <ThemeImage className="about-hero-yellow-swoosh" src={yellowSwoosh} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-left-line about-hero-left-line-dashed" src={dashedLeftLine} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-snail about-hero-snail-left" src={snailOne} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-snail about-hero-snail-right" src={snailOne} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-snail about-hero-snail-yellow" src={snailTwo} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-left-line about-hero-left-line-solid" src={solidLeftLine} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-right-line about-hero-right-line-dashed" src={dashedRightLine} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-right-line about-hero-right-line-solid" src={solidRightLine} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-frame about-hero-frame-yellow" src={yellowFrame} alt="" aria-hidden="true" />
      <ThemeImage className="about-hero-frame about-hero-frame-purple" src={purpleFrame} alt="" aria-hidden="true" />
    </section>
  );
}
