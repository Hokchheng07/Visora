import { motion, useReducedMotion } from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeInUp, viewportOnce } from "../../lib/animations/animations";
import heroPlane from "../../assets/pages/about/hero/UpsideDownHeroPlane.svg";
import blackExclamation from "../../assets/pages/about/hero/BlackExclimationMark.svg";
import yellowSwoosh from "../../assets/pages/about/story/DashYellowUnderStory.svg";
import dashedLeftLine from "../../assets/pages/about/shared/connectors/DashedLeftLine.svg";
import solidLeftLine from "../../assets/pages/about/shared/connectors/LeftSolidLine.svg";
import solidRightLine from "../../assets/pages/about/hero/RightSolid.svg";
import dashedRightLine from "../../assets/pages/about/hero/RightDashedLine.svg";
import snailOne from "../../assets/pages/about/shared/doodles/Snail1.svg";
import snailTwo from "../../assets/pages/about/shared/doodles/Snail2.svg";
import yellowFrame from "../../assets/pages/about/hero/YellowFrameHero.svg";
import purpleFrame from "../../assets/pages/about/hero/PurpleFrame.svg";
import angkorArtwork from "../../assets/pages/about/hero/AngkorRactangle.svg";

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
        <span className="about-hero-mobile-kicker">Create · Present · Inspire</span>
        <h1 id="about-hero-title">About <span>Visora</span></h1>
        <p>
          Visora is a creative backdrop design platform that feels like Canva
          for designing and PowerPoint for presenting. We help users create
          beautiful event backdrops and presentations with ease.
        </p>
      </motion.div>

      <div className="about-hero-mobile-art" aria-hidden="true">
        <ThemeImage className="about-hero-mobile-angkor" src={angkorArtwork} alt="" />
      </div>

      <div className="about-hero-mobile-accents" aria-hidden="true">
        <span className="about-hero-spark about-hero-spark-one" />
        <span className="about-hero-spark about-hero-spark-two" />
        <span className="about-hero-spark about-hero-spark-three" />
        <span className="about-hero-accent-ring" />
        <svg className="about-hero-accent-trail" viewBox="0 0 150 80" fill="none" focusable="false">
          <path d="M8 58C32 78 88 66 83 36C80 15 52 19 57 39C63 61 110 49 138 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 6" />
          <path d="m125 15 14-5-2 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

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
