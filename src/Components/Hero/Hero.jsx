import { NavLink } from "react-router";
import { motion } from "motion/react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import "../../styles/phosphor-stats.css";

import heroDashed from "../../assets/Website/LandingPage/Hero-Section/HeroDashedVector.svg";
import heroSolid from "../../assets/Website/LandingPage/Hero-Section/HeroSolidVector.svg";
import heroInner from "../../assets/Website/LandingPage/Hero-Section/InnerHeroVector.svg";
import heroMiddle from "../../assets/Website/LandingPage/Hero-Section/MiddleHeroVector.svg";
import heroOuter from "../../assets/Website/LandingPage/Hero-Section/OuterHeroVector.svg";
import cardEverydayTools from "../../assets/Website/LandingPage/Hero-Section/PurpleFrameNPicture.png";
import cardThingsArent from "../../assets/Website/LandingPage/Hero-Section/YellowFramNPicture.png";
import doodlePlaneLoop from "../../assets/Website/LandingPage/Hero-Section/ArrowNPlane.png";
import airplaneDoodle from "../../assets/Website/LandingPage/Hero-Section/AirplaneDoodle.png";
import heroArrow from "../../assets/Website/LandingPage/Hero-Section/HeroSectionArrow.svg";
import heroStatsBg from "../../assets/Website/LandingPage/Hero-Section/Stats/HeroStatsBg.svg";
import statPurpleBackground from "../../assets/Website/LandingPage/Hero-Section/Stats/PurpleBackground.svg";
import statYellowBackground from "../../assets/Website/LandingPage/Hero-Section/Stats/YellowBackground.svg";
import statFrameTwo from "../../assets/Website/LandingPage/Hero-Section/2ndFrame.png";
import {
  fadeIn,
  fadeInUp,
  scaleIn,
  staggerContainer,
} from "../../lib/animations/animations";
import { useAnimeSplitText } from "../../hooks/useAnimeSplitText";

// Recreated from the Visora Figma file ("Landing Page" frame, hero region:
// nodes 376:116917 blob card, 376:116980 search bar, 376:117047 stats
// row). Copy, colors and spacing are pulled directly from Figma Dev Mode;
// the #705ae0 "Backdrops" highlight and the stat-badge tints are exact
// matches for this project's primary/secondary/accent tokens, so they're
// expressed as tokens rather than one-off hex values.
//
// DECORATIVE LAYER: the illustration PNGs exported from Figma (blob
// shape, doodles, floating template cards). Positioned with percentages
// an intentionally spacious 1920x1080 composition. Decorations are kept in
// their own areas so they do not compete with the hero, search, or stats.
const CANVAS = { w: 1920, h: 1080 };

// Decorative doodle positions/sizes are defined in src/index.css under the
// `.hero-doodle-*` classes (kept in CSS for easy design tweaking).
const DOODLES = [
  {
    src: airplaneDoodle,
    className: "hero-doodle hero-doodle-plane-left hero-plane-left",
  },
  {
    src: doodlePlaneLoop,
    className: "hero-doodle hero-doodle-plane-right hero-plane-right",
  },
  {
    src: cardEverydayTools,
    className:
      "hero-doodle hero-doodle-frame-one hero-frame-bounce hero-frame-one",
  },
  {
    src: cardThingsArent,
    className:
      "hero-doodle hero-doodle-frame-two hero-frame-bounce hero-frame-two",
  },
];

const STATS = [
  {
    value: "500+",
    label: "Ready Templates",
    icon: "ph-upload-simple-bold",
    frame: statFrameTwo,
    badgeClass: "bg-[#fffdf8]",
    iconClass: "text-black",
    badgeBackground: statYellowBackground,
  },
  {
    value: "10K+",
    label: "Designs Created",
    icon: "ph-pen-nib-bold",
    frame: statFrameTwo,
    badgeClass: "bg-[#fffdf8]",
    iconClass: "text-black",
    badgeBackground: statPurpleBackground,
  },
  {
    value: "50K+",
    label: "Happy Users",
    icon: "ph-smiley-bold",
    frame: statFrameTwo,
    badgeClass: "bg-[#fffdf8]",
    iconClass: "text-black",
    badgeBackground: statYellowBackground,
  },
  {
    value: "27/7",
    label: "Support",
    icon: "ph-lifebuoy-bold",
    frame: statFrameTwo,
    badgeClass: "bg-[#fffdf8]",
    iconClass: "text-black",
    badgeBackground: statPurpleBackground,
  },
];

const Hero = () => {
  return (
    <section className="hero-section bg-sparkle relative overflow-hidden bg-transparent font-sans">
      {/* Decorative illustration layer — lg+ only, see note above.
          Entrance is opacity-only (fade in) on each wrapper so it never
          fights the existing hero-frame-float CSS loop, which keeps
          animating `transform` on the <img> underneath undisturbed. */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-0 hidden w-full max-w-[1920px] -translate-x-1/2 lg:block"
        style={{ aspectRatio: `${CANVAS.w} / ${CANVAS.h}` }}
        aria-hidden="true"
      >
        {DOODLES.map(({ src, className }, i) => (
          <motion.div
            key={i}
            className={`absolute ${className ?? ""}`}
            initial="hidden"
            animate="show"
            variants={fadeIn}
            transition={{ duration: 0.9, delay: 0.35 + i * 0.15 }}
          >
            <img src={src} alt="" className="h-full w-full object-contain" />
          </motion.div>
        ))}
      </div>

      <div className="hero-content relative z-10 mx-auto max-w-[1400px] px-5 pt-6 text-center sm:px-8 sm:pt-8 lg:px-10 lg:pt-5">
        {/* HEADLINE BLOB CARD */}
        <div className="hero-blob-card relative mx-auto w-full max-w-[1156px]">
          {/* Supplied Figma blob layers, kept at a responsive aspect ratio. */}
          <motion.div
            className="relative mx-auto aspect-[799.8/512.8] w-full"
            style={{ aspectRatio: "799.8 / 512.8" }}
            initial="hidden"
            animate="show"
            variants={scaleIn}
          >
            <img
              src={heroOuter}
              alt=""
              className="hero-vector hero-vector-outer"
            />
            <img
              src={heroMiddle}
              alt=""
              className="hero-vector hero-vector-middle"
            />
            <img
              src={heroInner}
              alt=""
              className="hero-vector hero-vector-inner"
            />
            <img
              src={heroSolid}
              alt=""
              className="hero-vector hero-vector-solid"
            />
            <img
              src={heroDashed}
              alt=""
              className="hero-vector hero-vector-dashed"
            />
            <motion.div
              className="hero-blob-copy absolute inset-0 flex flex-col items-center justify-center px-10 py-10 text-center xl:px-16"
              initial="hidden"
              animate="show"
              variants={staggerContainer(0.14, 0.35)}
            >
              <HeroCopy />
            </motion.div>
          </motion.div>
        </div>

        {/* Keep the dotted path and scissors attached to the stats block. */}
        <div className="hero-stats-group relative z-20 mx-auto mt-20 w-full max-w-[1156px]">
          <motion.div
            className="hero-arrow-lane relative z-10 mx-auto w-full"
            initial="hidden"
            animate="show"
            variants={fadeIn}
            transition={{ duration: 0.7, delay: 1.1 }}
          >
            <img
              src={heroArrow}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-contain"
            />
          </motion.div>

          {/* STATS */}
          <motion.div
            className="hero-stats relative z-20 mx-auto mt-0 flex min-h-[89px] max-w-[1062px] flex-col items-stretch justify-center gap-3 rounded-2xl px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-10 sm:gap-y-6 sm:px-10 sm:py-[15px]"
            initial="hidden"
            animate="show"
            variants={staggerContainer(0.1, 1.25)}
          >
          <img
            src={heroStatsBg}
            alt=""
            aria-hidden="true"
            className="hero-stats-bg hidden sm:block"
          />
          {STATS.map(
            ({
              value,
              label,
              icon,
              frame,
              badgeClass,
              iconClass,
              badgeBackground,
            }) => (
              <motion.div
                key={label}
                className="hero-stat-row flex items-center gap-3 sm:bg-transparent"
                variants={fadeInUp}
              >
                <div
                  className={`relative flex h-[58px] w-[66px] flex-none items-center justify-center rounded-[2px] ${badgeClass}`}
                >
                  <img
                    src={badgeBackground}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 m-auto h-[42px] w-[50px]"
                  />
                  <img
                    src={frame}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] object-contain"
                  />
                  <i
                    aria-hidden="true"
                    className={`ph-stat-icon ${icon} relative z-10 text-[25px] ${iconClass}`}
                  />
                </div>
                <div className="text-left">
                  <p className="text-[15px] font-semibold text-black/90">
                    {value}
                  </p>
                  <p className="text-[13px] font-semibold text-[#585858]">
                    {label}
                  </p>
                </div>
              </motion.div>
            ),
          )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

function HeroCopy() {
  const headingRef = useAnimeSplitText();

  return (
    <>
      <motion.h1
        ref={headingRef}
        className="mx-auto mt-4 w-full max-w-[1040px] px-2 font-semibold leading-[1.18] tracking-[0.01em] text-black text-[32px] sm:text-[44px] lg:text-[68px] xl:text-[80px]"
        variants={fadeInUp}
      >
        Design Stunning
        <br />
        <span className="hero-backdrop-word">Backdrops</span> Effortlessly
      </motion.h1>

      <motion.p
        className="mx-auto mt-4 max-w-[470px] text-[15px] leading-7 text-[#585858] sm:text-[16px]"
        variants={fadeInUp}
      >
        Visora helps you create beautiful event backdrops with khmer elements,
        timers, and everything you need.
      </motion.p>

      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
        variants={fadeInUp}
      >
        <NavLink
          to="/design"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-[13px] font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
        >
          Start Designing
          <ArrowRightIcon className="h-4 w-4" />
        </NavLink>

        <NavLink
          to="/templates"
          className="rounded-full bg-secondary/20 px-6 py-3 text-[13px] font-semibold text-[#262626] transition-colors duration-200 hover:bg-secondary/30"
        >
          Explore Templates
        </NavLink>
      </motion.div>
    </>
  );
}

export default Hero;
