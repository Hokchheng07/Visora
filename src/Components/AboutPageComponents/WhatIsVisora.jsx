import { motion, useReducedMotion } from "motion/react";
import { Layers, MousePointer2, PenTool } from "lucide-react";
import { fadeInUp, viewportOnce } from "../../lib/animations/animations";

export default function WhatIsVisora() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="about-what"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
      variants={fadeInUp}
      aria-labelledby="what-is-visora-title"
    >
      {/* The paired side blobs and the doodle plane moved to AboutDecor —
          the blobs sit at x=0 and x=1137, outside this section's box, and the
          plane has to be outside this section's stacking context to render
          behind them. */}
      <div className="about-what-copy">
        <div className="about-what-visual" aria-hidden="true">
          <span className="about-what-orbit" />
          <div className="about-what-canvas">
            <span className="about-what-canvas-toolbar"><i /><i /><i /></span>
            <span className="about-what-canvas-scene">
              <span className="about-what-canvas-sun" />
              <span className="about-what-canvas-hill" />
            </span>
          </div>
          <span className="about-what-tool about-what-tool-pen"><PenTool /></span>
          <span className="about-what-tool about-what-tool-layers"><Layers /></span>
          <MousePointer2 className="about-what-pointer" />
          <span className="about-what-visual-spark" />
        </div>
        <p className="about-what-label">Create your way</p>
        <h2 id="what-is-visora-title">What is <span>Visora?</span></h2>
        <p>
          Visora is a creative platform that combines the simplicity of Canva with
          the power of PowerPoint. Create stunning backdrops, custom slides, and
          engaging presentations in just a few clicks.
        </p>
      </div>
    </motion.section>
  );
}
