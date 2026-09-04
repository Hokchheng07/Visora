import { motion } from "motion/react";
import {
  fadeIn,
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from "../../../lib/animations/animations";
import YellowBlob from "../../../assets/Website/LandingPage/CreateWithoutLimits/YellowBlob.svg";
import PurpleBlob from "../../../assets/Website/LandingPage/CreateWithoutLimits/PurpleBlob.svg";
import withoutLimitsArrow from "../../../assets/Website/LandingPage/CreateWithoutLimits/WithoutLimitsArrow.svg";
import withoutLimitsScissors from "../../../assets/Website/LandingPage/CreateWithoutLimits/WithoutLimitsScissors.svg";
import bigArrowAndScissors from "../../../assets/Website/LandingPage/CreateWithoutLimits/BigArrowAndScissors.svg";
import yellowCard from "../../../assets/Website/LandingPage/CreateWithoutLimits/YellowCardBlob(WithoutLimits).svg";
import purpleCard from "../../../assets/Website/LandingPage/CreateWithoutLimits/PurpleCard(WithoutLimits).svg";
import softGreenCard from "../../../assets/Website/LandingPage/CreateWithoutLimits/SoftGreenCard(WithoutLimits).svg";
import softRedCard from "../../../assets/Website/LandingPage/CreateWithoutLimits/SoftRedCard(WithoutLimits).svg";
import magentaCard from "../../../assets/Website/LandingPage/CreateWithoutLimits/MajenticCard(WithoutLimits).svg";
import cyanCard from "../../../assets/Website/LandingPage/CreateWithoutLimits/CyanCard(WithoutLimits).svg.svg";

const completeCardAssets = [
  yellowCard,
  purpleCard,
  softGreenCard,
  softRedCard,
  magentaCard,
  cyanCard,
];

const features = [
  {
    title: "Customize Everything",
    copy: "Change colors, fonts, images, logos, backgrounds, and effects to make every backdrop uniquely yours.",
    color: "#F8DFA1",
    shape: 0,
  },
  {
    title: "Event Timer",
    copy: "Add beautiful countdown timers to build excitement for your upcoming events.",
    color: "#DFA9F2",
    shape: 1,
  },
  {
    title: "Khmer Elements",
    copy: "Add Cambodian-inspired patterns, traditional decorations, Angkor designs, and Khmer fonts to your backdrop.",
    color: "#C7B7F1",
    shape: 2,
  },
  {
    title: "Drag & Drop",
    copy: "Easily add, move, resize, and arrange elements directly on your canvas.",
    color: "#F5BFC5",
    shape: 3,
  },
  {
    title: "Layer Management",
    copy: "Keep your design organized with simple controls to move, lock, hide, and arrange every element.",
    color: "#BDF0C8",
    shape: 4,
  },
  {
    title: "Display Ready",
    copy: "Preview and display your designs perfectly on TVs, projectors, LED screens, and large displays.",
    color: "#A9DFEC",
    shape: 5,
  },
];

function FeatureShape({ shape }) {
  return (
    <img
      src={completeCardAssets[shape]}
      alt=""
      aria-hidden="true"
      className="create-limits-complete-card"
    />
  );
}

function FeatureCard({ title, copy, shape }) {
  return (
    <motion.article
      className="create-limits-card"
      variants={fadeInUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <FeatureShape shape={shape} />
      <div className="sr-only">
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
    </motion.article>
  );
}

export default function CreateWithoutLimits() {
  return (
    <section className="create-limits-section bg-sparkle relative isolate overflow-hidden">
      <div className="create-limits-corners" aria-hidden="true">
        <img src={YellowBlob} alt="" className="create-limits-yellow-art" />
        <img src={PurpleBlob} alt="" className="create-limits-purple-art" />
      </div>
      <motion.div
        className="create-limits-transition-arrow"
        aria-hidden="true"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeIn}
      >
        <img src={bigArrowAndScissors} alt="" />
      </motion.div>
      <div className="relative z-10 mx-auto max-w-[1920px] px-5 pb-24 pt-32 sm:px-8 sm:pb-32 sm:pt-44 lg:px-10 lg:pb-44 lg:pt-56">
        <motion.header
          className="create-limits-header"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeInUp}
        >
          <h2>
            Create without <span>Limits</span>
          </h2>
          <div className="create-limits-underline" aria-hidden="true">
            <img src={withoutLimitsArrow} alt="" />
            <img src={withoutLimitsScissors} alt="" />
          </div>
          <p>
            Bring your ideas to life with powerful, easy-to-use tools designed
            for beautiful event backdrops.
          </p>
        </motion.header>
        <motion.div
          className="create-limits-grid"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer(0.12, 0.15)}
        >
          {features.map(({ title, copy, color, shape }) => (
            <FeatureCard
              key={title}
              title={title}
              copy={copy}
              color={color}
              shape={shape}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
