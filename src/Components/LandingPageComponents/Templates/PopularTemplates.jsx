import { NavLink } from "react-router";
import { motion } from "motion/react";
import TemplateCard from "./TemplateCard";
import scissors from "../../../assets/Website/LandingPage/Hero-Section/DoodleScissors.png";
import arrowWithScissors from "../../../assets/Website/LandingPage/Hero-Section/ArrowWithScissors.png";
import spiralArrow from "../../../assets/Website/LandingPage/PopularTemplates/SpiralArrow.png";
import {
  fadeIn,
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from "../../../lib/animations/animations";
import topWave from "../../../assets/Website/LandingPage/PopularTemplates/PopularTemplateTopWave.svg";
import lowerWave from "../../../assets/Website/LandingPage/PopularTemplates/PopularTemplateLowerWave.svg";

const templates = [
  { image: null, title: "Creative doodle", description: "Design with your ideas and creative" },
  { image: null, title: "Design your ideas", description: "Bring your ideas to life with ease" },
  { image: null, title: "Creative doodle", description: "Create beautiful backdrops your way" },
];

export default function PopularTemplates() {
  return (
    <section className="popular-templates bg-sparkle relative overflow-hidden px-5 pb-24 pt-28 sm:px-8 lg:pb-32 lg:pt-36">
      <div className="popular-templates-art" aria-hidden="true">
        <img src={topWave} className="popular-templates-top-wave" alt="" />
        <img src={lowerWave} className="popular-templates-lower-wave" alt="" />
      </div>
      <div className="relative z-10 mx-auto max-w-[1280px]">
        <motion.h2
          className="text-center text-4xl font-semibold leading-tight text-black sm:text-6xl"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeInUp}
        >
          Popular{" "}
          <span className="text-primary">
            Template<span className="text-secondary">s</span>
          </span>
        </motion.h2>
        <img
          src={arrowWithScissors}
          alt=""
          aria-hidden="true"
          className="templates-arrow-scissors"
        />
        <motion.p
          className="mx-auto mt-3 max-w-[650px] text-center text-[15px] leading-7 text-[#585858] sm:text-base"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          Visora helps you create beautiful event backdrops with khmer elements,
          timers, and everything you need.
        </motion.p>

        <motion.div
          className="relative mt-14 grid min-w-0 gap-8 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer(0.15, 0.15)}
        >
          {templates.map((template, index) => (
            <TemplateCard key={`${template.title}-${index}`} template={template} index={index} />
          ))}
        </motion.div>

        <motion.div
          className="mt-4 text-center"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <NavLink
            to="/templates"
            className="inline-flex items-center rounded-[14px] bg-gradient-to-r from-primary to-accent px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5"
          >
            More Templates <span className="ml-2 text-xl leading-none">→</span>
          </NavLink>
        </motion.div>
      </div>
      <motion.img
        src={spiralArrow}
        alt=""
        aria-hidden="true"
        className="templates-spiral-arrow pointer-events-none absolute z-0 hidden lg:block"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeIn}
        transition={{ duration: 0.9, delay: 0.45 }}
      />
      <motion.img
        src={scissors}
        alt=""
        aria-hidden="true"
        className="templates-scissors pointer-events-none absolute hidden lg:block"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeIn}
        transition={{ duration: 0.9, delay: 0.3 }}
      />
    </section>
  );
}
