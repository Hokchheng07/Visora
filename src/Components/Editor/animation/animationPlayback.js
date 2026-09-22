import { buildSteps, initialVisibility, rowVisible } from "./animationTimeline.js";

// Exact shared cubic-bezier curves, evaluated without DOM or animation-library state.
function bezier(x, x1, y1, x2, y2) {
  const at = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 18; i++) { const t = (lo + hi) / 2; if (at(t, x1, x2) < x) lo = t; else hi = t; }
  return x <= 0 ? 0 : x >= 1 ? 1 : at((lo + hi) / 2, y1, y2);
}
export const easeOut = (t) => bezier(t, .23, 1, .32, 1);
export const easeInOut = (t) => bezier(t, .77, 0, .175, 1);
const progress = (time, start, duration) => duration === 0 ? (time >= start ? 1 : 0) : Math.max(0, Math.min(1, (time - start) / duration));
export function animationFrame(row, time, reducedMotion = false) {
  const t = progress(time, row.start || 0, row.durationMs), p = easeOut(t);
  const frame = { opacity: 1, transform: "none", hidden: false };
  if (row.kind === "emphasis") {
    if (!reducedMotion) {
      const cycle = t * 4, half = Math.floor(cycle), phase = cycle - half;
      const value = t === 1 ? 0 : half % 2 ? 1 - easeInOut(phase) : easeInOut(phase);
      frame.transform = `scale(${1 + .035 * value})`;
    }
    return frame;
  }
  const exit = row.kind === "exit", amount = exit ? p : 1 - p;
  frame.opacity = exit ? 1 - p : p;
  frame.hidden = exit && t === 1;
  if (!reducedMotion) {
    if (row.preset === "rise") frame.transform = `translateY(${amount * 32}px)`;
    if (row.preset === "slide-left") frame.transform = `translateX(${amount * -48}px)`;
    if (row.preset === "pop") frame.transform = `scale(${1 - amount * .05})`;
  }
  return frame;
}
export function playbackInput(event) {
  if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return null;
  if (event.target?.closest?.("button, input, textarea, select, a, [contenteditable='true'], [contenteditable='plaintext-only'], [role='button'], .editor-display-bar, .editor-exit-prompt")) return null;
  if (event.type === "click") return "next";
  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) return "next";
  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) return "previous";
  return ({ Home: "home", End: "end" })[event.key] || null;
}

// A driver owns exactly one phase. finish() applies its terminal state synchronously,
// including a pending step 0 after Morph; callbacks from disposed drivers are ignored.
export function createPlaybackController({ page, transition, morph = false, reducedMotion = false, drive, renderElement, renderTransition = () => {}, onIdle = () => {}, onNextPage = () => {}, preview = false }) {
  const base = initialVisibility(page), visible = { ...base };
  const steps = buildSteps(page).map((step) => {
    if (!reducedMotion) return step;
    const rows = step.rows.map((row) => ({ ...row, durationMs: row.kind === "emphasis" ? 0 : Math.min(200, row.durationMs), end: row.start + (row.kind === "emphasis" ? 0 : Math.min(200, row.durationMs)) }));
    return { ...step, rows, durationMs: Math.max(0, ...rows.map((row) => row.end)) };
  });
  let phase = null, driver = null, disposed = false, nextStep = 1;
  const completed = [];
  function paint(step, time) {
    const frames = Object.fromEntries(page.elements.map((element) => [element.id, { opacity: 1, transform: "none", hidden: !base[element.id] }]));
    const apply = (rows, at) => {
      for (const row of [...rows].sort((a, b) => a.start - b.start)) {
        if (!rowVisible(page, row) || at < row.start) continue;
        frames[row.elementId] = animationFrame(row, at, reducedMotion);
      }
    };
    completed.forEach((done) => apply(done.rows, Infinity));
    if (step) apply(step.rows, time);
    for (const [id, frame] of Object.entries(frames)) { visible[id] = !frame.hidden; renderElement(id, frame); }
  }
  function complete(active) {
    if (disposed || phase !== active) return;
    active.paint(active.duration);
    completed.push(active.step); phase = null; driver = null;
    if (preview && nextStep < steps.length) next(); else onIdle();
  }
  function run(step, entry = false) {
    const transitionDuration = entry && transition ? (reducedMotion ? 200 : transition.durationMs) + (transition.delayMs || 0) : 0;
    const offset = entry && morph ? transitionDuration : 0;
    const duration = entry ? Math.max(transitionDuration, offset + step.durationMs) : step.durationMs;
    const active = { step, duration, entry, paint(time) {
      if (entry) renderTransition(transition ? progress(time, transition.delayMs || 0, reducedMotion ? 200 : transition.durationMs) : 1);
      paint(step, time < offset ? -1 : time - offset);
    } };
    phase = active; active.paint(0);
    if (!duration) { complete(active); return; }
    const handle = drive(duration, (time) => { if (!disposed && phase === active) active.paint(time); }, () => complete(active));
    if (phase === active) driver = handle; else handle?.cancel();
  }
  function finish() {
    if (!phase) return;
    const active = phase; driver?.cancel(); driver = null; complete(active);
  }
  function next() {
    if (disposed) return;
    if (phase) {
      // Entry is automatic, not an extra click step. When nothing interactive
      // remains, honor Next as navigation after settling the entire entry.
      // Authored click steps still finish in place so their content isn't skipped.
      const advance = !preview && phase.entry && !steps.slice(nextStep).some((step) => step.playable);
      finish();
      if (advance && !disposed) onNextPage();
      return;
    }
    while (nextStep < steps.length && !steps[nextStep].playable) nextStep++;
    if (nextStep < steps.length) run(steps[nextStep++]); else if (!preview) onNextPage(); else onIdle();
  }
  return {
    start() { paint(null, 0); run(steps[0], true); }, next, finish,
    get busy() { return !!phase; }, get hasNext() { return steps.slice(nextStep).some((step) => step.playable); },
    visibility: () => ({ ...visible }),
    dispose() { disposed = true; driver?.cancel(); driver = null; phase = null; },
  };
}
