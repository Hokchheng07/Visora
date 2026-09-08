import { ThemeImage } from "../../theme/ThemeImage";
import heroClouds from "../../assets/Website/AboutUs/BigSpiralClouds.svg";
import navWave from "../../assets/Website/Nav/NavbarBg.svg";
import angkorArtwork from "../../assets/Website/AboutUs/AngkorRactangle.svg";
import AboutHero from "../AboutPageComponents/AboutHero";
import OurStory from "../AboutPageComponents/OurStory";
import CoreValues from "../AboutPageComponents/CoreValues";
import AboutJourney from "../AboutPageComponents/AboutJourney";
import AboutDecor from "../AboutPageComponents/AboutDecor";
import WhatIsVisora from "../AboutPageComponents/WhatIsVisora";
import DesignPresentInspire from "../AboutPageComponents/DesignPresentInspire";
import VisionMission from "../AboutPageComponents/VisionMission";
import OurMentors from "../AboutPageComponents/OurMentors";
import MeetOurMembers from "../AboutPageComponents/MeetOurMembers";
import AboutCTA from "../AboutPageComponents/AboutCTA";

export default function About() {
  return (
    <div className="about-page bg-sparkle">
      {/* Figma places this blob at y=0 of the frame, so it runs up behind the
          navbar. It lives outside .about-canvas-shell because that clips
          overflow, which would cut its top off at the canvas edge. */}
      <ThemeImage className="about-page-blob" src={heroClouds} alt="" aria-hidden="true" />
      {/* Figma's nav group, rebuilt at page level so the Angkor can sit on top
          of the wave as designed — the real <header> is background-less here
          while at the top and keeps only the logo and links above all this. */}
      <ThemeImage className="about-page-navwave" src={navWave} alt="" aria-hidden="true" />
      <ThemeImage
        className="about-page-angkor"
        src={angkorArtwork}
        alt="A softly illustrated view of Angkor Wat and Cambodian palm trees"
      />
      <div className="about-canvas-shell">
        <div className="about-canvas">
          <AboutJourney />
          <AboutDecor />
          <AboutHero />
          <OurStory />
          <CoreValues />
          <WhatIsVisora />
          <DesignPresentInspire />
          <VisionMission />
          <OurMentors />
          <MeetOurMembers />
          <AboutCTA />
        </div>
      </div>
    </div>
  );
}
