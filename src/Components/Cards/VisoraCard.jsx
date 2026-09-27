import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Heart, MoreHorizontal } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

/*
 * The one card design, taken from the home page's Popular Templates card
 * (LandingPageComponents/Templates/TemplateCard.jsx, Figma node 1781:154102):
 * a lilac frame around the preview, the title in regular weight, grey copy,
 * tag chips in a three-colour rhythm and a small stat on the right.
 *
 * The heart and the ⋯ menu sit on the preview's top-right corner, over the
 * picture, so they are found in the same place on every card. The whole card
 * opens the design (a stretched button under the title); the corner buttons
 * sit above it, so using them never opens anything by accident.
 *
 *   preview   the picture: a node, or an image URL
 *   badge     optional, top-left of the preview (e.g. "In review", "5 days")
 *   favorite  { active, onToggle } — omitted, no heart
 *   menu      [{ label, icon: Icon, onSelect, danger }] — omitted, no ⋯
 *   stats     [{ icon: Icon, label }] — the right end of the tag row
 *   footer    optional node under everything (e.g. Restore buttons)
 */

const TAG_STYLES = [
  "bg-[rgb(181_92_225/.36)] text-[#6854da]",
  "bg-[rgb(92_134_225/.36)] text-[#4648d4]",
  "bg-[rgb(15_188_95/.16)] text-[#0fbc5f]",
];
const MAX_TAGS = 3;

const cornerButton = "grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#29243a] shadow-[0_2px_8px_rgb(41_36_58/.18)] backdrop-blur transition-[transform,background-color,color] duration-150 hover:bg-white hover:text-primary active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export default function VisoraCard({
  preview, badge, title, description, tags = [], stats = [],
  favorite, menu, onOpen, openLabel, footer, index = 0,
}) {
  const reduceMotion = useReducedMotion();
  const shownTags = tags.slice(0, MAX_TAGS);
  const hiddenTagCount = tags.length - shownTags.length;

  return (
    <motion.article
      className="visora-card relative flex h-full min-w-0 flex-col overflow-hidden rounded-[9px] bg-[var(--surface-base)] shadow-[0_1px_2px_rgb(181_92_225/.22)] transition-shadow duration-200 has-[.visora-card-open:focus-visible]:ring-2 has-[.visora-card-open:focus-visible]:ring-primary has-[.visora-card-open:focus-visible]:ring-offset-2 hover:shadow-[0_10px_24px_rgb(181_92_225/.22)]"
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : Math.min(index % 6, 5) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
    >
      <div className="relative bg-[#b294f0] px-2 pb-3 pt-2.5">
        <div className="aspect-[319/180] w-full overflow-hidden rounded-[10px] bg-[#faf9f4]">
          {typeof preview === "string"
            ? <img src={preview} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false} />
            : preview}
        </div>
        {badge && <div className="pointer-events-none absolute left-4 top-[18px] z-20">{badge}</div>}
        {(favorite || menu?.length) && (
          <div className="absolute right-4 top-[18px] z-20 flex items-center gap-1.5">
            {favorite && <FavoriteButton title={title} {...favorite} reduceMotion={reduceMotion} />}
            {menu?.length > 0 && <CardMenu title={title} items={menu} />}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-2 text-left">
        <h3 title={title} className="line-clamp-1 min-w-0 break-words text-[clamp(18px,1.5vw,22px)] font-normal leading-[1.35] text-[var(--text-heading)]">
          {onOpen ? (
            // The ::after covers the whole card: one click target, no nested buttons.
            <button type="button" onClick={onOpen} aria-label={openLabel || `Open ${title}`}
              className="visora-card-open text-left outline-none after:absolute after:inset-0 after:z-10 after:content-['']">
              {title}
            </button>
          ) : title}
        </h3>

        {description && (
          <p title={description} className="mt-1 line-clamp-2 break-words text-sm leading-[1.45] text-[#979797]">{description}</p>
        )}

        {(shownTags.length > 0 || stats.length > 0) && (
          <div className="mt-auto flex items-center gap-3 pt-3">
            <ul className="flex min-w-0 flex-1 flex-nowrap gap-1.5 overflow-hidden" aria-label="Tags">
              {shownTags.map((tag, tagIndex) => (
                <li key={`${tag}-${tagIndex}`} title={tag}
                  className={`min-w-0 truncate rounded-full px-2.5 py-0.5 text-xs leading-4 ${TAG_STYLES[tagIndex % TAG_STYLES.length]}`}>
                  {tag}
                </li>
              ))}
              {hiddenTagCount > 0 && (
                <li title={tags.slice(MAX_TAGS).join(", ")} className="shrink-0 rounded-full bg-[rgb(151_151_151/.16)] px-2 py-0.5 text-xs leading-4 text-[var(--text-body)]">
                  +{hiddenTagCount}
                </li>
              )}
            </ul>
            {stats.map(({ icon: Icon, label }) => (
              <span key={label} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm leading-5 text-[var(--text-body)]">
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
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
      className={cornerButton}
      animate={reduceMotion ? undefined : { scale: active ? [1, 1.25, 1] : 1 }}
      transition={{ duration: 0.3 }}>
      <Heart className={`h-[18px] w-[18px] ${active ? "fill-primary text-primary" : ""}`} aria-hidden="true" />
    </motion.button>
  );
}

function CardMenu({ title, items }) {
  return (
    <Menu>
      <MenuButton aria-label={`More actions for ${title}`} className={cornerButton}>
        <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
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
