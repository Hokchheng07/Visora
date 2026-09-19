import { afterEach, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import MorphOverlay from "./MorphOverlay.jsx";
import { bindMorph } from "./morph.js";
afterEach(cleanup);
it("updates fill, stroke, clip and mask geometry together while retaining each look's effects", () => {
  const from = { id: "old", type: "shape", shape: "square", x: 0, y: 0, w: 100, h: 100, opacity: 1, fill: "#000000", stroke: "#ff0000", strokeWidth: 8, strokeAlign: "outside",
    effects: [{ type: "DROP_SHADOW", visible: true, x: 10, y: 10, blur: 10, spread: 2, color: "#000000", opacity: .5 }] };
  const to = { ...from, id: "new", w: 300, h: 200, stroke: "#00ff00", strokeAlign: "inside", fill: "#ffffff" };
  const pairs = [{ from, to }], rootRef = { current: null };
  const { container } = render(<MorphOverlay rootRef={rootRef} pairs={pairs} oldPage={{}} page={{}} />);
  const update = bindMorph(rootRef.current, pairs); update(.5);
  const paths = [...container.querySelectorAll('[data-morph-path]')];
  expect(new Set(paths.map((p) => p.getAttribute('d'))).size).toBe(1);
  expect(container.querySelector('svg.editor-vector-art').getAttribute('viewBox')).toBe('0 0 200 150');
  expect(container.querySelector('mask').getAttribute('width')).toBe('236');
  expect(container.querySelectorAll('filter')).toHaveLength(2);
  expect([...container.querySelectorAll('[stroke]')].map((p) => p.getAttribute('stroke'))).toEqual(['#ff0000', '#00ff00']);
  expect([...container.querySelectorAll('.editor-morph-look')].map((e) => e.style.opacity)).toEqual(['0.5', '0.5']);
  update(1); expect(rootRef.current.style.visibility).toBe('hidden');
});
it("reduced motion crossfades stationary looks with independent geometry and opacity", () => {
  const from = { id: "old", type: "shape", shape: "square", x: 100, y: 50, w: 100, h: 100, rotation: 20, opacity: .5, fill: "#000000" };
  const to = { ...from, id: "new", x: 900, w: 300, rotation: 70, opacity: .8, fill: "#ffffff" };
  const pairs = [{ from, to }], rootRef = { current: null };
  const { container } = render(<MorphOverlay rootRef={rootRef} pairs={pairs} oldPage={{}} page={{}} reducedMotion />);
  const update = bindMorph(rootRef.current, pairs, true);
  const looks = [...container.querySelectorAll('.editor-morph-look')];
  const geometry = looks.map(e => [e.style.left, e.style.width, e.style.rotate]);
  update(.5);
  expect(looks.map(e => e.style.opacity)).toEqual(['0.25', '0.4']);
  expect(looks.map(e => [e.style.left, e.style.width, e.style.rotate])).toEqual(geometry);
  expect([...container.querySelectorAll('.editor-vector-art')].map(e => e.getAttribute('viewBox'))).toEqual(['0 0 100 100', '0 0 300 100']);
  update(.8);
  expect(looks.map(e => [e.style.left, e.style.width, e.style.rotate])).toEqual(geometry);
});
