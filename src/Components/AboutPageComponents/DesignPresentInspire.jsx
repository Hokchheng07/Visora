import { useEffect, useState } from "react";
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
            <h3><span>{feature.titleAccent}</span>{feature.titleRest}</h3>
            <p>{feature.description}</p>
          </div>
        </article>
      </div>
    </div>
  );
}

// Where the needle head sits inside each pin export (56 x 63), as fractions.
const PIN_HEAD = { x: 0.55, y: 0.32 };
const round = (value) => Math.round(value * 10) / 10;

/* One clothesline segment between two pin heads: a cubic that sags below the
   lower pin, the same shape the old per-segment exports drew. */
function segmentPath(from, to) {
  const dx = to.x - from.x;
  const length = Math.hypot(dx, to.y - from.y) || 1;
  // Steep segments hang less, so they bow instead of hooking under the pin.
  const sag = Math.min(70, Math.max(24, length * 0.22)) * (Math.abs(dx) / length);
  const controlY = Math.max(from.y, to.y) + sag;
  return `M ${round(from.x)} ${round(from.y)} C ${round(from.x + dx * 0.3)} ${round(controlY)}, ${round(to.x - dx * 0.3)} ${round(controlY)}, ${round(to.x)} ${round(to.y)}`;
}

/* The connectors used to be three fixed images on the page canvas, positioned
   by a percentage of the whole page's height. The cards are placed a different
   way, so the two drifted apart at any width but the design's. Measuring the
   pins and drawing between them keeps every segment on its pins. Pins never
   swing (only the card below rotates), so layout changes are all that matter. */
function PinConnector({ stageRef }) {
  const [line, setLine] = useState({ d: "", width: 0, height: 0 });

  // useEffect, not useLayoutEffect: a child's layout effect runs before its
  // parent element's ref is attached, so stageRef would still be null there.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const measure = () => {
      const box = stage.getBoundingClientRect();
      const heads = [...stage.querySelectorAll(".about-feature-pin")].map((pin) => {
        const r = pin.getBoundingClientRect();
        return { x: r.left - box.left + r.width * PIN_HEAD.x, y: r.top - box.top + r.height * PIN_HEAD.y };
      });
      const d = heads.slice(1).map((head, index) => segmentPath(heads[index], head)).join(" ");
      setLine((current) => (current.d === d && current.width === box.width && current.height === box.height
        ? current
        : { d, width: box.width, height: box.height }));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    stage.querySelectorAll(".about-feature-pin").forEach((pin) => observer.observe(pin));
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stageRef]);

  if (!line.d) return null;
  return (
    <svg
      className="about-pin-connector"
      width={line.width}
      height={line.height}
      viewBox={`0 0 ${line.width} ${line.height}`}
      fill="none"
      aria-hidden="true"
    >
      <path d={line.d} stroke="var(--about-pin-line)" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" />
    </svg>
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
        <PinConnector stageRef={stageRef} />
        <div className="about-feature-grid">
          {featureCards.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
