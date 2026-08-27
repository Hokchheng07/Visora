import { NavLink } from "react-router";
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowUpTrayIcon,
  PencilIcon,
  FaceSmileIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/solid";

import blobFill from "../../assets/Hero/MiddleBlob.png";
import blobOuterDashed from "../../assets/Hero/Blob1.png";
import blobInnerOutline from "../../assets/Hero/Blob2.png";
import cardEverydayTools from "../../assets/Hero/PurpleFrameNPicture.png";
import cardThingsArent from "../../assets/Hero/YellowFramNPicture.png";
import doodlePlaneLoop from "../../assets/Hero/ArrowNPlane.png";
import airplaneDoodle from "../../assets/Hero/AirplaneDoodle.png";
import arrowWithScissors from "../../assets/Hero/ArrowWithScissors.png";
import exclamationMark from "../../assets/Hero/ExclamationMark.png";

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
const pct = (x, y, w, h) => ({
  left: `${(x / CANVAS.w) * 100}%`,
  top: `${(y / CANVAS.h) * 100}%`,
  width: `${(w / CANVAS.w) * 100}%`,
  height: `${(h / CANVAS.h) * 100}%`,
});

const DOODLES = [
  { src: airplaneDoodle, box: pct(120, 50, 170, 170), className: "hero-plane-left" },
  { src: doodlePlaneLoop, box: pct(1570, 50, 190, 190), className: "hero-plane-right" },
  { src: cardEverydayTools, box: pct(72, 540, 220, 236), className: "hero-frame-bounce hero-frame-one" },
  { src: cardThingsArent, box: pct(1625, 570, 210, 234), className: "hero-frame-bounce hero-frame-two" },
];

const STATS = [
  {
    value: "500 +",
    label: "Ready Templates",
    icon: ArrowUpTrayIcon,
    badgeClass: "bg-secondary/25",
    iconClass: "text-[#8a6d1c]",
  },
  {
    value: "10K+",
    label: "Designs Created",
    icon: PencilIcon,
    badgeClass: "bg-accent/25",
    iconClass: "text-primary",
  },
  {
    value: "50K+",
    label: "Happy Users",
    icon: FaceSmileIcon,
    badgeClass: "bg-secondary/25",
    iconClass: "text-[#8a6d1c]",
  },
  {
    value: "27/7",
    label: "Support",
    icon: LifebuoyIcon,
    badgeClass: "bg-accent/25",
    iconClass: "text-primary",
  },
];

const Hero = () => {
  return (
    <section className="bg-sparkle relative min-h-[calc(100vh+80px)] overflow-hidden bg-white font-sans lg:min-h-[1080px]">
      {/* Decorative illustration layer — lg+ only, see note above */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-0 hidden w-full max-w-[1920px] -translate-x-1/2 lg:block"
        style={{ aspectRatio: `${CANVAS.w} / ${CANVAS.h}` }}
        aria-hidden="true"
      >
        {DOODLES.map(({ src, box }, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className={`absolute object-contain ${DOODLES[i].className ?? ""}`}
            style={box}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-5 pt-6 text-center sm:px-8 sm:pt-8 lg:px-10 lg:pt-5">
        {/* HEADLINE BLOB CARD */}
        <div className="relative mx-auto w-full max-w-[1040px]">
          {/* Supplied Figma blob layers, kept at a responsive aspect ratio. */}
          <div
            className="relative mx-auto aspect-[799.8/512.8] w-full"
            style={{ aspectRatio: "799.8 / 512.8" }}
          >
            <img src={blobFill} alt="" className="absolute inset-0 h-full w-full object-contain" />
            <img
              src={blobOuterDashed}
              alt=""
              className="absolute object-contain"
              style={{ left: "0.6%", top: "4.25%", width: "95.37%", height: "90.06%" }}
            />
            <img
              src={blobInnerOutline}
              alt=""
              className="absolute object-contain"
              style={{ left: "3.48%", top: "12.56%", width: "92.31%", height: "85.31%" }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-10 py-10 text-center xl:px-16">
              <HeroCopy />
            </div>
          </div>

        </div>

        {/* SEARCH BAR */}
        <div className="relative z-20 mx-auto mt-8 max-w-[620px]">
          <img
            src={exclamationMark}
            alt=""
            aria-hidden="true"
            className="hero-search-exclamation pointer-events-none absolute -left-[51px] -top-14 h-[68px] w-[84px] object-contain sm:-left-[55px] sm:-top-16 sm:h-[76px] sm:w-[94px]"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="flex items-center gap-3 rounded-full border border-gray-300 bg-white px-6 py-3.5 sm:py-4">
            <MagnifyingGlassIcon className="h-6 w-6 flex-none text-gray-500" />
            <span className="h-6 w-px flex-none bg-gray-300" />
            <input
              type="text"
              placeholder="Search Templates"
              className="w-full text-[18px] text-[#585858] outline-none placeholder:text-[#585858] sm:text-[20px]"
            />
          </div>
        </div>

        {/* Keep the dotted path and scissors in a dedicated lane below the
            search field so they cannot overlap it at any viewport width. */}
        <div className="relative z-10 mx-auto mt-8 h-28 w-full max-w-[720px]">
          <img src={arrowWithScissors} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-contain" />
        </div>

        {/* STATS */}
        <div className="relative z-20 mx-auto mt-30 flex max-w-[1250px] flex-wrap items-center justify-center gap-x-10 gap-y-6 rounded-2xl bg-gradient-to-r from-accent/75 via-[#eadfdf] to-secondary/70 px-8 py-5 sm:px-10 sm:py-6 sm:justify-between">
          {STATS.map(({ value, label, icon: StatIcon, badgeClass, iconClass }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`flex h-[42px] w-[50px] flex-none items-center justify-center rounded-[7px] ${badgeClass}`}
              >
                <StatIcon className={`h-6 w-6 ${iconClass}`} />
              </div>
              <div className="text-left">
                <p className="text-[15px] font-semibold text-black/90">{value}</p>
                <p className="text-[13px] font-semibold text-[#585858]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function HeroCopy() {
  return (
    <>
      <p className="text-[13px] font-semibold text-[#262626] sm:text-[14px]">
        Design, Display, Inspire.
      </p>

      <h1 className="mx-auto mt-4 w-full max-w-[720px] px-2 font-semibold leading-[1.15] text-black text-[32px] sm:text-[36px] lg:text-[40px]">
        Design Stunning
        <br />
        <span className="hero-backdrop-word">Backdrops</span> Effortlessly
      </h1>

      <p className="mx-auto mt-4 max-w-[470px] text-[15px] leading-7 text-[#585858] sm:text-[16px]">
        Visora helps you create beautiful event backdrops with khmer
        elements, timers, and everything you need.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
      </div>
    </>
  );
}

export default Hero;
