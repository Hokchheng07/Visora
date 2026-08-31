import { NavLink } from "react-router";
import { motion } from "motion/react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import scissors from "../../assets/Website/LandingPage/Hero-Section/DoodleScissors.png";
import arrowWithScissors from "../../assets/Website/LandingPage/Hero-Section/ArrowWithScissors.png";
import spiralArrow from "../../assets/Website/LandingPage/Features-Section/SpiralArrow.png";
import templateOne from "../../assets/Website/LandingPage/Hero-Section/PurpleFrameNPicture.png";
import templateTwo from "../../assets/Website/LandingPage/Hero-Section/YellowFramNPicture.png";
import { fadeIn, fadeInUp, staggerContainer, viewportOnce } from "../../lib/animations";
import topWave from "../../assets/Website/LandingPage/Features-Section/PopularTemplateTopWave.svg";
import lowerWave from "../../assets/Website/LandingPage/Features-Section/PopularTemplateLowerWave.svg";

const templates = [
  { image: templateOne, title: "Creative doodle" },
  { image: templateTwo, title: "Design your ideas" },
  { image: templateOne, title: "Creative doodle" },
];

export default function PopularTemplates() {
  return (
    <section className="popular-templates bg-sparkle relative overflow-hidden px-5 pb-24 pt-28 sm:px-8 lg:pb-32 lg:pt-36">
      <div className="popular-templates-art" aria-hidden="true">
        <img src={topWave} className="popular-templates-top-wave" alt="" />
        <img src={lowerWave} className="popular-templates-lower-wave" alt="" />
      </div>
      <div className="relative z-10 mx-auto max-w-[1120px]">
        <motion.h2
          className="text-center text-4xl font-semibold leading-tight text-black sm:text-6xl"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeInUp}
        >
Popular <span className="text-primary">Template<span className="text-secondary">s</span></span>
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
          {templates.map(({ image, title }, index) => (
            <motion.article
              key={`${title}-${index}`}
              className="relative min-w-0 rounded-[22px] border border-[#e6ccff] bg-white shadow-[0_10px_22px_rgba(112,90,224,.12)]"
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <div className="relative z-10 overflow-hidden rounded-[22px]">
                <div className="bg-[#b294f0] p-2">
                  <img src={image} alt={title} className="h-[200px] w-full rounded-[15px] bg-[#faf9f4] object-cover" />
                </div>
                <div className="flex items-center justify-between px-5 pt-4 text-[28px] leading-tight font-medium text-[#111]">
                  <span>{title}</span><span className="text-3xl font-bold leading-none">⋮</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 px-5 pb-5 pt-4 text-[12px] text-[#666]">
                  <span className="rounded-full bg-[#e8cdf9] px-3 py-1 text-[11px] text-[#705ae0]">Workshop</span>
                  <span className="rounded-full bg-[#c9d3f6] px-3 py-1 text-[11px] text-[#4f5fd2]">Modern</span>
                  <span className="rounded-full bg-[#d5f2e4] px-3 py-1 text-[11px] text-[#159b60]">Creative</span>
                  <span className="ml-auto flex items-center gap-1 whitespace-nowrap"><UserGroupIcon className="h-5 w-5" />250 uses</span>
                </div>
              </div>
            </motion.article>
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
          <NavLink to="/templates" className="inline-flex items-center rounded-[14px] bg-gradient-to-r from-primary to-accent px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5">
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
