import { HeartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { EASE, fadeInUp } from "../../../lib/animations/animations";

const showcaseCardReveal = {
  hidden: { opacity: 0, y: 52, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.68,
      ease: EASE,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const previewReveal = {
  hidden: { opacity: 0, scale: 1.1 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

const contentReveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function TemplateCard({
  template,
  index = 0,
  animateContent = false,
}) {
  const { image, title, description } = template;

  return (
    <motion.article
      key={`${title}-${index}`}
      className="relative min-w-0 rounded-[22px] border border-[#e6ccff] bg-white shadow-[0_10px_22px_rgba(112,90,224,.12)]"
      variants={animateContent ? showcaseCardReveal : fadeInUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div className="relative z-10 overflow-hidden rounded-[22px]">
        <motion.button
          type="button"
          aria-label={`Add ${title} to favorites`}
          className="absolute right-4 top-4 z-20 shrink-0 rounded-full bg-white/80 p-1 text-[#111] backdrop-blur-sm transition-colors hover:bg-primary/10 hover:text-primary"
          variants={animateContent ? contentReveal : undefined}
        >
          <HeartIcon className="h-6 w-6" strokeWidth={1.8} />
        </motion.button>
        <div className="bg-[#b294f0] p-2">
          <div className="template-card-preview h-[200px] w-full rounded-[15px] bg-[#faf9f4]">
            {image && (
              <motion.img
                src={image}
                alt={title}
                className="h-full w-full object-cover"
                variants={animateContent ? previewReveal : undefined}
              />
            )}
          </div>
        </div>
        <motion.div
          className="flex items-start gap-3 px-5 pt-3 text-left text-[28px] font-normal leading-tight text-[#111]"
          variants={animateContent ? contentReveal : undefined}
        >
          <div className="min-w-0">
            <h3 className="text-left">{title}</h3>
            <p className="mt-1 max-w-[260px] text-[13px] font-light leading-[1.35] text-[#999] text-left">
              {description}
            </p>
          </div>
        </motion.div>
        <motion.div
          className="flex flex-wrap items-center gap-1.5 px-5 pb-4 pt-3 text-[12px] text-[#666]"
          variants={animateContent ? contentReveal : undefined}
        >
          <span className="rounded-full bg-[#e8cdf9] px-3 py-1 text-[11px] text-[#705ae0]">Workshop</span>
          <span className="rounded-full bg-[#c9d3f6] px-3 py-1 text-[11px] text-[#4f5fd2]">Modern</span>
          <span className="rounded-full bg-[#d5f2e4] px-3 py-1 text-[11px] text-[#159b60]">Creative</span>
          <span className="ml-auto flex items-center gap-1 whitespace-nowrap">
            <UserGroupIcon className="h-5 w-5" />
            250 uses
          </span>
        </motion.div>
      </div>
    </motion.article>
  );
}
