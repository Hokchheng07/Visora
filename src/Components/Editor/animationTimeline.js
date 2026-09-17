// Serializable authoring data and pure timing math. Runtime playback never edits it.
export const MAX_ANIMATION_MS = 60000;
export const PRESETS = { entrance: ["fade", "rise", "slide-left", "pop"], emphasis: ["pulse"], exit: ["fade", "rise", "slide-left", "pop"] };
export const TRANSITIONS = ["fade", "rise", "slide-left", "pop", "morph"];
export const ms = (value, fallback = 520) => Number.isFinite(Number(value)) ? Math.round(Math.max(0, Math.min(MAX_ANIMATION_MS, Number(value)))) : fallback;
export function normalizeTransition(value) {
  return TRANSITIONS.includes(value?.preset) ? { preset: value.preset, durationMs: ms(value.durationMs, 700), delayMs: ms(value.delayMs, 0) } : undefined;
}
export function rowVisible(page, row) {
  const element = page.elements.find((item) => item.id === row.elementId);
  return !!element && element.visible !== false && !(page.groups || []).some((group) => group.id === element.groupId && group.visible === false);
}
export function buildSteps(page) {
  const steps = [{ index: 0, rows: [], durationMs: 0 }];
  for (const row of page.animations || []) {
    if (row.trigger === "click") steps.push({ index: steps.length, rows: [], durationMs: 0 });
    const step = steps.at(-1), previous = step.rows.at(-1);
    const anchor = !previous ? 0 : row.trigger === "after" ? previous.end : previous.anchor;
    const start = anchor + row.delayMs, end = start + row.durationMs;
    step.rows.push({ ...row, anchor, start, end, step: step.index });
    step.durationMs = Math.max(step.durationMs, end);
  }
  return steps.map((step) => ({ ...step, playable: step.rows.some((row) => rowVisible(page, row)) }));
}
export function initialVisibility(page) {
  return Object.fromEntries(page.elements.map((element) => [element.id,
    rowVisible(page, { elementId: element.id }) && !(page.animations || []).some((row) => row.elementId === element.id && row.kind === "entrance")]));
}
export function validateTimeline(page) {
  const errors = [], ids = new Set(), byElement = new Map();
  for (const row of page.animations || []) {
    const fail = (code) => errors.push({ code, rowId: row.id });
    if (!row.id || ids.has(row.id)) fail("duplicate-id");
    ids.add(row.id);
    if (!page.elements.some((item) => item.id === row.elementId)) fail("missing-element");
    if (!PRESETS[row.kind]?.includes(row.preset) || !["click", "with", "after"].includes(row.trigger)
      || !Number.isFinite(row.delayMs) || !Number.isFinite(row.durationMs) || row.delayMs < 0 || row.durationMs < 0
      || row.delayMs > MAX_ANIMATION_MS || row.durationMs > MAX_ANIMATION_MS) fail("invalid-row");
  }
  for (const step of buildSteps(page)) for (const row of [...step.rows].sort((a, b) => a.start - b.start)) {
    const prior = byElement.get(row.elementId) || [];
    if (row.kind !== "emphasis" && prior.some((item) => item.kind === row.kind)) errors.push({ code: `duplicate-${row.kind}`, rowId: row.id });
    const rank = { entrance: 0, emphasis: 1, exit: 2 };
    if (prior.some((item) => rank[item.kind] > rank[row.kind])) errors.push({ code: "wrong-order", rowId: row.id });
    if (prior.some((item) => item.step === row.step && item.start < row.end && row.start < item.end)) errors.push({ code: "overlap", rowId: row.id });
    prior.push(row); byElement.set(row.elementId, prior);
  }
  return errors;
}
// Preserve all surviving start times, including With chains downstream of a removed row.
export function removeAnimationRows(page, removed) {
  const result = [];
  for (const step of buildSteps(page)) {
    let previous = null;
    for (const row of step.rows) {
      if (removed.has(row.id)) continue;
      const { anchor: _anchor, start, end: _end, step: _step, ...clean } = row;
      if (!previous) clean.trigger = step.index ? "click" : "after";
      let anchor = !previous ? 0 : clean.trigger === "after" ? previous.end : previous.anchor;
      clean.delayMs = Math.max(0, start - anchor);
      previous = { anchor, end: anchor + clean.delayMs + clean.durationMs };
      result.push(clean);
    }
  }
  return result;
}
export function repairTimeline(page) {
  const seen = new Set();
  let rows = (Array.isArray(page.animations) ? page.animations : []).filter((row) => row && PRESETS[row.kind]?.includes(row.preset)).map((row, index) => {
    let id = typeof row.id === "string" && row.id ? row.id : `animation-${index}`;
    while (seen.has(id)) id += "~";
    seen.add(id);
    return { id, elementId: row.elementId, kind: row.kind, preset: row.preset,
      trigger: ["click", "with", "after"].includes(row.trigger) ? row.trigger : "after",
      delayMs: ms(row.delayMs, 0), durationMs: ms(row.durationMs, row.kind === "emphasis" ? 1400 : 520) };
  });
  // Each iteration either drops a row or splits a conflicting step. Bounded even for damaged input.
  for (let i = 0, limit = rows.length * 3 + 1; i < limit; i++) {
    const candidate = { ...page, animations: rows }, errors = validateTimeline(candidate);
    if (!errors.length) break;
    const error = errors.find((item) => item.code !== "overlap") || errors[0];
    rows = error.code === "overlap" ? rows.map((row) => row.id === error.rowId ? { ...row, trigger: "click" } : row)
      : removeAnimationRows(candidate, new Set([error.rowId]));
  }
  return rows;
}
export function migrateAnimations(page) {
  const { animation, ...rest } = page;
  if (Array.isArray(page.animations)) return { ...rest, transition: normalizeTransition(page.transition), animations: repairTimeline(page) };
  const rows = page.elements.filter((element) => element.animation && element.animation.preset !== "none").map((element, index) => {
    const old = element.animation, pulse = old.preset === "pulse";
    return { id: `${page.id}:legacy:${element.id}`, elementId: element.id, kind: pulse ? "emphasis" : "entrance", preset: old.preset,
      trigger: index ? "with" : "after", delayMs: ms(old.delay, 0), durationMs: pulse ? 5600 : old.preset === "pop" ? Math.min(old.duration || 520, 420) : ms(old.duration || 520) };
  });
  return { ...rest, transition: normalizeTransition(page.transition || (animation && { preset: animation.preset === "pulse" ? "fade" : animation.preset, durationMs: animation.preset === "pop" ? Math.min(animation.duration || 520, 420) : animation.duration || 520, delayMs: animation.delay || 0 })),
    animations: repairTimeline({ ...page, animations: rows }), elements: page.elements.map(({ animation: _old, ...element }) => element) };
}
export function remapAnimations(rows, idMap, makeId) {
  return rows.filter((row) => idMap.has(row.elementId)).map((row) => ({ ...row, id: makeId(), elementId: idMap.get(row.elementId) }));
}
export function extractAnimations(page, ids) {
  // A disconnected chain anchors to its original step start, preserving its absolute delay.
  return removeAnimationRows(page, new Set((page.animations || []).filter((row) => !ids.has(row.elementId)).map((row) => row.id)));
}
export function appendAnimations(page, rows) {
  if (!rows.length) return page.animations || [];
  return repairTimeline({ ...page, animations: [...(page.animations || []), ...rows.map((row, index) => index ? row : { ...row, trigger: page.animations?.length ? "click" : "after" })] });
}
export function insertionRows(page, ids, kind, preset, trigger = "with") {
  return page.elements.filter((element) => ids.includes(element.id)).map((element, index) => ({ id: `candidate:${element.id}`, elementId: element.id,
    kind, preset, trigger: index ? "with" : trigger, delayMs: 0, durationMs: kind === "emphasis" ? 1400 : 520 }));
}
// A slider follows only the contiguous valid interval around its current value.
export function timingBounds(page, rowId, property, quantum = 10) {
  const row = page.animations.find((item) => item.id === rowId);
  if (!row) return { min: 0, max: 0 };
  const valid = (value) => !validateTimeline({ ...page, animations: page.animations.map((item) => item.id === rowId ? { ...item, [property]: value } : item) }).length;
  let min = row[property], max = min;
  while (min >= quantum && valid(min - quantum)) min -= quantum;
  while (max + quantum <= MAX_ANIMATION_MS && valid(max + quantum)) max += quantum;
  return { min, max };
}
