import { Heart, UsersRound } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import TemplatePreview from "./TemplatePreview";

export default function TemplateCard({
  template,
  index = 0,
  favorite,
  onFavorite,
  onOpen,
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      className="templates-card relative h-full w-full overflow-hidden rounded-[12px] border border-[#e5d5ff] bg-[var(--surface-card)] shadow-[0_8px_22px_rgb(112_90_224/.08)] transition-[border-color,box-shadow] duration-200 hover:border-primary/50 hover:shadow-[0_16px_32px_rgb(112_90_224/.16)] dark:border-[var(--border-card)]"
      layout={reduceMotion ? false : "position"}
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : Math.min(index % 6, 5) * 0.06, ease: [0.22, 1, 0.36, 1], layout: { duration: 0.3, delay: 0 } }}
      whileHover={reduceMotion ? undefined : { y: -3, transition: { duration: 0.18, delay: 0 } }}
    >
      {/* TEMPLATE PREVIEW */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Customize ${template.title}`}
        className="block w-full bg-[#a98bea] p-2"
      >
        <div className="aspect-video w-full overflow-hidden rounded-[10px] bg-[#faf9f4]">
          <TemplatePreview template={template} />
        </div>
      </button>

      {/* CARD CONTENT */}
      <div className="px-4 pb-3.5 pt-3">
        {/* TITLE + FAVORITE */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="min-w-0 flex-1 text-left"
          >
            <h3 className="truncate text-[14px] font-semibold leading-tight text-[var(--text-heading)] sm:text-[15px] md:text-base lg:text-[17px] xl:text-[18px]">
              {template.title}
            </h3>
          </button>

          <motion.button
            type="button"
            aria-label={
              favorite ? "Remove from favorites" : "Add to favorites"
            }
            aria-pressed={favorite}
            onClick={onFavorite}
            className="shrink-0"
            animate={reduceMotion ? undefined : { scale: favorite ? [1, 1.3, 1] : 1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.85 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            <Heart
              className={`h-[18px] w-[18px] sm:h-[19px] sm:w-[19px] lg:h-5 lg:w-5 ${
                favorite
                  ? "fill-primary text-primary"
                  : "text-[var(--text-heading)]"
              }`}
            />
          </motion.button>
        </div>

        {/* DESCRIPTION */}
        <p className="mt-2 line-clamp-2 min-h-[36px] text-[11px] leading-[1.6] text-[var(--text-muted)] sm:text-xs md:text-[13px]">
          {template.description}
        </p>

        {/* TAGS + USERS */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
            {template.tags?.slice(0, 3).map((tag, index) => (
              <span
                key={tag}
                className={`max-w-[6rem] shrink-0 truncate rounded-full px-2.5 py-0.5 text-[9px] font-medium sm:text-[10px] ${
                  index === 0
                    ? "bg-[#eadcff] text-[#8758e8]"
                    : index === 1
                      ? "bg-[#fff0c8] text-[var(--text-heading)]"
                      : "bg-[#e6ddff] text-[#7656dd]"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[10px] text-[var(--text-muted)] sm:text-[11px] lg:text-xs">
            <UsersRound className="h-[13px] w-[13px] lg:h-[14px] lg:w-[14px]" />
            {template.users} uses
          </div>
        </div>
      </div>
    </motion.article>
  );
}
