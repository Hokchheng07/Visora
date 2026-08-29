import { motion } from "motion/react";
import { ClockIcon, LanguageIcon, PencilSquareIcon, TvIcon } from "@heroicons/react/24/outline";
import blobArtwork from "../../assets/Website/Features-Section/why-choose-blob.png";
import { fadeInUp, popIn, staggerContainer, viewportOnce } from "../../lib/animations";

const benefits = [
  { title: "Easy to Customize", copy: "Design beautiful backdrops without advanced design skills.", color: "#705ae0", icon: PencilSquareIcon },
  { title: "Khmer-Inspired", copy: "Use Cambodian cultural elements and Khmer fonts.", color: "#45bfd1", icon: LanguageIcon },
  { title: "Event Ready", copy: "Add countdown timers and event information.", color: "#ffc21c", icon: ClockIcon },
  { title: "Display Anywhere", copy: "Designed for projectors, TVs, LED screens and large displays.", color: "#e16ac9", icon: TvIcon },
];

export default function WhyChooseVisora() {
  return (
    <section className="relative isolate w-full overflow-hidden px-8 py-20 sm:px-16 lg:px-20 lg:py-24" style={{ aspectRatio: "1441 / 927" }}>
      <motion.img
        src={blobArtwork}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        initial={{ opacity: 0, scale: 1.08 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-[#b294f0]/20 via-transparent to-[#ffc21c]/35" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-sparkle opacity-70" />
      <div className="relative z-10 mx-auto max-w-[1080px]">
        <motion.h2
          className="text-center text-4xl font-semibold tracking-tight text-black sm:text-5xl lg:text-[48px]"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeInUp}
        >
          Why choose <span className="text-primary">Visora</span>?
        </motion.h2>
        <motion.div
          className="mx-auto mt-5 h-5 w-[350px] max-w-full bg-[url('/textures/speckles.svg')] opacity-90"
          aria-hidden="true"
          initial={{ opacity: 0, scaleX: 0.6 }}
          whileInView={{ opacity: 0.9, scaleX: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6, delay: 0.15 }}
        />
        <motion.div
          className="mt-20 grid max-w-[720px] gap-x-20 gap-y-20 sm:grid-cols-2"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer(0.14, 0.2)}
        >
          {benefits.map(({ title, copy, color, icon: Icon }) => (
            <motion.article
              key={title}
              className="relative min-h-[135px] border-l-2 pl-5"
              style={{ borderColor: color }}
              variants={fadeInUp}
            >
              <motion.div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-black/20 bg-white shadow-[2px_2px_0_rgba(0,0,0,.18)]"
                style={{ color }}
                variants={popIn}
              >
                <Icon className="h-6 w-6" />
              </motion.div>
              <h3 className="text-[18px] font-semibold text-[#151515]">{title}</h3>
              <p className="mt-1 max-w-[280px] text-[14px] leading-6 text-[#666]">{copy}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
