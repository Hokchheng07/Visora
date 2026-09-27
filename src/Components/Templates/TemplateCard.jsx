import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Eye, Heart, MoreHorizontal, WandSparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import TemplateFormatBadge from "./TemplateFormatBadge.jsx";
import TemplatePreview from "./TemplatePreview";
import { getTemplateCategoryTags, getTemplateFormat } from "./templatePresentation.js";

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
  const categoryTags = getTemplateCategoryTags(template);
  const format = getTemplateFormat(template);
  return (
    <motion.article
      className="templates-card relative flex h-full w-full flex-col overflow-hidden rounded-[14px] border border-[var(--border-card)] bg-[var(--surface-card)] transition-[border-color,box-shadow] duration-200 hover:border-primary/55 hover:shadow-[0_16px_36px_rgb(35_24_72/.12)]"
      layout={reduceMotion ? false : "position"}
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : Math.min(index % 6, 5) * 0.06, ease: [0.22, 1, 0.36, 1], layout: { duration: 0.3, delay: 0 } }}
      whileHover={reduceMotion ? undefined : { y: -3, transition: { duration: 0.18, delay: 0 } }}
    >
      {/* Artwork stays visually dominant inside the active theme's primary frame. */}
      <div className="template-card-media relative p-2.5">
        <button type="button" onClick={onPreview} aria-label={`Preview ${template.title}`} className="group block w-full text-left">
          <div className="relative aspect-video w-full overflow-hidden rounded-[10px] bg-[#faf9f4]">
            <TemplateArtwork template={template} />
            <span className="template-card-preview-cue absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-[rgb(22_18_36/.82)] px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-[0_5px_16px_rgb(12_8_26/.18)] backdrop-blur-sm transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              Preview
            </span>
          </div>
        </button>

        <motion.button
          type="button"
          aria-label={favorite ? `Remove ${template.title} from favorites` : `Add ${template.title} to favorites`}
          aria-pressed={!!favorite}
          onClick={onFavorite}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#302069] shadow-[0_4px_14px_rgb(40_26_90/.16)] transition-colors hover:bg-[#f5f0ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          animate={reduceMotion ? undefined : { scale: favorite ? [1, 1.3, 1] : 1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.85 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
        >
          <Heart
            className={`h-[18px] w-[18px] ${favorite ? "fill-primary text-primary" : "fill-none"}`}
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </motion.button>
      </div>

      {/* CARD CONTENT */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        {/* TITLE + MENU */}
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onPreview} className="min-w-0 flex-1 text-left">
            <h3 className="truncate text-[17px] font-semibold leading-snug tracking-[-0.015em] text-[var(--text-heading)] lg:text-lg">
              {template.title}
            </h3>
          </button>

          <Menu>
            <MenuButton
              aria-label={`More actions for ${template.title}`}
              className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-primary/10 hover:text-primary data-[open]:bg-primary/10 data-[open]:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
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
        <p className="mt-1.5 line-clamp-2 min-h-[42px] text-sm leading-[1.55] text-[var(--text-muted)]">
          {template.description}
        </p>

        {/* CONTENT CATEGORIES + FORMAT */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex min-w-0 items-center gap-1 overflow-hidden">
            {categoryTags.map((tag, tagIndex) => (
              <span
                key={tag}
                className={`max-w-[7.5rem] shrink-0 truncate rounded-full px-2 py-1 text-[11px] font-semibold ${
                  tag === "Timer"
                    ? "template-timer-tag"
                    : tagIndex === 0
                    ? "bg-primary/10 text-primary"
                    : "bg-[color-mix(in_srgb,var(--text-heading)_7%,transparent)] text-[var(--text-body)]"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          <TemplateFormatBadge format={format} compact />
        </div>
      </div>
    </motion.article>
  );
}
