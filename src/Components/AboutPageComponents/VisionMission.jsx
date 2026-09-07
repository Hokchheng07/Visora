import { motion, useReducedMotion } from "motion/react";
import { Eye, Target } from "lucide-react";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeInUp, staggerContainer, viewportOnce } from "../../lib/animations/animations";
import cardFrame from "../../assets/Website/AboutUs/OurVisionFrame+OurMission.svg";
import accentMark from "../../assets/Website/AboutUs/YellowExclimationMark.svg";
import spiralArrow from "../../assets/Website/AboutUs/SpiralArrow.svg";

const statements = [
  {
    title: "Our Mission",
    description: "Make expressive event design accessible through simple tools, culturally meaningful resources, and a presentation experience anyone can use.",
    Icon: Target,
  },
  {
    title: "Our Vision",
    description: "A future where every Cambodian creator can turn an idea into a beautiful shared experience—wherever their audience gathers.",
    Icon: Eye,
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
        {statements.map(({ title, description, Icon }) => (
          <motion.article className="about-vision-card" variants={fadeInUp} key={title}>
            <ThemeImage className="about-vision-frame" src={cardFrame} alt="" aria-hidden="true" />
            <div className="about-vision-copy">
              <Icon aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
