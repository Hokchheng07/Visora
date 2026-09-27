import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Eye, Heart, MoreHorizontal, UsersRound, WandSparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import TemplatePreview from "./TemplatePreview";

/*
 * A template on the Templates page. The favorite has a white circular surface
 * over the preview so it stays legible on any thumbnail. The menu uses a soft
 * lavender surface beside the title.
 *
 * A template from the server shows its uploaded thumbnail; a sample one draws
 * its preview in code. Clicking the preview or title opens the Preview.
 */
export function TemplateArtwork({ template }) {
  if (template.image) return <img src={template.image} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false} />;
  if (template.preview) return <TemplatePreview template={template} />;
  return <div className="h-full w-full bg-primary/10" />;
}

export default function TemplateCard({ template, index = 0, favorite, onFavorite, onUse, onPreview }) {
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
      {/* TEMPLATE PREVIEW + FAVORITE */}
      <div className="relative bg-[#a98bea] p-2">
        <button type="button" onClick={onPreview} aria-label={`Preview ${template.title}`} className="block w-full">
          <div className="aspect-video w-full overflow-hidden rounded-[10px] bg-[#faf9f4]">
            <TemplateArtwork template={template} />
          </div>
        </button>

        <motion.button
          type="button"
          aria-label={favorite ? `Remove ${template.title} from favorites` : `Add ${template.title} to favorites`}
          aria-pressed={!!favorite}
          onClick={onFavorite}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white text-[#302069] shadow-[0_4px_12px_rgb(40_26_90/.18)] transition-colors hover:bg-[#f5f0ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          animate={reduceMotion ? undefined : { scale: favorite ? [1, 1.3, 1] : 1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.85 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
        >
          <Heart
            className={`h-[21px] w-[21px] ${favorite ? "fill-primary text-primary" : "fill-none"}`}
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </motion.button>
      </div>

      {/* CARD CONTENT */}
      <div className="px-4 pb-3.5 pt-3">
        {/* TITLE + MENU */}
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onPreview} className="min-w-0 flex-1 text-left">
            <h3 className="truncate text-[14px] font-semibold leading-tight text-[var(--text-heading)] sm:text-[15px] md:text-base lg:text-[17px] xl:text-[18px]">
              {template.title}
            </h3>
          </button>

          <Menu>
            <MenuButton
              aria-label={`More actions for ${template.title}`}
              className="-mr-1.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f1ebff] text-[#302069] transition-colors hover:bg-[#e8ddff] data-[open]:bg-[#e8ddff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-[#39314f] dark:text-[#ded4ff] dark:hover:bg-[#4a3d68] dark:data-[open]:bg-[#4a3d68]"
            >
              <MoreHorizontal className="h-[22px] w-[22px]" aria-hidden="true" />
            </MenuButton>
            {/* Anchored and portalled, so the card's rounded clip never cuts it off. */}
            <MenuItems anchor={{ to: "bottom end", gap: 6 }} transition
              className="z-[200] min-w-[190px] rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-1.5 shadow-[0_18px_40px_rgb(41_36_58/.18)] outline-none transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0">
              {[
                { label: "Use this template", icon: WandSparkles, onSelect: onUse },
                { label: "Preview", icon: Eye, onSelect: onPreview },
                { label: favorite ? "Remove from favorites" : "Add to favorites", icon: Heart, onSelect: onFavorite },
              ].map(({ label, icon: Icon, onSelect }) => (
                <MenuItem key={label}>
                  <button type="button" onClick={onSelect}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--text-heading)] data-[focus]:bg-primary/10 data-[focus]:text-primary">
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>

        {/* DESCRIPTION */}
        <p className="mt-2 line-clamp-2 min-h-[36px] text-[11px] leading-[1.6] text-[var(--text-muted)] sm:text-xs md:text-[13px]">
          {template.description}
        </p>

        {/* TAGS + USERS */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
            {template.tags?.slice(0, 3).map((tag, tagIndex) => (
              <span
                key={tag}
                className={`max-w-[6rem] shrink-0 truncate rounded-full px-2.5 py-0.5 text-[9px] font-medium sm:text-[10px] ${
                  tagIndex === 0
                    ? "bg-[#eadcff] text-[#8758e8]"
                    : tagIndex === 1
                      ? "bg-[#fff0c8] text-[var(--text-heading)]"
                      : "bg-[#e6ddff] text-[#7656dd]"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {template.users > 0 && (
            <div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[10px] text-[var(--text-muted)] sm:text-[11px] lg:text-xs">
              <UsersRound className="h-[13px] w-[13px] lg:h-[14px] lg:w-[14px]" />
              {template.users} uses
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
