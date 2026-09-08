import { motion, useReducedMotion } from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeInUp, staggerContainer, viewportOnce } from "../../lib/animations/animations";
import { coreValues } from "./aboutData";

export default function CoreValues() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-values" aria-labelledby="about-values-title">
      <motion.header
        className="about-section-heading"
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeInUp}
      >
        {/* Figma splits this three ways: black, primary purple, secondary yellow. */}
        <h2 id="about-values-title">
          Our <span className="about-values-core">Core</span>{" "}
          <span className="about-values-values">Values</span>
        </h2>
      </motion.header>

      <motion.div
        className="about-values-grid"
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.12)}
      >
        {coreValues.map((value) => (
          <motion.article className="about-value-card" key={value.title} variants={fadeInUp}>
            <ThemeImage src={value.artwork} alt="" aria-hidden="true" />
            <h3 className="sr-only">{value.title}</h3>
            <p className="sr-only">{value.description}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
