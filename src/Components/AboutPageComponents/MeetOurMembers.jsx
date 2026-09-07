import { motion, useReducedMotion } from "motion/react";
import { fadeInUp, staggerContainer, viewportOnce } from "../../lib/animations/animations";
import { members } from "./aboutData";
import PersonCard from "./PersonCard";

export default function MeetOurMembers() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-people about-members" aria-labelledby="about-members-title">
      <motion.header className="about-section-heading" initial={reduceMotion ? false : "hidden"} whileInView="show" viewport={viewportOnce} variants={fadeInUp}>
        <h2 id="about-members-title">Meet Our <span>Members</span></h2>
        <p className="about-section-subtitle">The passionate people driving Visora forward.</p>
      </motion.header>
      <motion.div className="about-member-grid" initial={reduceMotion ? false : "hidden"} whileInView="show" viewport={viewportOnce} variants={staggerContainer(0.08)}>
        {members.map((member, index) => (
          <motion.div key={member.name} variants={fadeInUp}>
            <PersonCard person={member} index={index + 2} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
