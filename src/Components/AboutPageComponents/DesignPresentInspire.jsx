import { ThemeImage } from "../../theme/ThemeImage";
import { featureCards } from "./aboutData";
import { useCardSwing } from "./useCardSwing";

function FeatureCard({ feature }) {
  return (
    <div
      className={`about-feature-hanger about-feature-hanger-${feature.tone}`}
      /* Unitless on purpose: the value is a 1440-canvas measurement, and CSS
         gives it its unit per breakpoint — plain px while the cards stack,
         canvas-relative once they hang on the desktop canvas. */
      style={{ "--about-feature-offset": feature.offset }}
    >
      <ThemeImage className="about-feature-pin" src={feature.pin} alt="" aria-hidden="true" />
      {/* data-swing is the handle the Anime scope binds to — rotation happens
          here, about the pin, so the pin itself stays put. */}
      <div className="about-feature-swing" data-swing>
        <article className="about-feature-card">
          <ThemeImage className="about-feature-frame" src={feature.artwork} alt="" aria-hidden="true" />
          <div className="about-feature-copy">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function DesignPresentInspire() {
  const stageRef = useCardSwing();

  // BackForDesignPresentInspire.svg carries the "Design. Present. Inspire."
  // lettering, so there is no heading element here at all — the section takes
  // its accessible name from aria-label instead.
  return (
    <section className="about-design" aria-label="Design. Present. Inspire.">
      <div className="about-feature-stage" ref={stageRef}>
        <div className="about-feature-grid">
          {featureCards.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
