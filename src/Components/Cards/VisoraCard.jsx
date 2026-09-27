import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Eye, Heart, MoreHorizontal } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { getTemplateCategoryTags } from "../Templates/templatePresentation.js";

/*
 * The one card design, taken from the Templates page card
 * (Components/Templates/TemplateCard.jsx): the preview in a primary-coloured
 * frame, a white heart on its top-right corner, the title in semibold with the
 * ⋯ menu beside it, muted copy, and a row of small category chips with a stat
 * on the right.
 *
 * The whole card opens the design (a stretched button under the title); the
 * heart and the ⋯ menu sit above it, so using them never opens anything by
 * accident. Hovering the card shows a small cue on the preview.
 *
 *   preview   the picture: a node, or an image URL
 *   badge     optional, top-left of the preview (e.g. "In review", "5 days")
 *   favorite  { active, onToggle } — omitted, no heart
 *   menu      [{ label, icon: Icon, onSelect, danger }] — omitted, no ⋯
 *   tags      category names; one is shown, plus "Timer" when present
 *   stats     [{ icon: Icon, label }] — the right end of the chip row
 *   footer    optional node under everything (e.g. Restore buttons)
 */

// Same chip colours as the Templates card: the category in the brand tint,
// "Timer" in warm yellow.
export function tagClass(tag) {
  return String(tag).toLowerCase() === "timer"
    ? "bg-[#fff0c7] text-[#874100] dark:bg-[#4b2d0b] dark:text-[#ffd584]"
    : "bg-primary/10 text-primary";
}

export default function VisoraCard({
  preview, badge, title, description, tags = [], stats = [],
  favorite, menu, onOpen, openLabel, footer, index = 0,
}) {
  const reduceMotion = useReducedMotion();
  // Same rule as the Templates card: one category, plus "Timer" if timed.
  const shownTags = getTemplateCategoryTags({ tags });

  return (
    <motion.article
      className="visora-card group/card relative flex h-full min-w-0 flex-col overflow-hidden rounded-[14px] border border-[var(--border-card)] bg-[var(--surface-card)] transition-[border-color,box-shadow] duration-200 focus-within:border-primary hover:border-primary/55 hover:shadow-[0_16px_36px_rgb(35_24_72/.12)] has-[.visora-card-open:focus-visible]:ring-2 has-[.visora-card-open:focus-visible]:ring-primary has-[.visora-card-open:focus-visible]:ring-offset-2"
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : Math.min(index % 6, 5) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -3, transition: { duration: 0.18, delay: 0 } }}
    >
      <div className="relative bg-primary p-2.5">
        <div className="relative aspect-video w-full overflow-hidden rounded-[10px] bg-[#faf9f4]">
          {typeof preview === "string"
            ? <img src={preview} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false} />
            : preview}
          {onOpen && (
            <span aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 inline-flex translate-y-1 items-center gap-1.5 rounded-lg bg-[rgb(22_18_36/.82)] px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-[0_5px_16px_rgb(12_8_26/.18)] backdrop-blur-sm transition-[opacity,transform] duration-200 group-hover/card:translate-y-0 group-hover/card:opacity-100 [@media(hover:none)]:hidden">
              <Eye className="h-3.5 w-3.5" />
              Open
            </span>
          )}
        </div>
        {badge && <div className="pointer-events-none absolute left-4 top-4 z-20">{badge}</div>}
        {favorite && (
          <div className="absolute right-4 top-4 z-20">
            <FavoriteButton title={title} {...favorite} reduceMotion={reduceMotion} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5 text-left">
        <div className="flex items-center justify-between gap-3">
          <h3 title={title} className="min-w-0 flex-1 truncate text-[17px] font-semibold leading-snug tracking-[-0.015em] text-[var(--text-heading)] lg:text-lg">
            {onOpen ? (
              // The ::after covers the whole card: one click target, no nested buttons.
              <button type="button" onClick={onOpen} aria-label={openLabel || `Open ${title}`}
                className="visora-card-open text-left outline-none after:absolute after:inset-0 after:z-10 after:content-['']">
                {title}
              </button>
            ) : title}
          </h3>
          {menu?.length > 0 && <CardMenu title={title} items={menu} />}
        </div>

        {description && (
          <p title={description} className="mt-1.5 line-clamp-2 min-h-[42px] break-words text-sm leading-[1.55] text-[var(--text-muted)]">{description}</p>
        )}

        {(shownTags.length > 0 || stats.length > 0) && (
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <ul className="flex min-w-0 items-center gap-1 overflow-hidden" aria-label="Tags">
              {shownTags.map((tag) => (
                <li key={tag} title={tag}
                  className={`max-w-[7.5rem] shrink-0 truncate rounded-full px-2 py-1 text-[11px] font-semibold ${tagClass(tag)}`}>
                  {tag}
                </li>
              ))}
            </ul>
            {stats.map(({ icon: Icon, label }) => (
              <span key={label} className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-medium tabular-nums text-[var(--text-muted)]">
                {Icon && <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
                {label}
              </span>
            ))}
          </div>
        )}

        {footer && <div className="relative z-20 mt-3">{footer}</div>}
      </div>
    </motion.article>
  );
}

function FavoriteButton({ title, active, onToggle, reduceMotion }) {
  return (
    <motion.button type="button" onClick={onToggle} aria-pressed={!!active}
      aria-label={active ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
      className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#302069] shadow-[0_4px_14px_rgb(40_26_90/.16)] transition-colors hover:bg-[#f5f0ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      animate={reduceMotion ? undefined : { scale: active ? [1, 1.3, 1] : 1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.85 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}>
      <Heart className={`h-[18px] w-[18px] ${active ? "fill-primary text-primary" : "fill-none"}`} strokeWidth={2.2} aria-hidden="true" />
    </motion.button>
  );
}

function CardMenu({ title, items }) {
  return (
    <Menu>
      <MenuButton aria-label={`More actions for ${title}`}
        className="relative z-20 -mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-primary/10 hover:text-primary data-[open]:bg-primary/10 data-[open]:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </MenuButton>
      {/* Anchored and portalled, so the card's rounded clip never cuts it off. */}
      <MenuItems anchor={{ to: "bottom end", gap: 6 }} transition
        className="z-[200] min-w-[190px] rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-1.5 shadow-[0_18px_40px_rgb(41_36_58/.18)] outline-none transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0">
        {items.map(({ label, icon: Icon, onSelect, danger }) => (
          <MenuItem key={label}>
            <button type="button" onClick={onSelect}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium data-[focus]:bg-primary/10 ${danger ? "text-[#d0293a]" : "text-[var(--text-heading)] data-[focus]:text-primary"}`}>
              {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
              {label}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
