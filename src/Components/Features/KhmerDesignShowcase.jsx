import { NavLink } from "react-router";
import Graduation from "../../assets/Website/LandingPage/KhmerDesignShowCase/Graduation1.png";
import Festival from "../../assets/Website/LandingPage/KhmerDesignShowCase/KhmerFestival.png";
import Heritage from "../../assets/Website/LandingPage/KhmerDesignShowCase/KhmerHeritage.png";
import apsara from "../../assets/Website/LandingPage/KhmerDesignShowCase/apsara.png";
import angkorWat from "../../assets/Website/LandingPage/KhmerDesignShowCase/ankorwat.png";
import topLeft from "../../assets/Website/LandingPage/KhmerDesignShowCase/TopLeftCorner.svg";
import topRight from "../../assets/Website/LandingPage/KhmerDesignShowCase/TopRightCorner.svg";
import bottomLeft from "../../assets/Website/LandingPage/KhmerDesignShowCase/BottomLeftCorner.svg";
import bottomRight from "../../assets/Website/LandingPage/KhmerDesignShowCase/RightLeftCorner.svg";
import ornament from "../../assets/Website/LandingPage/KhmerDesignShowCase/MiddleSection.svg";
import frameOne from "../../assets/Website/LandingPage/KhmerDesignShowCase/1stFrame.svg";
import frameTwo from "../../assets/Website/LandingPage/KhmerDesignShowCase/2ndFrame.svg";
import frameThree from "../../assets/Website/LandingPage/KhmerDesignShowCase/3rdFrame.svg";

const templates = [[Graduation, frameOne], [Festival, frameTwo], [Heritage, frameThree]];

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
            {templates.map(([template, frame], index) => (
              <div className="khmer-showcase-card" key={index}>
                <img src={template} alt={`Khmer template ${index + 1}`} />
                <img src={frame} className="khmer-showcase-card-frame" alt="" aria-hidden="true" />
              </div>
            ))}
          </div>
          <NavLink to="/templates" className="khmer-showcase-button">More Templates <span>→</span></NavLink>
          <p>Celebrate every event with designs inspired by Cambodian culture.</p>
        </div>
      </div>
    </section>
  );
}
