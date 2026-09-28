import { motion, useReducedMotion } from "motion/react";
import { fadeInUp, viewportOnce } from "../../lib/animations/animations";
import { cardReveal } from "./cardReveal.js";
import { ThemeImage } from "../../theme/ThemeImage";
import { members } from "./aboutData";
import headingUnderline from "../../assets/pages/about/what-is-visora/UnderlineForWhatIsVisora.svg";
import PersonCard from "./PersonCard";

export default function MeetOurMembers() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-people about-members" aria-labelledby="about-members-title">
      <motion.header className="about-section-heading" initial={reduceMotion ? false : "hidden"} whileInView="show" viewport={viewportOnce} variants={fadeInUp}>
        <h2 id="about-members-title">Meet Our <span>Members</span></h2>
        {/* Same scissors dash as Our Mentors and "What is Visora?", between
            the heading and the subtitle. */}
        <ThemeImage src={headingUnderline} alt="" aria-hidden="true" />
        <p className="about-section-subtitle">The passionate people driving Visora forward.</p>
      </motion.header>
      {/* Each card reveals itself as it scrolls in. Revealing the grid as one
          waited for a quarter of it to be on screen, and on a phone, where the
          cards stack into one column several screens tall, that never
          happened: the cards stayed invisible. */}
      <div className="about-member-grid">
        {members.map((member, index) => (
          <motion.div key={member.name} initial={reduceMotion ? false : "hidden"} whileInView="show" viewport={viewportOnce} variants={cardReveal} custom={{ index, columns: 4, step: 0.08 }}>
            <PersonCard person={member} index={index + 2} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
