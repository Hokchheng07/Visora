import { MotionThemeImage } from '../../../theme/ThemeImage';
<<<<<<< HEAD
import { HeartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { EASE, fadeInUp } from "../../../lib/animations/animations";
=======
import { NavLink } from "react-router";
import { motion } from "motion/react";
import { EASE, fadeInUp } from "../../../lib/animations/animations";
import favoriteIcon from "../../../assets/shared/icons/FavoriteOutline.svg";
import peopleIcon from "../../../assets/shared/icons/People.svg";
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb

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

<<<<<<< HEAD
=======
// Tag tints from the Figma card (node 1781:154102), cycled by position so any
// number of tags keeps the same three-colour rhythm.
const tagStyles = [
  "bg-[rgb(181_92_225/.36)] text-[#6854da]",
  "bg-[rgb(92_134_225/.36)] text-[#4648d4]",
  "bg-[rgb(15_188_95/.16)] text-[#0fbc5f]",
];

// There is no template detail route yet, so every card opens the editor.
const CARD_LINK = "/editor";
const MAX_TAGS = 3;

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

>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
export default function TemplateCard({
  template,
  index = 0,
  animateContent = false,
}) {
<<<<<<< HEAD
  const { image, title, description } = template;
=======
  const {
    image,
    imageAlt,
    title,
    description,
    tags = [],
    uses = 0,
  } = template;
  const hasMeta = tags.length > 0 || uses > 0;
  // Preview shows at most three tags on one row; the rest collapse into "+N".
  const shownTags = tags.slice(0, MAX_TAGS);
  const hiddenTagCount = tags.length - shownTags.length;
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb

  return (
    <motion.article
      key={`${title}-${index}`}
<<<<<<< HEAD
      className="relative min-w-0 rounded-[22px] border border-[var(--border-card)] bg-[var(--surface-base)] shadow-[0_10px_22px_rgba(112,90,224,.12)]"
      variants={animateContent ? showcaseCardReveal : fadeInUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div className="relative z-10 overflow-hidden rounded-[22px]">
        <motion.button
          type="button"
          aria-label={`Add ${title} to favorites`}
          className="absolute right-4 top-4 z-20 shrink-0 rounded-full bg-[var(--surface-overlay)] p-1 text-[var(--text-heading)] backdrop-blur-sm transition-colors hover:bg-primary/10 hover:text-primary"
          variants={animateContent ? contentReveal : undefined}
        >
          <HeartIcon className="h-6 w-6" strokeWidth={1.8} />
        </motion.button>
        <div className="template-preview-frame bg-[#b294f0] p-2">
          <div className="template-card-preview h-[200px] w-full rounded-[15px] bg-[#faf9f4]">
            {image && (
              <MotionThemeImage
                src={image}
                alt={title}
                className="h-full w-full object-cover"
                variants={animateContent ? previewReveal : undefined}
              />
            )}
          </div>
        </div>
        <motion.div
          className="flex items-start gap-3 px-5 pt-3 text-left text-[28px] font-normal leading-tight text-[var(--text-heading)]"
          variants={animateContent ? contentReveal : undefined}
        >
          <div className="min-w-0">
            <h3 className="text-left">{title}</h3>
            <p className="mt-1 max-w-[260px] text-[13px] font-light leading-[1.35] text-[var(--text-muted)] text-left">
              {description}
            </p>
          </div>
        </motion.div>
        <motion.div
          className="flex flex-wrap items-center gap-1.5 px-5 pb-4 pt-3 text-[12px] text-[var(--text-muted)]"
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
=======
      className="template-card relative flex h-full min-w-0 flex-col overflow-hidden rounded-[9px] bg-[var(--surface-base)] shadow-[0_1px_2px_rgb(181_92_225/.22)] transition-shadow duration-200 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary has-[a:focus-visible]:ring-offset-2 hover:shadow-[0_10px_24px_rgb(181_92_225/.22)]"
      variants={animateContent ? showcaseCardReveal : fadeInUp}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {/* Purple frame: 8px sides, 10px top, 12px under the image. The image
          keeps the Figma 319x180 ratio at any card width. */}
      <div className="template-preview-frame bg-[#b294f0] px-2 pb-3 pt-2.5">
        <div className="template-card-preview aspect-[319/180] w-full overflow-hidden rounded-[10px] bg-[#faf9f4]">
          {image && (
            <MotionThemeImage
              src={image}
              alt={imageAlt || title}
              className="h-full w-full object-cover"
              variants={animateContent ? previewReveal : undefined}
            />
          )}
        </div>
      </div>

      <motion.div
        className="flex flex-1 flex-col px-4 pb-4 pt-2 text-left"
        variants={animateContent ? contentReveal : undefined}
      >
        <div className="flex items-start gap-3">
          <h3 title={title} className="line-clamp-1 min-w-0 flex-1 break-words text-[clamp(18px,1.5vw,22px)] font-normal leading-[1.35] text-[var(--text-heading)]">
            {/* The ::after covers the whole card, making it one click target
                without nesting the favorite button inside a link. */}
            <NavLink
              to={CARD_LINK}
              className="outline-none after:absolute after:inset-0 after:z-10 after:content-['']"
            >
              {title}
            </NavLink>
          </h3>
          {/* z-20 keeps the button above the stretched link. */}
          <motion.button
            type="button"
            aria-label={`Add ${title} to favorites`}
            className="relative z-20 -mr-1 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--text-heading)] transition-[color,background-color] duration-150 hover:bg-primary/10 hover:text-primary active:scale-90"
            variants={animateContent ? contentReveal : undefined}
          >
            <MaskIcon src={favoriteIcon} className="h-6 w-6" />
          </motion.button>
        </div>

        {description && (
          <p title={description} className="mt-1 line-clamp-2 break-words pr-10 text-sm leading-[1.45] text-[#979797]">
            {description}
          </p>
        )}

        {hasMeta && (
          <div className="mt-auto flex items-center gap-3 pt-3">
            {/* One row always: chips shrink and truncate instead of wrapping. */}
            <ul className="flex min-w-0 flex-1 flex-nowrap gap-1.5 overflow-hidden" aria-label="Tags">
              {shownTags.map((tag, tagIndex) => (
                <li
                  key={`${tag}-${tagIndex}`}
                  title={tag}
                  className={`min-w-0 truncate rounded-full px-2.5 py-0.5 text-xs leading-4 ${tagStyles[tagIndex % tagStyles.length]}`}
                >
                  {tag}
                </li>
              ))}
              {hiddenTagCount > 0 && (
                <li
                  title={tags.slice(MAX_TAGS).join(", ")}
                  className="shrink-0 rounded-full bg-[rgb(151_151_151/.16)] px-2 py-0.5 text-xs leading-4 text-[var(--text-body)]"
                >
                  +{hiddenTagCount}
                </li>
              )}
            </ul>
            {uses > 0 && (
              <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm leading-5 text-[var(--text-body)]">
                <MaskIcon src={peopleIcon} className="h-[18px] w-[18px]" />
                {Number(uses).toLocaleString()} uses
              </span>
            )}
          </div>
        )}
      </motion.div>
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
    </motion.article>
  );
}
