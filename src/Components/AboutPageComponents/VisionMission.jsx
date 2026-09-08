import { motion, useReducedMotion } from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeInUp, staggerContainer, viewportOnce } from "../../lib/animations/animations";
import cardFrame from "../../assets/Website/AboutUs/OurVisionFrame+OurMission.svg";
import accentMark from "../../assets/Website/AboutUs/YellowExclimationMark.svg";
import spiralArrow from "../../assets/Website/AboutUs/SpiralArrow(AboutUs).svg";

/* Figma splits each heading into a black word plus a coloured one, and the
   design has no icons inside these frames. */
const statements = [
  {
    lead: "Our",
    accent: "Mission",
    tone: "mission",
    description: "Empower every user to create stunning event backdrops and presentations with creative tools anyone can use, anywhere.",
  },
  {
    lead: "Our",
    accent: "Vision",
    tone: "vision",
    description: "To become the leading digital backdrop platform in Cambodia and beyond, inspiring every event, creator, and story to shine.",
  },
];

export default function VisionMission() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-vision" aria-labelledby="about-vision-title">
      <ThemeImage className="about-vision-mark" src={accentMark} alt="" aria-hidden="true" />
      <ThemeImage className="about-vision-arrow" src={spiralArrow} alt="" aria-hidden="true" />
      <motion.header
        className="about-section-heading"
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeInUp}
      >
        <p className="about-eyebrow">Where we are going</p>
        <h2 id="about-vision-title">Vision &amp; <span>Mission</span></h2>
      </motion.header>

      <motion.div
        className="about-vision-grid"
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.14)}
      >
        {statements.map(({ lead, accent, tone, description }) => (
          <motion.article className={`about-vision-card about-vision-card-${tone}`} variants={fadeInUp} key={accent}>
            <ThemeImage className="about-vision-frame" src={cardFrame} alt="" aria-hidden="true" />
            <div className="about-vision-copy">
              <h3>{lead} <span>{accent}</span></h3>
              <p>{description}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
