import { ThemeImage } from "../../theme/ThemeImage";
import journeyGlow from "../../assets/pages/about/journey/BigMiddleLinear.svg";
import journeySolidPath from "../../assets/pages/about/journey/BigMiddleSolidLine.svg";
import journeyDashedPath from "../../assets/pages/about/journey/BigMiddleDashLine.svg";

export default function AboutJourney() {
  return (
    <div className="about-journey" aria-hidden="true">
      <ThemeImage className="about-journey-glow" src={journeyGlow} alt="" />
      <ThemeImage className="about-journey-path about-journey-path-solid" src={journeySolidPath} alt="" />
      <ThemeImage className="about-journey-path about-journey-path-dashed" src={journeyDashedPath} alt="" />
    </div>
  );
}
