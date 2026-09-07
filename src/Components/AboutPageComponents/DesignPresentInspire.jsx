import { motion, useReducedMotion } from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import { fadeInUp, viewportOnce } from "../../lib/animations/animations";
import { featureCards } from "./aboutData";

function FeatureCard({ feature, index, reduceMotion }) {
  return (
    <div
      className={`about-feature-hanger about-feature-hanger-${feature.tone}`}
      style={{ "--about-feature-offset": `${feature.offset}px` }}
    >
      <ThemeImage className="about-feature-pin" src={feature.pin} alt="" aria-hidden="true" />
      <motion.div
        className="about-feature-swing"
        style={{ transformOrigin: "50% 24px" }}
        initial={reduceMotion ? false : { rotate: index % 2 ? 7 : -8 }}
        whileInView={{ rotate: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ type: "spring", stiffness: 120, damping: 8, mass: 0.8, delay: index * 0.08 }}
      >
        <motion.article
          className="about-feature-card"
          whileHover={reduceMotion ? undefined : { scale: 1.015 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        >
          <ThemeImage className="about-feature-frame" src={feature.artwork} alt="" aria-hidden="true" />
          <div className="about-feature-copy">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        </motion.article>
      </motion.div>
    </div>
  );
}

export default function DesignPresentInspire() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-design" aria-labelledby="about-design-title">
      <motion.header
        className="about-design-heading"
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeInUp}
      >
        <p className="about-eyebrow">One seamless workflow</p>
        <h2 id="about-design-title">
          <span>Design.</span> Present. <em>Inspire.</em>
        </h2>
        <p>Everything you need to bring an event idea from canvas to screen.</p>
      </motion.header>

      <div className="about-feature-stage">
        <svg className="about-feature-clothesline" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M24 35 C140 88 245 16 348 78 C470 148 576 18 690 54 C820 96 934 34 1176 104"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="9 9"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="about-feature-grid">
          {featureCards.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
