import { MotionThemeImage } from '../../../theme/ThemeImage';
import { NavLink } from "react-router";
import { motion } from "motion/react";
import { EASE, fadeInUp } from "../../../lib/animations/animations";
import favoriteIcon from "../../../assets/shared/icons/FavoriteOutline.svg";
import { tagClass } from "../../Cards/VisoraCard.jsx";
import TemplateFormatBadge from "../../Templates/TemplateFormatBadge.jsx";
import { getTemplateCategoryTags, getTemplateFormat } from "../../Templates/templatePresentation.js";

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

// There is no template detail route yet, so a card opens the editor: a real
// template as a copy to edit, a sample as a blank design.
const cardLink = (template) => (template.remoteId ? `/editor?template=${template.remoteId}` : "/editor");

// The Figma icons are single-colour, so they are drawn as masks filled with
// currentColor. That lets them follow the text colour in both themes.
function MaskIcon({ src, className }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
      }}
    />
  );
}

export default function TemplateCard({
  template,
  index = 0,
  animateContent = false,
}) {
  const { image, imageAlt, title, description } = template;
  // Same as the Templates page card: one category (plus "Timer"), and the
  // orientation and page count on the right.
  const shownTags = getTemplateCategoryTags(template);
  const format = getTemplateFormat(template);

  return (
    <motion.article
      key={`${title}-${index}`}
      className="template-card relative flex h-full min-w-0 flex-col overflow-hidden rounded-[14px] border border-[var(--border-card)] bg-[var(--surface-card)] transition-[border-color,box-shadow] duration-200 focus-within:border-primary hover:border-primary/55 hover:shadow-[0_16px_36px_rgb(35_24_72/.12)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary has-[a:focus-visible]:ring-offset-2"
      variants={animateContent ? showcaseCardReveal : fadeInUp}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
    >
      {/* Same frame as the Templates page card: the preview inside a
          primary-coloured border, with the heart on its top-right corner. */}
      <div className="template-preview-frame relative bg-primary p-2.5">
        <div className="template-card-preview aspect-video w-full overflow-hidden rounded-[10px] bg-[#faf9f4]">
          {image && (
            <MotionThemeImage
              src={image}
              alt={imageAlt || title}
              className="h-full w-full object-cover"
              variants={animateContent ? previewReveal : undefined}
            />
          )}
        </div>
        {/* z-20 keeps the button above the stretched link. */}
        <motion.button
          type="button"
          aria-label={`Add ${title} to favorites`}
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#302069] shadow-[0_4px_14px_rgb(40_26_90/.16)] transition-colors hover:bg-[#f5f0ff] active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          variants={animateContent ? contentReveal : undefined}
        >
          <MaskIcon src={favoriteIcon} className="h-[18px] w-[18px]" />
        </motion.button>
      </div>

      <motion.div
        className="flex flex-1 flex-col px-4 pb-4 pt-3.5 text-left"
        variants={animateContent ? contentReveal : undefined}
      >
        <h3 title={title} className="truncate text-[17px] font-semibold leading-snug tracking-[-0.015em] text-[var(--text-heading)] lg:text-lg">
          {/* The ::after covers the whole card, making it one click target
              without nesting the favorite button inside a link. */}
          <NavLink
            to={cardLink(template)}
            className="outline-none after:absolute after:inset-0 after:z-10 after:content-['']"
          >
            {title}
          </NavLink>
        </h3>

        {description && (
          <p title={description} className="mt-1.5 line-clamp-2 break-words text-sm leading-[1.55] text-[var(--text-muted)]">
            {description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <ul className="flex min-w-0 items-center gap-1 overflow-hidden" aria-label="Tags">
            {shownTags.map((tag) => (
              <li
                key={tag}
                title={tag}
                className={`max-w-[7.5rem] shrink-0 truncate rounded-full px-2 py-1 text-[11px] font-semibold ${tagClass(tag)}`}
              >
                {tag}
              </li>
            ))}
          </ul>
          <TemplateFormatBadge format={format} compact />
        </div>
      </motion.div>
    </motion.article>
  );
}
