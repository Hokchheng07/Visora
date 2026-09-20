import { initialVisibility, rowVisible } from "./animationTimeline.js";
import { elementStyle } from "../model/elementGeometry.js";
import { shapePath } from "../model/vectorPath.js";
import { effectFilter, strokeOverflow } from "../model/effectsFilter.js";

export const morphKey = (element) => element.morphId || element.id;
export const mix = (a, b, t) => a + (b - a) * t;
export const mixRotation = (a, b, t) => a + (((b - a + 180) % 360 + 360) % 360 - 180) * t;
export function mixColor(a, b, t) {
  const rgb = (value) => {
    if (!/^#([\da-f]{3}|[\da-f]{6})$/i.test(value || "")) return null;
    let hex = value.slice(1); if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  };
  const from = rgb(a), to = rgb(b);
  return from && to ? `#${from.map((c, i) => Math.round(mix(c, to[i], t)).toString(16).padStart(2, "0")).join("")}` : null;
}
export function matchMorph(oldPage, newPage, oldVisibility) {
  const newVisibility = initialVisibility(newPage);
  const old = oldPage.elements.filter((e) => rowVisible(oldPage, { elementId: e.id }) && oldVisibility?.[e.id] !== false);
  const incoming = newPage.elements.filter((e) => newVisibility[e.id]);
  const unused = new Set(incoming), matches = new Map();
  // Key matches always win over names, regardless of element/layer order.
  for (const from of old) {
    const to = incoming.find((e) => unused.has(e) && e.type === from.type && morphKey(e) === morphKey(from));
    if (to) { matches.set(from, to); unused.delete(to); }
  }
  const uniqueName = (all, name) => name && all.filter((e) => e.name?.trim() === name).length === 1;
  for (const from of old) {
    if (matches.has(from)) continue;
    const name = from.name?.trim();
    if (!uniqueName(oldPage.elements, name) || !uniqueName(newPage.elements, name)) continue;
    const to = incoming.find((e) => unused.has(e) && e.name?.trim() === name && e.type === from.type);
    if (to) { matches.set(from, to); unused.delete(to); }
  }
  return [...old.map((from) => ({ from, to: matches.get(from) || null })), ...[...unused].map((to) => ({ from: null, to }))];
}
export function morphFrame(pair, t) {
  const a = pair.from || pair.to, b = pair.to || pair.from;
  const box = { ...a };
  for (const key of ["x", "y", "w", "h"]) box[key] = mix(a[key], b[key], t);
  box.rotation = mixRotation(a.rotation || 0, b.rotation || 0, t);
  box.opacity = mix(a.opacity ?? 1, b.opacity ?? 1, t);
  const sameShape = a.type === "shape" && b.type === "shape" && a.shape === b.shape && a.shape !== "custom";
  const sameText = a.type === "text" && b.type === "text" && a.content === b.content && a.fontFamily === b.fontFamily;
  return { box, oldOpacity: pair.from ? 1 - t : 0, newOpacity: pair.to ? t : 0,
    fill: (sameShape || sameText) && !a.gradient && !b.gradient ? mixColor(a.fill, b.fill, t) : null,
    cornerRadius: sameShape ? mix(a.cornerRadius || 0, b.cornerRadius || 0, t) : null,
    cornerRadii: sameShape && (a.cornerRadii || b.cornerRadii) ? [0, 1, 2, 3].map((i) => mix(a.cornerRadii?.[i] ?? a.cornerRadius ?? 0, b.cornerRadii?.[i] ?? b.cornerRadius ?? 0, t)) : null,
    fontSize: sameText ? mix(a.fontSize || 72, b.fontSize || 72, t) : null };
}
function bindLook(root, source) {
  if (!root || !source) return () => {};
  const svg = root.querySelector(".editor-vector-art"), paths = [...root.querySelectorAll("[data-morph-path]")];
  const fill = root.querySelector("[data-morph-fill]"), text = root.querySelector(".editor-text-art");
  const masks = [...root.querySelectorAll("mask, mask > rect")];
  const filter = root.querySelector("filter");
  const primitives = filter ? [...filter.children] : [];
  return (frame, opacity) => {
    root.style.opacity = opacity;
    const { w, h } = frame.box;
    if (svg) {
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const d = shapePath({ ...source, w, h, cornerRadius: frame.cornerRadius ?? source.cornerRadius,
        cornerRadii: frame.cornerRadii || source.cornerRadii });
      paths.forEach((path) => path.setAttribute("d", d));
      if (frame.fill && fill) fill.setAttribute("fill", frame.fill);
      const margin = (source.strokeWidth || 0) * 2 + 2;
      masks.forEach((mask) => { mask.setAttribute("width", w + margin * 2); mask.setAttribute("height", h + margin * 2); });
    }
    if (text) {
      if (frame.fill) text.style.color = frame.fill;
      if (frame.fontSize !== null) text.style.fontSize = `${frame.fontSize / 19.2}cqw`;
    }
    if (filter) {
      const spec = effectFilter(source.id, source.effects, w, h, { extra: strokeOverflow(source) });
      Object.entries(spec.region).forEach(([key, value]) => filter.setAttribute(key, value));
      spec.primitives.forEach((primitive, i) => {
        for (const key of ["dx", "dy", "radius", "stdDeviation"]) if (key in primitive) primitives[i].setAttribute(key, primitive[key]);
      });
    }
  };
}
// Query and bind once. No DOM reads, React renders, or Redux writes per frame.
export function bindMorph(root, pairs, reducedMotion = false) {
  const boxes = [...root.querySelectorAll(".editor-morph-box")];
  const bindings = pairs.map((pair, index) => {
    const node = boxes[index];
    const oldLook = node.querySelector('[data-morph-look="old"]'), newLook = node.querySelector('[data-morph-look="new"]');
    if (reducedMotion) {
      if (pair.from) Object.assign(oldLook.style, elementStyle(pair.from), { rotate: `${pair.from.rotation || 0}deg` });
      if (pair.to) Object.assign(newLook.style, elementStyle(pair.to), { rotate: `${pair.to.rotation || 0}deg` });
    }
    return { pair, node, old: bindLook(oldLook, pair.from), next: bindLook(newLook, pair.to) };
  });
  const backgrounds = root.querySelectorAll(".editor-morph-background");
  return (t) => {
    if (backgrounds.length === 2) { backgrounds[0].style.opacity = 1 - t; backgrounds[1].style.opacity = t; }
    for (const binding of bindings) {
      const frame = morphFrame(binding.pair, t);
      if (reducedMotion) {
        // Keep each look in its original geometry while crossfading the pages.
        for (const side of ["old", "new"]) {
          const element = side === "old" ? binding.pair.from : binding.pair.to;
          if (!element) continue;
          binding[side === "old" ? "old" : "next"]({ ...frame, box: element, fill: null, cornerRadius: null, cornerRadii: null, fontSize: null }, (side === "old" ? 1 - t : t) * (element.opacity ?? 1));
        }
      } else {
        Object.assign(binding.node.style, elementStyle(frame.box), { rotate: `${frame.box.rotation}deg`, opacity: frame.box.opacity });
        binding.old(frame, frame.oldOpacity); binding.next(frame, frame.newOpacity);
      }
    }
    root.style.visibility = t >= 1 ? "hidden" : "visible";
  };
}
