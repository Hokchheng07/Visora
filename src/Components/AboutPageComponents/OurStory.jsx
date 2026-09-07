import { motion, useReducedMotion } from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeInUp, viewportOnce } from "../../lib/animations/animations";
import storyUnderline from "../../assets/Website/AboutUs/DashYellowUnderStory.svg";
import snailOne from "../../assets/Website/AboutUs/Snail1.svg";
import snailTwo from "../../assets/Website/AboutUs/Snail2.svg";
import dashedConnector from "../../assets/Website/AboutUs/DashedLeftLine.svg";
import solidConnector from "../../assets/Website/AboutUs/LeftSolidLine.svg";

export default function OurStory() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="about-story"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
      variants={fadeInUp}
      aria-labelledby="about-story-title"
    >
      <ThemeImage className="about-story-line about-story-line-solid" src={solidConnector} alt="" aria-hidden="true" />
      <ThemeImage className="about-story-line about-story-line-dashed" src={dashedConnector} alt="" aria-hidden="true" />
      <ThemeImage className="about-story-snail about-story-snail-one" src={snailOne} alt="" aria-hidden="true" />
      <ThemeImage className="about-story-snail about-story-snail-two" src={snailTwo} alt="" aria-hidden="true" />

      <div className="about-story-copy">
        <h2 id="about-story-title">Our <span>Story</span></h2>
        <ThemeImage className="about-heading-underline" src={storyUnderline} alt="" aria-hidden="true" />
        <p>
          Born from a passion for events and the power of design, Visora helps
          creators, students, and organizations bring their moments to life.
        </p>
        <p>
          We believe every celebration deserves a backdrop that tells a story.
        </p>
      </div>
    </motion.section>
  );
}
