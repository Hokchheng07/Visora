import { ThemeImage } from "../../theme/ThemeImage";
import burstMarks from "../../assets/Website/AboutUs/YellowExclimationMark.svg";
import storyUnderline from "../../assets/Website/AboutUs/DashYellowUnderStory.svg";
import whatUnderline from "../../assets/Website/AboutUs/UnderlineForWhatIsVisora.svg";
import yellowSquiggle from "../../assets/Website/AboutUs/SvigalYellow.svg";
import purpleSquiggle from "../../assets/Website/AboutUs/SpigalPurple.svg";
import dashedArrow from "../../assets/Website/AboutUs/SpiralArrow(AboutUs).svg";
import rightBlobs from "../../assets/Website/AboutUs/RightDoubleBlob(Purple,Yellow).svg";
import leftBlobs from "../../assets/Website/AboutUs/LeftDoubleBlob(Purple,yellow.svg";
import designBackdrop from "../../assets/Website/AboutUs/BackForDesignPresentInspire.svg";
import pinCardBackground from "../../assets/Website/AboutUs/PinCardBackground.svg";
import pinLineTop from "../../assets/Website/AboutUs/TopLine(AboutUs).svg";
import pinLineSecond from "../../assets/Website/AboutUs/2ndLine(AboutUs).svg";
import pinLineThird from "../../assets/Website/AboutUs/ThirdLine(AboutUs).svg";
import visionLottie from "../../assets/Website/AboutUs/LottieAboveOurVision.svg";
import valueUnderline from "../../assets/Website/AboutUs/DashLineUnderValue.svg";
import doodlePlane from "../../assets/Website/AboutUs/DoodlePlane(AboutUs).svg";

/* Scatter artwork that belongs to the canvas rather than to any one section —
   most of it sits outside the section boxes it visually accompanies (the side
   blobs reach x=0 and x=1137, well past `.about-what`). Keeping it in one
   layer means every piece is positioned in the same frame coordinates the
   design uses, instead of being re-based against whichever section it is
   nearest. Positions were measured off the 1:1 Figma render, not read from
   node metadata, which misreports flipped nodes. */
export default function AboutDecor() {
  return (
    <div className="about-decor" aria-hidden="true">
      <ThemeImage className="about-decor-item about-decor-burst" src={burstMarks} alt="" />
      <ThemeImage className="about-decor-item about-decor-story-underline" src={storyUnderline} alt="" />
      <ThemeImage className="about-decor-item about-decor-what-underline" src={whatUnderline} alt="" />
      <ThemeImage className="about-decor-item about-decor-squiggle-right" src={yellowSquiggle} alt="" />
      <ThemeImage className="about-decor-item about-decor-squiggle-left" src={purpleSquiggle} alt="" />
      <ThemeImage className="about-decor-item about-decor-arrow" src={dashedArrow} alt="" />
      {/* Sits under "Values" only, so it cannot ride along in the centred
          heading flow the way the other section marks do. */}
      <ThemeImage className="about-decor-item about-decor-values-underline" src={valueUnderline} alt="" />
      {/* The plane lives here rather than inside .about-what because that
          section is a z-index 3 stacking context: anything inside it renders
          above the whole decor layer no matter what z-index it is given, so
          the plane could never sit behind the blobs from there. */}
      <ThemeImage className="about-decor-item about-decor-plane" src={doodlePlane} alt="" />
      <ThemeImage className="about-decor-item about-decor-blob-right" src={rightBlobs} alt="" />
      <ThemeImage className="about-decor-item about-decor-blob-left" src={leftBlobs} alt="" />
      <ThemeImage className="about-decor-item about-decor-pin-etch" src={pinCardBackground} alt="" />
      <ThemeImage className="about-decor-item about-decor-design-backdrop" src={designBackdrop} alt="" />
      {/* Three separate segments rather than one connector, each positioned so
          its own endpoints land on the two pins it joins. Sits above the cards
          — see the z-index note in index.css. */}
      <ThemeImage className="about-decor-item about-decor-pin-line about-decor-pin-line-top" src={pinLineTop} alt="" />
      <ThemeImage className="about-decor-item about-decor-pin-line about-decor-pin-line-second" src={pinLineSecond} alt="" />
      <ThemeImage className="about-decor-item about-decor-pin-line about-decor-pin-line-third" src={pinLineThird} alt="" />
      <ThemeImage className="about-decor-item about-decor-vision-lottie" src={visionLottie} alt="" />
      {/* The squiggle pair and the looping arrow repeat below Vision/Mission,
          closing the page the same way they opened the Core Values band. */}
      <ThemeImage className="about-decor-item about-decor-squiggle-bottom-right" src={yellowSquiggle} alt="" />
      <ThemeImage className="about-decor-item about-decor-squiggle-bottom-left" src={purpleSquiggle} alt="" />
      <ThemeImage className="about-decor-item about-decor-bottom-curl" src={dashedArrow} alt="" />
    </div>
  );
}
