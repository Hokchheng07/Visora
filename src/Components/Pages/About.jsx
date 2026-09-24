import { ThemeImage } from "../../theme/ThemeImage";
import heroClouds from "../../assets/pages/about/hero/BigSpiralClouds.svg";
import angkorArtwork from "../../assets/pages/about/hero/AngkorRactangle.svg";
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
      {/* Both art layers below share the canvas box (same width, same centring)
          rather than spanning the window, so every curve they draw still lines
          up with the doodles the canvas positions against them once the window
          is wider than the canvas. They sit outside .about-canvas-shell because
          that clips overflow, which would cut the blob off at the canvas edge.

          Figma places the blob at y=0 of the frame, so it runs up behind the
          navbar. The page used to redraw the navbar's own wave here as well, so
          the Angkor could layer over it the way Figma stacks the nav group;
          that meant two copies of one asset kept in step by hand, so the wave
          is now drawn only by the real <header> and the Angkor sits behind it. */}
      <div className="about-page-art" aria-hidden="true">
        {/* .about-page's own bg-sparkle background-image can't paint above
            .about-page's own box top, so it's absent anywhere the navbar's
            wave cutout or the blob's translucency exposes the strip running
            up behind the nav — a flat, dot-less band under the header. This
            patch is its own sparkle tile reaching that same strip. See the
            longer note on .about-page-sparkle-patch in about.css. */}
        {/* Plugs the same strip with a flat fill in .about-page's own
            background color, so wherever the wave cutout or the art's own
            translucency exposes bare canvas, it reveals this instead of the
            site shell's (slightly different, near-black) default behind it —
            those two darks are close enough to read as a color seam right
            under the navbar otherwise. Sits below the sparkle patch and the
            blob/Angkor art in paint order (first child, no z-index of its
            own), so it never covers them. */}
        <div className="about-page-bg-fill" />
        <div className="about-page-sparkle-patch" />
        <ThemeImage className="about-page-blob" src={heroClouds} alt="" aria-hidden="true" />
      </div>
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
      {/* The Angkor is its own layer, after the canvas, because it has to paint
          over the hero the way Figma stacks it — and the canvas is now a
          container, so it is a stacking context that a z-index below it could
          no longer reach into. Nothing else on the canvas overlaps this corner,
          so being top-most here matches what the old z-index 2 resolved to. It
          still passes under the sticky <header>, which is what now draws the
          wave above it. */}
      <div className="about-page-angkor-layer">
        <ThemeImage
          className="about-page-angkor"
          src={angkorArtwork}
          alt="A softly illustrated view of Angkor Wat and Cambodian palm trees"
        />
      </div>
    </div>
  );
}
