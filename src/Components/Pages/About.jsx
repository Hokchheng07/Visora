import AboutHero from "../AboutPageComponents/AboutHero";
import OurStory from "../AboutPageComponents/OurStory";
import CoreValues from "../AboutPageComponents/CoreValues";
import AboutJourney from "../AboutPageComponents/AboutJourney";
import WhatIsVisora from "../AboutPageComponents/WhatIsVisora";
import DesignPresentInspire from "../AboutPageComponents/DesignPresentInspire";
import VisionMission from "../AboutPageComponents/VisionMission";
import OurMentors from "../AboutPageComponents/OurMentors";
import MeetOurMembers from "../AboutPageComponents/MeetOurMembers";
import AboutCTA from "../AboutPageComponents/AboutCTA";

export default function About() {
  return (
    <div className="about-page bg-sparkle">
      <div className="about-canvas-shell">
        <div className="about-canvas">
          <AboutJourney />
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
