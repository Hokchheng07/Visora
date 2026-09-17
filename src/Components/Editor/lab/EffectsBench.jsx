import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import EditorEffectDefs from "../EditorEffectDefs.jsx";
import { filterId } from "../effectsFilter.js";
import { elementStyle } from "../elementGeometry.js";
import { nodesToD, presetVector } from "../vectorPath.js";

/*
 * Phase 0 frame-rate benchmark (/editor-lab?bench=1). Development only.
 *
 * The stress test measured about 7 fps in Opera GX. That number alone does not
 * say what to fix, so this runs the same kind of scene several ways and times
 * each one, changing one thing at a time: effects on or off, how many surfaces
 * redraw, whether elements move by layout (left/top, what the editor does
 * today) or by transform on their own layer, and where a looping animation is
 * applied. Results also land on window.__benchResults for automated runs.
 */

const SCENARIOS = [
  { id: "A", label: "No effects · 30 moving · canvas only", effects: 0, moving: 30, surfaces: 1, motion: "layout" },
  { id: "B", label: "4 effects · 30 moving · canvas only", effects: 4, moving: 30, surfaces: 1, motion: "layout" },
  { id: "C", label: "4 effects · 30 moving · canvas + 3 thumbnails (the stress test)", effects: 4, moving: 30, surfaces: 4, motion: "layout" },
  { id: "D", label: "4 effects · 30 moving by transform · canvas only", effects: 4, moving: 30, surfaces: 1, motion: "transform" },
  { id: "E", label: "4 effects · 30 moving by transform · canvas + 3 thumbnails", effects: 4, moving: 30, surfaces: 4, motion: "transform" },
  { id: "F", label: "4 effects · 30 moving by transform · canvas + 3 frozen thumbnails", effects: 4, moving: 30, surfaces: 4, motion: "transform", frozenThumbs: true },
  { id: "G", label: "4 effects · 1 moving (a normal drag) · canvas + 3 thumbnails", effects: 4, moving: 1, surfaces: 4, motion: "layout" },
  { id: "H", label: "1 effect · 30 moving · canvas only", effects: 1, moving: 30, surfaces: 1, motion: "layout" },
  { id: "I", label: "4 effects · pulse animating the filtered layer", effects: 4, moving: 0, surfaces: 1, motion: "layout", pulse: "filtered" },
  { id: "J", label: "4 effects · pulse animating an outer layer", effects: 4, moving: 0, surfaces: 1, motion: "layout", pulse: "outer" },
  { id: "K", label: "4 effects · 1 moving by layout · every element on its own layer · canvas + 3 thumbnails", effects: 4, moving: 1, surfaces: 4, motion: "layout", layers: true },
  { id: "L", label: "4 effects · 30 moving by layout · every element on its own layer · canvas only", effects: 4, moving: 30, surfaces: 1, motion: "layout", layers: true },
  { id: "M", label: "4 effects · 90 elements, 1 moving by layout · own layers · canvas + 3 thumbnails", effects: 4, moving: 1, surfaces: 4, motion: "layout", layers: true, count: 90 },
];

const WARMUP = 700, MEASURE = 2300;
const SHAPES = ["square", "circle", "pill", "star", "heart"];
const COLOURS = ["#705AE0", "#FFC21C", "#DA4EC9", "#2F7A55", "#AD8DEA"];
const EFFECTS = [
  { type: "DROP_SHADOW", visible: true, x: 0, y: 12, blur: 24, spread: 0, color: "#1B1530", opacity: 0.3 },
  { type: "INNER_SHADOW", visible: true, x: 0, y: 8, blur: 12, spread: 0, color: "#2A1F55", opacity: 0.45 },
  { type: "DROP_SHADOW", visible: true, x: 10, y: 30, blur: 50, spread: 0, color: "#1B1530", opacity: 0.15 },
  { type: "INNER_SHADOW", visible: true, x: 0, y: -6, blur: 10, spread: 0, color: "#FFFFFF", opacity: 0.4 },
];

function baseElements(scenario) {
  const count = scenario.count || 30, columns = count > 30 ? 12 : 6, size = count > 30 ? 0.5 : 1;
  return Array.from({ length: count }, (_, index) => ({
    id: `bench-${index}`, shape: SHAPES[index % 5], fill: COLOURS[index % 5],
    x: 80 + (index % columns) * 300 * size, y: 40 + Math.floor(index / columns) * 200 * size, w: 180 * size, h: 160 * size, rotation: (index * 17) % 45,
    effects: EFFECTS.slice(0, scenario.effects),
  }));
}

function offset(index, time, scenario) {
  if (index >= scenario.moving) return { dx: 0, dy: 0 };
  const phase = time / 600 + index;
  return { dx: Math.sin(phase) * 40, dy: Math.cos(phase) * 30 };
}

function BenchSurface({ scenario, elements, time, thumb }) {
  const still = thumb && scenario.frozenThumbs;
  return (
    <div className={`lab-surface${thumb ? " bench-thumb" : ""}`}>
      {elements.map((element, index) => {
        const { dx, dy } = still ? { dx: 0, dy: 0 } : offset(index, time, scenario);
        const byTransform = scenario.motion === "transform";
        const box = byTransform ? elementStyle(element) : elementStyle({ ...element, x: element.x + dx, y: element.y + dy });
        const style = { ...box, rotate: `${element.rotation}deg`,
          ...(byTransform ? { translate: `${dx / 19.2}cqw ${dy / 19.2}cqw`, willChange: "transform" } : {}),
          ...(scenario.pulse === "outer" || scenario.layers ? { willChange: "transform" } : {}) };
        return (
          <div key={element.id} className="lab-element bench-outer" style={style}>
            <div className="lab-effects bench-filtered" style={scenario.effects ? { filter: `url(#${filterId(element.id)})` } : undefined}>
              <svg className="lab-shape" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d={nodesToD(presetVector(element.shape, element.w, element.h))} fill={element.fill} />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function EffectsBench() {
  const [run, setRun] = useState(0);
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(0);
  const [results, setResults] = useState([]);
  const stageRef = useRef(null);
  const scenario = SCENARIOS[index];
  const done = index >= SCENARIOS.length;

  useEffect(() => {
    if (done) {
      window.__benchResults = results;
      document.title = "bench done";
      return undefined;
    }
    let frame, frames = 0, worst = 0, last = null;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      if (elapsed > WARMUP) {
        if (last !== null) worst = Math.max(worst, now - last);
        frames++;
        last = now;
      }
      if (elapsed >= WARMUP + MEASURE) {
        const fps = Math.round((frames - 1) * 1000 / (now - start - WARMUP));
        setResults((list) => [...list, { id: scenario.id, label: scenario.label, fps, worstFrameMs: Math.round(worst) }]);
        setIndex((value) => value + 1);
        return;
      }
      if (scenario.moving) setTime(now);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Each scenario runs once per run; results is read only when finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, run]);

  useEffect(() => {
    if (done || !scenario.pulse || !stageRef.current) return undefined;
    const targets = stageRef.current.querySelectorAll(scenario.pulse === "outer" ? ".bench-outer" : ".bench-filtered");
    const animation = animate(targets, { scale: [1, 1.035], alternate: true, loop: true, duration: 700, ease: "inOutSine" });
    return () => animation.revert();
  }, [done, scenario]);

  const elements = done ? [] : baseElements(scenario);
  return (
    <section className="lab-section">
      <h2>Frame-rate benchmark</h2>
      <p>Runs {SCENARIOS.length} versions of the scene for 3 seconds each. Keep this window visible and in front until the table is full.</p>
      <div className="lab-controls">
        <button type="button" disabled={!done} onClick={() => { setResults([]); setIndex(0); setRun((value) => value + 1); }}>Run again</button>
        <output className="lab-fps">{done ? "Finished" : `Running ${scenario.id}: ${scenario.label}`}</output>
      </div>
      <table className="bench-table">
        <thead><tr><th>Test</th><th>What changes</th><th>Average fps</th><th>Worst frame</th></tr></thead>
        <tbody>
          {SCENARIOS.map((item) => {
            const result = results.find((entry) => entry.id === item.id);
            return (
              <tr key={item.id}>
                <td>{item.id}</td><td>{item.label}</td>
                <td>{result ? result.fps : "…"}</td><td>{result ? `${result.worstFrameMs} ms` : "…"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!done && (
        <>
          <EditorEffectDefs items={elements.map((element) => ({ id: element.id, w: element.w, h: element.h, effects: element.effects }))} />
          <div ref={stageRef} className="lab-stress">
            <figure className="lab-figure"><BenchSurface scenario={scenario} elements={elements} time={time} /></figure>
            {scenario.surfaces > 1 && (
              <div className="lab-thumbs">
                {[1, 2, 3].map((n) => (
                  <figure key={n} className="lab-figure is-thumb"><BenchSurface scenario={scenario} elements={elements} time={time} thumb /></figure>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
