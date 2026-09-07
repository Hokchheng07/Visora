import { motion, useReducedMotion } from "motion/react";
import { fadeInUp, staggerContainer, viewportOnce } from "../../lib/animations/animations";
import { mentors } from "./aboutData";
import PersonCard from "./PersonCard";

export default function OurMentors() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-people about-mentors" aria-labelledby="about-mentors-title">
      <motion.header className="about-section-heading" initial={reduceMotion ? false : "hidden"} whileInView="show" viewport={viewportOnce} variants={fadeInUp}>
        <h2 id="about-mentors-title">Our <span>Mentors</span></h2>
        <p className="about-section-subtitle">Guided by industry leaders who inspire excellence and innovation.</p>
      </motion.header>
      <motion.div className="about-mentor-grid" initial={reduceMotion ? false : "hidden"} whileInView="show" viewport={viewportOnce} variants={staggerContainer(0.14)}>
        {mentors.map((mentor, index) => (
          <motion.div key={mentor.name} variants={fadeInUp}>
            <PersonCard person={mentor} index={index} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
