import { motion, useReducedMotion } from "motion/react";
import { fadeInUp, viewportOnce } from "../../lib/animations/animations";
import { cardReveal } from "./cardReveal.js";
import { ThemeImage } from "../../theme/ThemeImage";
import { mentors } from "./aboutData";
import headingUnderline from "../../assets/pages/about/what-is-visora/UnderlineForWhatIsVisora.svg";
import PersonCard from "./PersonCard";

export default function OurMentors() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-people about-mentors" aria-labelledby="about-mentors-title">
      <motion.header className="about-section-heading" initial={reduceMotion ? false : "hidden"} whileInView="show" viewport={viewportOnce} variants={fadeInUp}>
        <h2 id="about-mentors-title">Our <span>Mentors</span></h2>
        {/* Same scissors dash the design puts under "What is Visora?", and it
            sits between the heading and the subtitle, not after both. */}
        <ThemeImage src={headingUnderline} alt="" aria-hidden="true" />
        <p className="about-section-subtitle">Guided by industry leaders who inspire excellence and innovation.</p>
      </motion.header>
      {/* Each card reveals itself as it scrolls in. Revealing the grid as one
          waited for a quarter of it to be on screen, and on a phone, where the
          cards stack into one column several screens tall, that never
          happened: the cards stayed invisible. */}
      <div className="about-mentor-grid">
        {mentors.map((mentor, index) => (
          <motion.div key={mentor.name} initial={reduceMotion ? false : "hidden"} whileInView="show" viewport={viewportOnce} variants={cardReveal} custom={{ index, columns: 2, step: 0.14 }}>
            <PersonCard person={mentor} index={index} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
