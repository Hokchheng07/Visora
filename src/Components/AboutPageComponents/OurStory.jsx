import { motion, useReducedMotion } from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeInUp, viewportOnce } from "../../lib/animations/animations";
import snailOne from "../../assets/pages/about/shared/doodles/Snail1.svg";
import snailTwo from "../../assets/pages/about/shared/doodles/Snail2.svg";
import dashedConnector from "../../assets/pages/about/shared/connectors/DashedLeftLine.svg";
import solidConnector from "../../assets/pages/about/shared/connectors/LeftSolidLine.svg";

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

      {/* The yellow underline moved to AboutDecor: as a flow sibling it landed
          below the paragraph instead of under "Story", and it is placed in
          canvas coordinates like the rest of the scatter artwork. */}
      <div className="about-story-copy">
        <h2 id="about-story-title">Our <span>Story</span></h2>
        <p>
          Born from a passion for events and the power of design, Visora helps
          creators, students, and organizations bring their moments to life.
        </p>
        <p>
          We believe every celebration deserves a backdrop that <span>tells a story.</span>
        </p>
      </div>
    </motion.section>
  );
}
