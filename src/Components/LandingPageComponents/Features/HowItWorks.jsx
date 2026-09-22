import { ThemeImage, MotionThemeImage, MotionThemeSvgImage } from '../../../theme/ThemeImage';
import { useEffect, useRef } from "react";
import { LayoutTemplate, SlidersHorizontal, Monitor } from "lucide-react";
import { animate } from "animejs/animation";
import { createScope } from "animejs/scope";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  EASE,
  fadeInUp,
} from "../../../lib/animations/animations";
import topTornGradient from "../../../assets/pages/home/how-it-works/Top-bg.svg";
import bottomTornStrip from "../../../assets/pages/home/how-it-works/BottomBg.svg";
import leftSticker from "../../../assets/pages/home/how-it-works/MyEveryDayToolsinFigma(LeftBig).svg";
import rightSticker from "../../../assets/pages/home/how-it-works/YellowFrame(SmallRight).svg";
import squiggleCutline from "../../../assets/pages/home/how-it-works/MiddleArrowWithScissors.svg";
import hillOne from "../../../assets/pages/home/how-it-works/FirstRactangle.svg";
import hillTwo from "../../../assets/pages/home/how-it-works/2ndRactangle.svg";
import hillThree from "../../../assets/pages/home/how-it-works/3rdRactangle.svg";
import badgeOne from "../../../assets/pages/home/how-it-works/01.svg";
import badgeTwo from "../../../assets/pages/home/how-it-works/02.svg";
import badgeThree from "../../../assets/pages/home/how-it-works/03.svg";
import backgroundArtwork from "../../../assets/pages/home/how-it-works/Mountain.svg";
import dashedLineSvg from "../../../assets/pages/home/how-it-works/DashedLine.svg?raw";
import solidLineSvg from "../../../assets/pages/home/how-it-works/HowItWorksSolidLine.svg?raw";
import {
  createSmoothPath,
  dashCentrelinePoints,
  getPathData,
} from "../../../lib/animations/svgPath";
import CosmicDust from "../../Effects/CosmicDust.jsx";

const steps = [
  {
    number: "01",
    title: "Choose",
    copy: "Pick a template from the library.",
  },
  {
    number: "02",
    title: "Customize",
    copy: "Add text, images, logos, timers and decorations.",
  },
  {
    number: "03",
    title: "Present",
    copy: "Display it on a TV, projector or LED screen.",
  },
];

const stepBadges = [badgeOne, badgeTwo, badgeThree];
const stepIcons = [LayoutTemplate, SlidersHorizontal, Monitor];

const dashedLinePath = getPathData(dashedLineSvg);
const solidLinePath = getPathData(solidLineSvg);
// Was a hardcoded `.slice(6)` to drop this export's six leading decorations;
// dashCentrelinePoints picks the dashes out by shape instead, which yields the
// same 101 points here and also works on the About journey line.
const dashedCenterlinePath = createSmoothPath(
  dashCentrelinePoints(dashedLinePath),
);

const headingText = "How It Works";

const letterDrop = {
  hidden: { opacity: 0, y: -54, rotate: -4 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring", stiffness: 210, damping: 18, mass: 0.7 },
  },
};

const letterContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

const hillRise = {
  hidden: {
    opacity: 0,
    transform: "translateY(190px) scale(0.94)",
  },
  show: (index) => ({
    opacity: 1,
    transform: "translateY(0px) scale(1)",
    transition: {
      type: "spring",
      stiffness: 85,
      damping: 16,
      mass: 0.95,
      delay: 0.12 + index * 0.14,
    },
  }),
};

const stepReveal = {
  hidden: { opacity: 0, y: 26, scale: 0.82 },
  show: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, delay: 0.42 + index * 0.14, ease: EASE },
  }),
};

function useAnimeDashFlow(active, reduceMotion) {
  const dashPathRef = useRef(null);

  useEffect(() => {
    if (!dashPathRef.current || !active || reduceMotion) return undefined;

    const scope = createScope({ root: dashPathRef }).add(() => {
      animate(dashPathRef.current, {
        strokeDashoffset: [0, -21],
        duration: 520,
        ease: "linear",
        loop: true,
      });
    });

    return () => scope.revert();
  }, [active, reduceMotion]);

  return dashPathRef;
}

const desktopSteps = [
  {
    hill: hillOne,
    x: 185,
    y: 606,
    width: 682,
    height: 312,
    badgeX: 557,
    badgeY: 574,
    contentCenterX: 557,
    contentCenterY: 762,
    contentWidth: 320,
    contentHeight: 150,
  },
  {
    hill: hillTwo,
    x: 422,
    y: 488,
    width: 760,
    height: 434,
    badgeX: 870,
    badgeY: 458,
    contentCenterX: 870,
    contentCenterY: 675,
    contentWidth: 370,
    contentHeight: 180,
  },
  {
    hill: hillThree,
    x: 760,
    y: 364,
    width: 645,
    height: 561,
    badgeX: 1170,
    badgeY: 334,
    contentCenterX: 1170,
    contentCenterY: 550,
    contentWidth: 330,
    contentHeight: 160,
  },
];

function SectionHeading({ reduceMotion, revealed }) {
  return (
    <motion.header
      className="relative z-20 mx-auto max-w-3xl text-center md:absolute md:left-1/2 md:top-[16%] md:w-full md:-translate-x-1/2"
      initial={reduceMotion ? false : "hidden"}
      animate={revealed ? "show" : "hidden"}
    >
      <motion.h2
        aria-label={headingText}
        className="whitespace-nowrap text-[2.6rem] font-semibold leading-none tracking-[-0.045em] text-[var(--text-heading)] sm:text-5xl md:text-[4.75vw] xl:text-[4.25rem]"
        variants={letterContainer}
      >
        {headingText.split("").map((letter, index) => (
          <motion.span
            aria-hidden="true"
            className={`inline-block ${
              letter === " "
                ? "w-[0.38em]"
                : index >= 7
                ? index === headingText.length - 1
                  ? "text-secondary"
                  : "text-primary"
                : ""
            }`}
            key={`${letter}-${index}`}
            variants={letterDrop}
          >
            {letter === " " ? "" : letter}
          </motion.span>
        ))}
      </motion.h2>
      <MotionThemeImage
        src={squiggleCutline}
        alt=""
        aria-hidden="true"
        className="how-cutline mx-auto mt-3 w-[min(430px,82vw)] md:w-[31.875vw] md:max-w-[459px]"
        variants={fadeInUp}
      />
    </motion.header>
  );
}

function DesktopSteps({ reduceMotion, revealed }) {
  const dashPathRef = useAnimeDashFlow(revealed, reduceMotion);

  return (
    <motion.div
      className="absolute inset-0 z-10 hidden h-full w-full md:block"
      initial={reduceMotion ? false : "hidden"}
      animate={revealed ? "show" : "hidden"}
    >
      <motion.svg
        viewBox="0 0 1405 911"
        preserveAspectRatio="xMidYMid meet"
        className="block h-full w-full overflow-hidden"
        role="img"
        aria-labelledby="how-it-works-desktop-title"
      >
        <title id="how-it-works-desktop-title">
          Three steps: choose, customize, and present
        </title>

        {[...steps].reverse().map((step) => {
          const index = steps.findIndex(
            ({ number }) => number === step.number,
          );
          const layout = desktopSteps[index];

          return (
            <MotionThemeSvgImage
              key={step.number}
              href={layout.hill}
              x={layout.x}
              y={layout.y}
              width={layout.width}
              height={layout.height}
              preserveAspectRatio="none"
              custom={index}
              variants={hillRise}
              style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
            />
          );
        })}

        <motion.svg
          x="70"
          y="315"
          width="1300"
          height="476"
          viewBox="0 0 1327 486"
          preserveAspectRatio="none"
          overflow="visible"
          variants={fadeInUp}
        >
          <path d={solidLinePath} fill="var(--illustration-ink)" />
        </motion.svg>
        <motion.svg
          x="70"
          y="300"
          width="1300"
          height="476"
          viewBox="0 0 1319 477"
          preserveAspectRatio="none"
          overflow="visible"
          variants={fadeInUp}
        >
          <path
            ref={dashPathRef}
            d={dashedCenterlinePath}
            fill="none"
            stroke="var(--illustration-ink)"
            strokeDasharray="9 12"
            strokeLinecap="round"
            strokeWidth="3.2"
          />
        </motion.svg>

        {steps.map((step, index) => {
          const layout = desktopSteps[index];

          return (
            <g key={step.number}>
              <MotionThemeSvgImage
                href={stepBadges[index]}
                x={layout.badgeX - 35}
                y={layout.badgeY - 34}
                width="70"
                height="69"
                custom={index}
                variants={stepReveal}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
              <motion.foreignObject
                x={layout.contentCenterX - layout.contentWidth / 2}
                y={layout.contentCenterY - layout.contentHeight / 2}
                width={layout.contentWidth}
                height={layout.contentHeight}
                custom={index}
                variants={stepReveal}
              >
                <div className="flex h-full flex-col items-center justify-center px-3 text-center font-sans text-white">
                  <h3 className="text-[32px] font-bold leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-[21px] leading-8 text-white/90">
                    {step.copy}
                  </p>
                </div>
              </motion.foreignObject>
            </g>
          );
        })}
      </motion.svg>
    </motion.div>
  );
}

function MobileSteps({ progress, reduceMotion }) {
  const drawnPathLength = useTransform(progress, [0.08, 0.9], [0, 1]);

  return (
    <div className="how-mobile-steps relative z-10 mx-auto mt-14 max-w-xl md:hidden">
      <svg
        viewBox="0 0 486 1327"
        preserveAspectRatio="none"
        className="how-mobile-legacy-line pointer-events-none absolute inset-y-5 left-1/2 z-0 h-[calc(100%-2.5rem)] w-28 -translate-x-1/2 overflow-visible"
        aria-hidden="true"
      >
        {!reduceMotion && (
          <defs>
            <mask
              id="mobile-how-it-works-reveal"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="1327"
              height="486"
            >
              <motion.path
                d="M0 243H1327"
                fill="none"
                stroke="white"
                strokeWidth="520"
                pathLength="1"
                style={{ pathLength: drawnPathLength }}
              />
            </mask>
          </defs>
        )}
        <g transform="translate(486 0) rotate(90)">
          <path d={solidLinePath} fill="var(--illustration-ink)" />
          <motion.path
            className="how-it-works-mobile-dashed"
            d={dashedLinePath}
            fill="var(--illustration-ink)"
            mask={
              reduceMotion ? undefined : "url(#mobile-how-it-works-reveal)"
            }
            style={{ pathLength: reduceMotion ? 1 : drawnPathLength }}
          />
        </g>
      </svg>

      <div className="how-mobile-list relative z-10 space-y-12">
        {steps.map((step, index) => {
          const StepIcon = stepIcons[index];
          return (
          <motion.article
            key={step.number}
            className={`how-mobile-card how-mobile-card-${index + 1} relative min-h-56 overflow-hidden rounded-b-3xl rounded-t-[4rem] bg-gradient-to-br from-[#8f76ec] via-[#705ae0] to-[#5537bd] px-7 pb-9 pt-20 text-center text-white shadow-[0_18px_38px_rgba(77,50,170,0.2)]`}
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
          >
            <div
              aria-hidden="true"
              className="how-mobile-card-glow pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent"
            />
            <ThemeImage
              src={stepBadges[index]}
              alt=""
              aria-hidden="true"
              className="how-mobile-legacy-badge absolute left-1/2 top-3 h-[68px] w-[69px] -translate-x-1/2 drop-shadow-md"
            />
            <span className="how-mobile-step-icon" aria-hidden="true"><StepIcon size={22} strokeWidth={1.8} /></span>
            <span className="how-mobile-number" aria-hidden="true">{step.number}</span>
            <h3 className="how-mobile-title text-2xl font-bold">{step.title}</h3>
            <p className="how-mobile-description mx-auto mt-3 max-w-sm text-base leading-7 text-white/90">
              {step.copy}
            </p>
            {index < steps.length - 1 && (
              <svg className="how-mobile-connector" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
                <path className="how-mobile-connector-guide" d="M40 8C40 65 260 30 260 88" />
                <motion.path
                  d="M40 8C40 65 260 30 260 88"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: reduceMotion ? 0 : 1.2, ease: EASE }}
                />
                <path className="how-mobile-connector-traveler" d="M40 8C40 65 260 30 260 88" pathLength="1" />
                <path d="M254 80L260 89L266 80" />
              </svg>
            )}
          </motion.article>
          );
        })}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const sectionInView = useInView(sectionRef, {
    once: true,
    margin: "0px 0px -12% 0px",
  });
  const revealed = reduceMotion || sectionInView;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 75%", "end 35%"],
  });

  return (
    <section
      ref={sectionRef}
      className="how-it-works-section relative isolate w-full overflow-hidden bg-[var(--surface-warm)] px-5 pb-28 pt-28 sm:px-8 sm:pb-32 sm:pt-32 md:aspect-[1405/911] md:px-0 md:py-0"
    >
      <CosmicDust particleCount={180} />
      {/* Sits in front of the step mountains (DesktopSteps is z-10) but under
          the stickers (z-20) and the bottom torn strip (z-30). */}
      <ThemeImage
        src={backgroundArtwork}
        alt=""
        aria-hidden="true"
        className="how-mountain-overlay pointer-events-none absolute inset-0 z-[11] block h-full w-full max-w-none object-fill"
      />
      <ThemeImage
        src={topTornGradient}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] block h-16 w-full max-w-none object-fill md:h-[11.64%]"
      />
      <ThemeImage
        src={bottomTornStrip}
        alt=""
        aria-hidden="true"
        className="how-bottom-wave pointer-events-none absolute inset-x-0 bottom-0 z-30 block h-16 w-full max-w-none object-fill md:h-[11.64%]"
      />
      <MotionThemeImage
        src={leftSticker}
        alt=""
        aria-hidden="true"
        className="how-it-works-left-sticker pointer-events-none absolute left-[9%] top-[23.5%] z-20 block w-[17.36%] max-w-none"
        initial={reduceMotion ? false : { opacity: 0, x: -140, rotate: -7 }}
        animate={
          revealed
            ? { opacity: 1, x: 0, rotate: 0 }
            : { opacity: 0, x: -140, rotate: -7 }
        }
        transition={{ duration: 0.85, delay: 0.18, ease: EASE }}
      />
      <MotionThemeImage
        src={rightSticker}
        alt=""
        aria-hidden="true"
        className="how-it-works-right-sticker pointer-events-none absolute right-[8.4%] top-[12.5%] z-20 block w-[8.4%] max-w-none"
        initial={reduceMotion ? false : { opacity: 0, x: 140, rotate: 7 }}
        animate={
          revealed
            ? { opacity: 1, x: 0, rotate: 0 }
            : { opacity: 0, x: 140, rotate: 7 }
        }
        transition={{ duration: 0.85, delay: 0.24, ease: EASE }}
      />

      <SectionHeading reduceMotion={reduceMotion} revealed={revealed} />
      <DesktopSteps reduceMotion={reduceMotion} revealed={revealed} />
      <MobileSteps progress={scrollYProgress} reduceMotion={reduceMotion} />
    </section>
  );
}
