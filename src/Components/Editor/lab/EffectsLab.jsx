import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import EditorEffectDefs from "../EditorEffectDefs.jsx";
import { filterId, normalizeEffects } from "../effectsFilter.js";
import { elementStyle } from "../elementGeometry.js";
import { nodesToD, presetVector } from "../vectorPath.js";
import EffectsBench from "./EffectsBench.jsx";
import "./effectsLab.css";

/*
 * Phase 0 proof page — development only (/editor-lab).
 *
 * Draws the planned effect filters and point-data shapes on the three kinds of
 * surface the editor has (canvas, page thumbnail, display mode) so they can be
 * compared by eye in each browser, and runs the stress test from the plan.
 * Nothing here ships: the route only exists when import.meta.env.DEV is true.
 */

const drop = (o = {}) => ({ type: "DROP_SHADOW", visible: true, x: 0, y: 14, blur: 28, spread: 0, color: "#1B1530", opacity: 0.3, ...o });
const inner = (o = {}) => ({ type: "INNER_SHADOW", visible: true, x: 0, y: 12, blur: 20, spread: 0, color: "#2A1F55", opacity: 0.45, ...o });

const SCENE = [
  { id: "title", type: "text", content: "Graduation Ceremony", x: 160, y: 60, w: 1600, h: 220, rotation: 0,
    fontSize: 150, fill: "#705AE0", stroke: "#FFFFFF", strokeWidth: 6, effects: [drop({ y: 16, blur: 30 })] },
  { id: "square", type: "shape", shape: "square", x: 110, y: 350, w: 300, h: 300, rotation: 0, fill: "#AD8DEA",
    effects: [drop({ y: 24, blur: 40 }), inner({ y: 18, blur: 24 })] },
  { id: "circle", type: "shape", shape: "circle", x: 470, y: 350, w: 300, h: 300, rotation: 0, fill: "#FFC21C",
    effects: [inner({ x: -16, y: -16, blur: 30, opacity: 0.5 })] },
  { id: "pill", type: "shape", shape: "pill", x: 830, y: 390, w: 480, h: 220, rotation: 0, fill: "#DA4EC9",
    effects: [drop({ spread: 12, blur: 16, opacity: 0.25 })] },
  { id: "star", type: "shape", shape: "star", x: 1370, y: 320, w: 360, h: 360, rotation: 20, fill: "#2F7A55",
    effects: [drop({ x: 30, y: 30, blur: 10, opacity: 0.35 })] },
  { id: "heart", type: "shape", shape: "heart", x: 110, y: 720, w: 330, h: 300, rotation: 0, fill: "#C4443E",
    stroke: "#211D29", strokeWidth: 8, effects: [drop({ y: 20, blur: 30 }), inner({ y: -14, blur: 18, color: "#FFFFFF", opacity: 0.5 })] },
  { id: "thin", type: "shape", shape: "square", x: 520, y: 880, w: 1100, h: 70, rotation: 0, fill: "#705AE0",
    effects: [drop({ y: 60, blur: 60, opacity: 0.35 })] },
  { id: "tall", type: "shape", shape: "pill", x: 1790, y: 300, w: 90, h: 700, rotation: 0, fill: "#FFFFFF",
    stroke: "#705AE0", strokeWidth: 10, effects: [drop({ x: -20, y: 0, blur: 24 })] },
];

const STROKE_TEST = [
  { id: "stroke-wide", type: "shape", shape: "pill", x: 120, y: 160, w: 1400, h: 200, rotation: 0, fill: "#EFECFB", stroke: "#705AE0", strokeWidth: 12, effects: [] },
  { id: "stroke-tall", type: "shape", shape: "circle", x: 1620, y: 100, w: 180, h: 880, rotation: 0, fill: "#EFECFB", stroke: "#705AE0", strokeWidth: 12, effects: [] },
  { id: "stroke-text", type: "text", content: "Outline", x: 120, y: 520, w: 1400, h: 400, rotation: 0, fontSize: 300, fill: "#FFC21C", stroke: "#211D29", strokeWidth: 10, effects: [], fontFamily: "Freehand" },
];

const usesFilterOutline = (element, outlineMode) => element.type === "text" && outlineMode === "filter" && element.strokeWidth > 0;
const hasFilter = (element, outlineMode) => usesFilterOutline(element, outlineMode) || normalizeEffects(element.effects).some((effect) => effect.visible);
const cqw = (px) => `${px / 19.2}cqw`;
// ?stress=1, ?pulse=1, ?outline=filter and ?bench=1 set the page up without clicking, for checking other browsers.
const query = () => new URLSearchParams(window.location.search);

function Art({ element, strokeMode, outlineMode }) {
  if (element.type === "text") {
    const outline = element.strokeWidth && outlineMode !== "filter" ? { WebkitTextStroke: `${cqw(element.strokeWidth * 2)} ${element.stroke}`, paintOrder: "stroke fill" } : {};
    return (
      <span className="lab-text" style={{ color: element.fill, fontSize: cqw(element.fontSize), fontFamily: element.fontFamily || "Poppins", ...outline }}>
        {element.content}
      </span>
    );
  }
  const d = nodesToD(presetVector(element.shape, element.w, element.h));
  const scaling = strokeMode !== "user-units";
  return (
    <svg className="lab-shape" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill={element.fill} fillRule="nonzero"
        stroke={element.strokeWidth ? element.stroke : "none"}
        vectorEffect={scaling ? "non-scaling-stroke" : undefined}
        style={scaling ? { strokeWidth: cqw(element.strokeWidth || 0) } : { strokeWidth: (element.strokeWidth || 0) / 19.2 }} />
    </svg>
  );
}

/* The Phase 0 benchmark's main finding: an element with effects must sit on its
   own compositor layer, or every frame that moves or animates anything nearby
   re-runs its filter. ?layers=0 turns this off to see the difference. */
function LabElement({ element, strokeMode, outlineMode }) {
  const layered = hasFilter(element, outlineMode) && query().get("layers") !== "0";
  return (
    <div className="lab-element" style={{ ...elementStyle(element), rotate: `${element.rotation || 0}deg`, ...(layered ? { willChange: "transform" } : {}) }}>
      <div className="lab-effects" style={hasFilter(element, outlineMode) ? { filter: `url(#${filterId(element.id)})` } : undefined}>
        <Art element={element} strokeMode={strokeMode} outlineMode={outlineMode} />
      </div>
    </div>
  );
}

function Surface({ elements, className = "", strokeMode, outlineMode, label, surfaceRef }) {
  return (
    <figure className={`lab-figure ${className}`}>
      <div ref={surfaceRef} className="lab-surface">
        {elements.map((element) => <LabElement key={element.id} element={element} strokeMode={strokeMode} outlineMode={outlineMode} />)}
      </div>
      {label && <figcaption>{label}</figcaption>}
    </figure>
  );
}

const defsFor = (elements, outlineMode) => elements.map((element) => ({
  id: element.id, w: element.w, h: element.h, effects: element.effects, extra: element.strokeWidth || 0,
  outline: usesFilterOutline(element, outlineMode) ? { color: element.stroke, width: element.strokeWidth } : null,
}));

function browserName() {
  const ua = navigator.userAgent;
  if (/OPR\/|OPX\/|Opera/.test(ua)) return "Opera";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Unknown browser";
}

/* 30 elements × 4 effects, moved every frame through React state the way a
   drag moves them through Redux, drawn on the canvas and three thumbnails. */
function stressElements(time) {
  const shapes = ["square", "circle", "pill", "star", "heart"];
  return Array.from({ length: 30 }, (_, index) => {
    const column = index % 6, row = Math.floor(index / 6);
    const phase = time / 600 + index;
    const isText = index % 5 === 4;
    return {
      id: `stress-${index}`, type: isText ? "text" : "shape", shape: shapes[index % 5], content: "Aa",
      x: 80 + column * 300 + Math.sin(phase) * 40, y: 40 + row * 200 + Math.cos(phase) * 30,
      w: isText ? 240 : 180, h: 160, rotation: (index * 17) % 45, fontSize: 120,
      fill: ["#705AE0", "#FFC21C", "#DA4EC9", "#2F7A55", "#AD8DEA"][index % 5],
      effects: [drop({ y: 12, blur: 24 }), drop({ x: 10, y: 30, blur: 50, opacity: 0.15 }), inner({ y: 8, blur: 12 }), inner({ y: -6, blur: 10, color: "#FFFFFF", opacity: 0.4 })],
    };
  });
}


function StressTest() {
  const [running, setRunning] = useState(() => query().get("stress") === "1");
  const [pulse, setPulse] = useState(() => query().get("pulse") === "1");
  const [time, setTime] = useState(0);
  const [fps, setFps] = useState(null);
  const stageRef = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    let frame, frames = 0, worst = Infinity, last = performance.now(), windowStart = last;
    const tick = (now) => {
      frames++;
      const gap = now - last; last = now;
      worst = Math.min(worst, 1000 / Math.max(gap, 1));
      if (now - windowStart >= 1000) {
        setFps({ average: Math.round(frames * 1000 / (now - windowStart)), worst: Math.round(worst) });
        frames = 0; worst = Infinity; windowStart = now;
      }
      setTime(now);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  useEffect(() => {
    if (!pulse || !stageRef.current) return undefined;
    const animation = animate(stageRef.current.querySelectorAll(query().get("layers") === "0" ? ".lab-effects" : ".lab-element"), {
      scale: [1, 1.035], alternate: true, loop: true, duration: 1400, ease: "inOutSine",
    });
    return () => animation.revert();
  }, [pulse, running]);

  const elements = stressElements(time);
  return (
    <section className="lab-section">
      <h2>Stress test · 30 elements × 4 effects</h2>
      <p>Moves every element each frame through React state, like a drag, on the canvas and three page thumbnails at once. Pulse adds the looping pulse animation on top.</p>
      <div className="lab-controls">
        <button type="button" onClick={() => setRunning((value) => !value)}>{running ? "Stop" : "Start"} movement</button>
        <button type="button" aria-pressed={pulse} onClick={() => setPulse((value) => !value)}>{pulse ? "Stop" : "Start"} pulse</button>
        <output className="lab-fps">{fps ? `${fps.average} fps average · ${fps.worst} fps worst frame` : "Not measured yet"}</output>
      </div>
      <EditorEffectDefs items={defsFor(elements)} />
      <div ref={stageRef} className="lab-stress">
        <Surface elements={elements} label="Canvas" />
        <div className="lab-thumbs">
          {[1, 2, 3].map((n) => <Surface key={n} elements={elements} className="is-thumb" label={`Thumbnail ${n}`} />)}
        </div>
      </div>
    </section>
  );
}

export default function EffectsLab() {
  const displayRef = useRef(null);
  const benchmark = query().get("bench") === "1";
  const [strokeMode, setStrokeMode] = useState("non-scaling");
  const [outlineMode, setOutlineMode] = useState(() => (query().get("outline") === "filter" ? "filter" : "text-stroke"));

  return (
    <main className="lab">
      <header className="lab-header">
        <p>Visora · Phase 0 · development only</p>
        <h1>Effects and vector proof</h1>
        <p>Browser: <strong>{browserName()}</strong>. Compare the three surfaces below: shadows, outlines and shapes must look the same apart from size.</p>
      </header>

      {benchmark && <EffectsBench />}
      {query().get("stress") === "1" && <StressTest />}
      <EditorEffectDefs items={defsFor([...SCENE, ...STROKE_TEST], outlineMode)} />

      <section className="lab-section">
        <h2>One scene, three surfaces</h2>
        <p>Wide title with outline and drop shadow · square with drop + inner · circle with inner only (box-filling edge) · pill with spread · star rotated 20° with offset shadow · heart with outline, drop and light inner · thin bar with a long shadow (clipping) · tall pill with outline.</p>
        <div className="lab-row">
          <Surface elements={SCENE} outlineMode={outlineMode} label="Canvas size" />
          <Surface elements={SCENE} outlineMode={outlineMode} className="is-thumb" label="Thumbnail size" />
        </div>
        <div className="lab-controls">
          <button type="button" onClick={() => displayRef.current?.requestFullscreen?.()}>Present the display surface full screen</button>
        </div>
        <Surface elements={SCENE} outlineMode={outlineMode} className="is-display" label="Display size" surfaceRef={displayRef} />
      </section>

      <section className="lab-section">
        <h2>Outline units</h2>
        <p>Stretched shapes and outlined text. <strong>Non-scaling</strong> uses <code>vector-effect: non-scaling-stroke</code> with the width in <code>cqw</code>; <strong>user units</strong> is a plain stroke inside the stretched viewBox. The right choice keeps every side of the pill and the ellipse equally thick.</p>
        <div className="lab-controls" role="radiogroup" aria-label="Stroke method">
          {["non-scaling", "user-units"].map((mode) => (
            <button key={mode} type="button" role="radio" aria-checked={strokeMode === mode} onClick={() => setStrokeMode(mode)}>
              {mode === "non-scaling" ? "Non-scaling" : "User units"}
            </button>
          ))}
        </div>
        <div className="lab-controls" role="radiogroup" aria-label="Text outline method">
          {[["text-stroke", "Text: -webkit-text-stroke"], ["filter", "Text: filter outline"]].map(([mode, label]) => (
            <button key={mode} type="button" role="radio" aria-checked={outlineMode === mode} onClick={() => setOutlineMode(mode)}>{label}</button>
          ))}
        </div>
        <div className="lab-row">
          <Surface elements={STROKE_TEST} strokeMode={strokeMode} outlineMode={outlineMode} label="Canvas size" />
          <Surface elements={STROKE_TEST} strokeMode={strokeMode} outlineMode={outlineMode} className="is-thumb" label="Thumbnail size" />
        </div>
      </section>

      {query().get("stress") !== "1" && <StressTest />}
    </main>
  );
}
