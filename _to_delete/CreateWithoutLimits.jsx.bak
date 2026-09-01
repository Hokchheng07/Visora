import { motion } from "motion/react";
import { fadeInUp, staggerContainer, viewportOnce } from "../../lib/animations";
import YellowBlob from "../../assets/Website/LandingPage/CreateWithoutLimits/YellowBlob.svg";
import PurpleBlob from "../../assets/Website/LandingPage/CreateWithoutLimits/PurpleBlob.svg";
import withoutLimitsArrow from "../../assets/Website/LandingPage/CreateWithoutLimits/WithoutLimitsArrow.svg";
import withoutLimitsScissors from "../../assets/Website/LandingPage/CreateWithoutLimits/WithoutLimitsScissors.svg";
import firstCardSolid from "../../assets/Website/LandingPage/1stCard/SolidVector.svg";
import firstCardInner from "../../assets/Website/LandingPage/1stCard/InnerColor.svg";
import firstCardDashed from "../../assets/Website/LandingPage/1stCard/dashedVector.svg";
import firstCardPreview from "../../assets/Website/LandingPage/1stCard/image 46.png";
import secondCardSolid from "../../assets/Website/LandingPage/2ndCard/SolidVector.svg";
import secondCardInner from "../../assets/Website/LandingPage/2ndCard/InnerColor.svg";
import secondCardDashed from "../../assets/Website/LandingPage/2ndCard/DashedVector.svg";
import secondCardPreview from "../../assets/Website/LandingPage/2ndCard/2ndCard.png";
import thirdCardSolid from "../../assets/Website/LandingPage/3rdCard/SolidVector.svg";
import thirdCardInner from "../../assets/Website/LandingPage/3rdCard/InnerColor.svg";
import thirdCardDashed from "../../assets/Website/LandingPage/3rdCard/DashedVector.svg";
import thirdCardPreview from "../../assets/Website/LandingPage/3rdCard/3rdCard.png";
import fourthCardSolid from "../../assets/Website/LandingPage/4ndCard/SolidVector.svg";
import fourthCardInner from "../../assets/Website/LandingPage/4ndCard/InnerColor.svg";
import fourthCardDashed from "../../assets/Website/LandingPage/4ndCard/DashedVector.svg";
import fourthCardPreview from "../../assets/Website/LandingPage/4ndCard/4rdCard.png";
import fifthCardSolid from "../../assets/Website/LandingPage/5ndCard/SolidVector.svg";
import fifthCardInner from "../../assets/Website/LandingPage/5ndCard/InnerColor.svg";
import fifthCardDashed from "../../assets/Website/LandingPage/5ndCard/DashedVector.svg";
import fifthCardPreview from "../../assets/Website/LandingPage/5ndCard/5ndCard.svg";
import sixthCardSolid from "../../assets/Website/LandingPage/6ndCard/SolidVector.svg";
import sixthCardInner from "../../assets/Website/LandingPage/6ndCard/InnerColor.svg";
import sixthCardDashed from "../../assets/Website/LandingPage/6ndCard/DashedVector.svg";
import sixthCardPreview from "../../assets/Website/LandingPage/6ndCard/image 67.png";

const layeredCardAssets = [
  { solid: firstCardSolid, inner: firstCardInner, dashed: firstCardDashed, preview: firstCardPreview },
  { solid: secondCardSolid, inner: secondCardInner, dashed: secondCardDashed, preview: secondCardPreview },
  { solid: thirdCardSolid, inner: thirdCardInner, dashed: thirdCardDashed, preview: thirdCardPreview },
  { solid: fourthCardSolid, inner: fourthCardInner, dashed: fourthCardDashed, preview: fourthCardPreview },
  { solid: fifthCardSolid, inner: fifthCardInner, dashed: fifthCardDashed, preview: fifthCardPreview },
  { solid: sixthCardSolid, inner: sixthCardInner, dashed: sixthCardDashed, preview: sixthCardPreview },
];

const features = [
  { title: "Customize Everything", copy: "Change colors, fonts, images, logos, backgrounds, and effects to make every backdrop uniquely yours.", color: "#F8DFA1", shape: 0 },
  { title: "Event Timer", copy: "Add beautiful countdown timers to build excitement for your upcoming events.", color: "#DFA9F2", shape: 1 },
  { title: "Khmer Elements", copy: "Add Cambodian-inspired patterns, traditional decorations, Angkor designs, and Khmer fonts to your backdrop.", color: "#C7B7F1", shape: 2 },
  { title: "Drag & Drop", copy: "Easily add, move, resize, and arrange elements directly on your canvas.", color: "#F5BFC5", shape: 3 },
  { title: "Layer Management", copy: "Keep your design organized with simple controls to move, lock, hide, and arrange every element.", color: "#BDF0C8", shape: 4 },
  { title: "Display Ready", copy: "Preview and display your designs perfectly on TVs, projectors, LED screens, and large displays.", color: "#A9DFEC", shape: 5 },
];

const cardShapes = [
  {
    fill: "M39 49C74 17 123 35 158 29c43-8 77-1 101 28 28 34 19 69 10 97-11 34 14 67-16 89-28 21-68 7-103 11-40 5-78 20-107-6-30-26-18-67-22-103-4-39-11-70 18-96Z",
    outline: "M35 43C70 12 123 29 159 25c43-7 82 1 103 34 22 34 11 69 6 98-6 31 18 62-11 88-29 25-68 8-105 14-39 6-83 17-112-12-27-28-13-67-20-103-7-39-16-70 15-101Z",
    dashed: "M29 49C62 21 111 14 151 31c35 15 65-7 99 10 38 19 35 57 29 88-7 39 27 64 5 96-23 34-70 18-105 28-39 11-73 27-108 4-34-23-15-65-25-101-10-36-48-75-17-107Z",
  },
  {
    fill: "M33 56C62 22 111 28 147 34c39 7 83-8 108 24 26 33 8 68 13 101 6 39 31 72 2 99-28 26-67 4-104 12-42 9-87 8-112-24-25-32-6-70-26-101-18-28-18-61 5-89Z",
    outline: "M28 48C56 15 108 21 147 28c46 8 83-10 112 23 29 34 10 72 15 105 6 39 33 77 1 104-30 25-68 2-107 11-44 10-91 8-118-25-26-33-7-72-27-105-18-29-20-65 5-93Z",
    dashed: "M42 39C77 12 116 30 153 26c42-5 80 9 96 42 17 36-8 65 8 99 17 37 21 72-11 94-31 21-69 3-106 17-39 15-79 3-101-30-22-34-2-65-19-99-16-32-8-97 22-123Z",
  },
  {
    fill: "M48 31C84 11 121 30 158 26c41-4 79 4 101 37 24 36 1 65 10 99 10 39 36 66 12 96-25 31-69 15-103 16-40 1-79 17-108-13-29-30-14-67-20-101-7-38-35-103-2-129Z",
    outline: "M42 27C80 4 119 23 158 20c44-4 85 5 108 40 25 38 2 70 12 104 11 39 39 70 13 102-27 33-72 17-110 18-42 2-83 19-113-14-30-32-14-71-21-107-7-40-36-111-5-136Z",
    dashed: "M26 62C53 29 92 31 129 38c42 8 74-20 111 0 37 20 39 57 27 90-13 36 22 74-7 101-28 26-68 10-103 18-40 9-86 7-108-27-22-33 0-64-19-98-16-29-23-57-4-84Z",
  },
  {
    fill: "M30 43C64 15 105 27 140 29c40 2 82-5 106 29 25 35 4 67 14 100 12 39 18 78-14 97-32 19-69-1-105 12-39 14-80 3-101-29-21-32-1-67-17-99-15-30-11-83 7-110Z",
    outline: "M25 37C60 7 103 20 140 22c43 2 86-7 113 29 27 37 6 72 17 108 12 41 19 83-16 104-35 20-73 0-111 14-42 15-85 3-108-32-22-35-2-72-18-106-15-32-13-88 8-116Z",
    dashed: "M46 28C81 8 113 34 151 30c41-4 78 4 96 36 19 34-1 66 13 99 15 35 5 73-27 89-32 16-66-4-100 11-38 17-76 4-96-28-20-32-1-66-14-96-13-31-54-88-23-111Z",
  },
  {
    fill: "M43 38C72 16 115 24 149 34c39 11 83-6 106 27 23 33 4 69 7 103 4 38 28 72-4 96-31 24-68 5-105 10-42 6-80 17-107-15-27-31-10-68-17-101-7-35-10-93 14-120Z",
    outline: "M37 32C67 7 113 16 149 27c42 12 87-7 112 28 25 35 6 74 9 110 4 40 30 77-5 103-34 26-72 6-111 12-45 6-84 18-113-16-29-34-11-73-18-108-7-38-10-99 14-124Z",
    dashed: "M25 56C56 22 100 35 137 31c42-4 75 9 102 39 28 31 12 65 22 99 10 37 3 70-29 88-31 17-68-4-101 13-38 19-78 4-98-29-20-32-4-67-20-99-15-31-5-86 10-111Z",
  },
  {
    fill: "M35 51C65 19 104 30 140 25c40-6 81 9 101 42 21 34-3 65 9 98 13 37 37 69 7 98-30 28-69 11-105 15-41 4-79 15-106-17-27-31-9-69-18-101-10-36-11-88 12-135Z",
    outline: "M29 45C60 10 102 22 140 18c44-6 85 10 107 45 22 36-2 70 11 105 14 39 39 74 7 105-32 30-73 12-111 16-44 5-84 16-113-18-29-34-10-74-20-108-10-39-11-94 12-145Z",
    dashed: "M42 30C74 5 112 26 149 33c40 8 78-8 101 24 23 33 3 67 18 99 16 35 13 72-20 94-33 21-69 1-105 17-39 17-80 0-99-34-19-33 2-67-12-99-14-31-8-79 18-101Z",
  },
];

function FeatureShape({ color, shape }) {
  const assets = layeredCardAssets[shape];
  if (assets) {
    return (
      <div className="create-limits-first-shape" aria-hidden="true">
        <img src={assets.solid} alt="" className="create-limits-first-solid" />
        <img src={assets.inner} alt="" className="create-limits-first-inner" />
        <img src={assets.dashed} alt="" className="create-limits-first-dashed" />
      </div>
    );
  }
  const paths = cardShapes[shape];
  return (
    <svg aria-hidden="true" className="create-limits-card-shape" viewBox="0 0 452.32 436.07">
      <g transform="translate(22.616 21.804) scale(.9)">
        <g transform="translate(50 58) rotate(24.1 176.16 160.065)">
          <path className="create-limits-card-fill" style={{ fill: color }} d={paths.fill} transform="scale(1.101 1.186)" />
        </g>
        <g transform="translate(60.09 60.8) scale(1.053125 1.192593)">
          <path className="create-limits-card-outline" d={paths.outline} />
        </g>
        <g transform="translate(44.09 48.8) scale(1.15 1.274074)">
          <path className="create-limits-card-dashed" d={paths.dashed} />
        </g>
      </g>
    </svg>
  );
}

function FeatureCard({ title, copy, color, shape }) {
  return (
    <motion.article className="create-limits-card" variants={fadeInUp} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
      <FeatureShape color={color} shape={shape} />
      <div className="create-limits-card-content">
        <img src={layeredCardAssets[shape].preview} alt="" aria-hidden="true" className="create-limits-first-preview" />
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
      <div className="relative z-10 mx-auto max-w-[1920px] px-5 pb-24 pt-32 sm:px-8 sm:pb-32 sm:pt-44 lg:px-10 lg:pb-44 lg:pt-56">
        <motion.header className="create-limits-header" initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeInUp}>
          <h2>Create without <span>Limits</span></h2>
          <div className="create-limits-underline" aria-hidden="true">
            <img src={withoutLimitsArrow} alt="" />
            <img src={withoutLimitsScissors} alt="" />
          </div>
          <p>Bring your ideas to life with powerful, easy-to-use tools designed for beautiful event backdrops.</p>
        </motion.header>
        <motion.div className="create-limits-grid" initial="hidden" whileInView="show" viewport={viewportOnce} variants={staggerContainer(0.12, 0.15)}>
          {features.map(({ title, copy, color, shape }) => <FeatureCard key={title} title={title} copy={copy} color={color} shape={shape} />)}
        </motion.div>
      </div>
    </section>
  );
}
