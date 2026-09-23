import { ThemeImage, MotionThemeImage } from '../../../theme/ThemeImage';
import { NavLink } from "react-router";
import { motion } from "motion/react";
import TemplateCard from "./TemplateCard";
import scissors from "../../../assets/pages/home/hero/DoodleScissors.png";
import arrowWithScissors from "../../../assets/pages/home/hero/ArrowWithScissors.png";
import spiralArrow from "../../../assets/pages/home/popular-templates/SpiralArrow.png";
import {
  fadeIn,
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from "../../../lib/animations/animations";
import topWave from "../../../assets/pages/home/popular-templates/PopularTemplateTopWave.svg";
import lowerWave from "../../../assets/pages/home/popular-templates/PopularTemplateLowerWave.svg";
import useFetchHomepage from '../../../hooks/useFetchHomepage';
import CosmicDust from "../../Effects/CosmicDust.jsx";
import VisoraLoader from "../../ui/VisoraLoader.jsx";

export default function PopularTemplates() {
  const {
    data: templates,
    loading,
    error,
  } = useFetchHomepage("templates");
  return (
    <section className="popular-templates relative overflow-hidden px-5 pb-24 pt-28 sm:px-8 lg:pb-32 lg:pt-36">
      <CosmicDust particleCount={140} />
      <div className="popular-templates-art" aria-hidden="true">
        <ThemeImage src={topWave} className="popular-templates-top-wave" alt="" />
        <ThemeImage src={lowerWave} className="popular-templates-lower-wave" alt="" />
      </div>
      <div className="relative z-10 mx-auto max-w-[1280px]">
        <motion.h2
          className="text-center text-4xl font-semibold leading-tight text-[var(--text-heading)] sm:text-6xl"
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
        <ThemeImage
          src={arrowWithScissors}
          alt=""
          aria-hidden="true"
          className="templates-arrow-scissors"
        />
        <motion.p
          className="popular-templates-copy mx-auto mt-3 max-w-[650px] text-center text-[15px] leading-7 text-[var(--text-body)] sm:text-base"
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
          className="relative mt-14 grid min-w-0 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer(0.15, 0.15)}
        >
          {loading && (
            <VisoraLoader
              className="col-span-full py-8"
              label="Curating popular templates…"
              compact
            />
          )}

          {!loading && error && (
            <p
              role="alert"
              className="col-span-full rounded-2xl bg-red-50 px-5 py-4 text-center text-red-700"
            >
              Could not load templates. Please refresh the page.
            </p>
          )}

          {!loading &&
            !error &&
            templates.map((template, index) => (
              <TemplateCard
                key={template.id ?? `${template.title}-${index}`}
                template={template}
                index={index}
              />
            ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <NavLink
            to="/templates"
            className="more-templates-button"
          >
            More Templates <span aria-hidden="true">→</span>
          </NavLink>
        </motion.div>
      </div>
      <MotionThemeImage
        src={spiralArrow}
        alt=""
        aria-hidden="true"
        className="templates-spiral-arrow pointer-events-none absolute z-0"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeIn}
        transition={{ duration: 0.9, delay: 0.45 }}
      />
      <MotionThemeImage
        src={scissors}
        alt=""
        aria-hidden="true"
        className="templates-scissors pointer-events-none absolute"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeIn}
        transition={{ duration: 0.9, delay: 0.3 }}
      />
    </section>
  );
}
