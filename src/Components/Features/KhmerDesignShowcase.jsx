import { NavLink } from "react-router";
import apsara from "../../assets/Website/LandingPage/KhmerDesignShowCase/apsara.png";
import angkorWat from "../../assets/Website/LandingPage/KhmerDesignShowCase/ankorwat.png";
import topLeft from "../../assets/Website/LandingPage/KhmerDesignShowCase/TopLeftCorner.svg";
import topRight from "../../assets/Website/LandingPage/KhmerDesignShowCase/TopRightCorner.svg";
import bottomLeft from "../../assets/Website/LandingPage/KhmerDesignShowCase/BottomLeftCorner.svg";
import bottomRight from "../../assets/Website/LandingPage/KhmerDesignShowCase/RightLeftCorner.svg";
import ornament from "../../assets/Website/LandingPage/KhmerDesignShowCase/MiddleSection.svg";
import TemplateCard from "../Templates/TemplateCard";
import { templateCards } from "../Templates/templateData";

export default function KhmerDesignShowcase() {
  return (
    <section className="khmer-showcase bg-sparkle">
      <div className="khmer-showcase-art" aria-hidden="true">
        <img src={apsara} className="khmer-showcase-apsara" alt="" />
        <img src={angkorWat} className="khmer-showcase-angkor" alt="" />
        <img src={topLeft} className="khmer-showcase-corner khmer-showcase-corner-tl" alt="" />
        <img src={topRight} className="khmer-showcase-corner khmer-showcase-corner-tr" alt="" />
        <img src={bottomLeft} className="khmer-showcase-corner khmer-showcase-corner-bl" alt="" />
        <img src={bottomRight} className="khmer-showcase-corner khmer-showcase-corner-br" alt="" />
      </div>
      <div className="khmer-showcase-content">
        <h2>Khmer Design <span>Showcase</span></h2>
        <div className="khmer-showcase-ornament-wrap" aria-hidden="true">
          <img src={ornament} className="khmer-showcase-ornament" alt="" />
        </div>
        <div className="khmer-showcase-body">
          <div className="khmer-showcase-cards">
            {templateCards.map((template, index) => (
              <TemplateCard key={`${template.title}-${index}`} template={template} index={index} />
            ))}
          </div>
          <NavLink to="/templates" className="khmer-showcase-button">More Templates <span>→</span></NavLink>
          <p className="khmer-showcase-tagline">Celebrate every event with designs inspired by Cambodian culture.</p>
        </div>
      </div>
    </section>
  );
}
