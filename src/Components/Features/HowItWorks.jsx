import { useEffect, useRef } from "react";
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
  staggerContainer,
  viewportOnce,
} from "../../lib/animations/animations";
import topTornGradient from "../../assets/Website/LandingPage/HowItWorks/Top-bg.svg";
import bottomTornStrip from "../../assets/Website/LandingPage/HowItWorks/BottomBg.svg";
import leftSticker from "../../assets/Website/LandingPage/HowItWorks/MyEveryDayToolsinFigma(LeftBig).svg";
import rightSticker from "../../assets/Website/LandingPage/HowItWorks/YellowFrame(SmallRight).svg";
import squiggleCutline from "../../assets/Website/LandingPage/HowItWorks/MiddleArrowWithScissors.svg";
import hillOne from "../../assets/Website/LandingPage/HowItWorks/FirstRactangle.svg";
import hillTwo from "../../assets/Website/LandingPage/HowItWorks/2ndRactangle.svg";
import hillThree from "../../assets/Website/LandingPage/HowItWorks/3rdRactangle.svg";
import badgeOne from "../../assets/Website/LandingPage/HowItWorks/01.svg";
import badgeTwo from "../../assets/Website/LandingPage/HowItWorks/02.svg";
import badgeThree from "../../assets/Website/LandingPage/HowItWorks/03.svg";
import backgroundArtwork from "../../assets/Website/LandingPage/HowItWorks/Mountain.svg";
import dashedLineSvg from "../../assets/Website/LandingPage/HowItWorks/DashedLine.svg?raw";
import solidLineSvg from "../../assets/Website/LandingPage/HowItWorks/HowItWorksSolidLine.svg?raw";

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

const getPathData = (svgSource) =>
  svgSource.match(/<path d="([^"]+)"/)?.[1] ?? "";

const dashedLinePath = getPathData(dashedLineSvg);
const solidLinePath = getPathData(solidLineSvg);
const dashedPathParts = (
  dashedLinePath.match(/M[\s\S]*?(?=M|$)/g) ?? []
).slice(6);
const dashedLinePoints = dashedPathParts
  .map((path) => path.match(/^M(-?[\d.]+) (-?[\d.]+)/))
  .filter(Boolean)
  .map(([, x, y]) => ({ x: Number(x), y: Number(y) }));

const createSmoothPath = (points) => {
  if (points.length < 2) return "";

  return points.slice(0, -1).reduce((path, point, index) => {
    const previous = points[index - 1] ?? point;
    const next = points[index + 1];
    const afterNext = points[index + 2] ?? next;
    const controlOneX = point.x + (next.x - previous.x) / 6;
    const controlOneY = point.y + (next.y - previous.y) / 6;
    const controlTwoX = next.x - (afterNext.x - point.x) / 6;
    const controlTwoY = next.y - (afterNext.y - point.y) / 6;

    return `${path} C${controlOneX} ${controlOneY} ${controlTwoX} ${controlTwoY} ${next.x} ${next.y}`;
  }, `M${points[0].x} ${points[0].y}`);
};

const dashedCenterlinePath = createSmoothPath(dashedLinePoints);

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
    contentX: 417,
    contentY: 708,
  },
  {
    hill: hillTwo,
    x: 460,
    y: 488,
    width: 695,
    height: 434,
    badgeX: 870,
    badgeY: 458,
    contentX: 730,
    contentY: 637,
  },
  {
    hill: hillThree,
    x: 760,
    y: 364,
    width: 645,
    height: 561,
    badgeX: 1170,
    badgeY: 334,
    contentX: 1030,
    contentY: 527,
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
        className="whitespace-nowrap text-[2.6rem] font-semibold leading-none tracking-[-0.045em] text-[#19171c] sm:text-5xl md:text-[4.75vw] xl:text-[4.25rem]"
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
      <motion.img
        src={squiggleCutline}
        alt=""
        aria-hidden="true"
        className="mx-auto mt-3 w-[min(430px,82vw)] md:w-[31.875vw] md:max-w-[459px]"
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
            <motion.image
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
          <path d={solidLinePath} fill="#17121f" />
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
            stroke="#17121f"
            strokeDasharray="9 12"
            strokeLinecap="round"
            strokeWidth="3.2"
          />
        </motion.svg>

        {steps.map((step, index) => {
          const layout = desktopSteps[index];

          return (
            <g key={step.number}>
              <motion.image
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
                x={layout.contentX}
                y={layout.contentY}
                width="280"
                height="190"
                custom={index}
                variants={stepReveal}
              >
                <div className="px-2 text-center font-sans text-white">
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
    <motion.div
      className="relative z-10 mx-auto mt-14 max-w-xl md:hidden"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
      variants={staggerContainer(0.14, 0.1)}
    >
      <svg
        viewBox="0 0 486 1327"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-y-5 left-1/2 z-0 h-[calc(100%-2.5rem)] w-28 -translate-x-1/2 overflow-visible"
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
          <path d={solidLinePath} fill="#17121f" />
          <motion.path
            className="how-it-works-mobile-dashed"
            d={dashedLinePath}
            fill="#17121f"
            mask={
              reduceMotion ? undefined : "url(#mobile-how-it-works-reveal)"
            }
            style={{ pathLength: reduceMotion ? 1 : drawnPathLength }}
          />
        </g>
      </svg>

      <div className="relative z-10 space-y-12">
        {steps.map((step, index) => (
          <motion.article
            key={step.number}
            className="relative min-h-56 overflow-hidden rounded-b-3xl rounded-t-[4rem] bg-gradient-to-br from-[#8f76ec] via-[#705ae0] to-[#5537bd] px-7 pb-9 pt-20 text-center text-white shadow-[0_18px_38px_rgba(77,50,170,0.2)]"
            variants={fadeInUp}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent"
            />
            <img
              src={stepBadges[index]}
              alt=""
              aria-hidden="true"
              className="absolute left-1/2 top-3 h-[68px] w-[69px] -translate-x-1/2 drop-shadow-md"
            />
            <h3 className="text-2xl font-bold">{step.title}</h3>
            <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-white/90">
              {step.copy}
            </p>
          </motion.article>
        ))}
      </div>
    </motion.div>
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
      className="how-it-works-section bg-sparkle relative isolate w-full overflow-hidden bg-[#fffaf0] px-5 pb-28 pt-28 sm:px-8 sm:pb-32 sm:pt-32 md:aspect-[1405/911] md:px-0 md:py-0"
    >
      <img
        src={backgroundArtwork}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 block h-full w-full max-w-none object-fill"
      />
      <img
        src={topTornGradient}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] block h-16 w-full max-w-none object-fill md:h-[11.64%]"
      />
      <img
        src={bottomTornStrip}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 block h-16 w-full max-w-none object-fill md:h-[11.64%]"
      />
      <motion.img
        src={leftSticker}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-[9%] top-[23.5%] z-20 hidden w-[17.36%] max-w-none md:block"
        initial={reduceMotion ? false : { opacity: 0, x: -140, rotate: -7 }}
        animate={
          revealed
            ? { opacity: 1, x: 0, rotate: 0 }
            : { opacity: 0, x: -140, rotate: -7 }
        }
        transition={{ duration: 0.85, delay: 0.18, ease: EASE }}
      />
      <motion.img
        src={rightSticker}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-[8.4%] top-[12.5%] z-20 hidden w-[8.4%] max-w-none md:block"
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
