import assert from "node:assert/strict";
import test from "node:test";
import { librarySvg, pageSvg, rasterElements } from "./pageSvg.js";

const size = { width: 1920, height: 1080 };
const none = { picture: () => null, raster: () => null };
const page = (...elements) => ({ id: "p1", background: { type: "COLOR", value: "#112233" }, elements });
const rect = (extra = {}) => ({ id: "s1", type: "shape", shape: "rectangle", x: 10, y: 20, w: 100, h: 50, rotation: 0, fill: "#FF0000", ...extra });

test("the page is its own size with its own background", () => {
  const { svg } = pageSvg(page(), size, none);
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="1920" height="1080" viewBox="0 0 1920 1080">/);
  assert.match(svg, /<rect width="1920" height="1080" fill="#112233"\/>/);
});

test("a shape is a path placed at its box and turned about its centre", () => {
  const { svg } = pageSvg(page(rect({ rotation: 30, opacity: 0.5 })), size, none);
  assert.match(svg, /<g transform="translate\(10 20\) rotate\(30 50 25\)" opacity="0.5">/);
  assert.match(svg, /<path d="[^"]+" fill="#FF0000" fill-opacity="1"\/>/);
});

test("a gradient fill is a linearGradient in the shape's own defs", () => {
  const gradient = { type: "LINEAR", angle: 0, stops: [{ offset: 0, color: "#000000", opacity: 1 }, { offset: 1, color: "#FFFFFF", opacity: 1 }] };
  const { svg } = pageSvg(page(rect({ gradient })), size, none);
  assert.match(svg, /<linearGradient id="fill-e0" x1="0" y1="0.5" x2="1" y2="0.5">/);
  assert.match(svg, /fill="url\(#fill-e0\)"/);
});

test("stroke alignment: centre as is, inside clipped, outside clipped by an even-odd hole", () => {
  const stroked = (strokeAlign) => pageSvg(page(rect({ stroke: "#00FF00", strokeWidth: 4, strokeAlign })), size, none).svg;
  assert.match(stroked("center"), /stroke-width="4"(?![^>]*clip-path)/);
  assert.match(stroked("inside"), /<clipPath id="clip-e0"><path d="[^"]+"\/><\/clipPath>/);
  assert.match(stroked("inside"), /stroke-width="8"[^>]*clip-path="url\(#clip-e0\)"/);
  assert.match(stroked("outside"), /<clipPath id="clip-e0"><path d="M-10 -10H110V60H-10Z[^"]+" clip-rule="evenodd"\/>/);
  assert.doesNotMatch(stroked("outside"), /<mask/);
});

test("a photo covers its frame, is cropped by it, and carries its corner radius", () => {
  const photo = { id: "i1", type: "image", src: "a.jpg", x: 0, y: 0, w: 200, h: 100, rotation: 0, cornerRadius: 8 };
  const picture = () => ({ href: "data:image/png;base64,AA", width: 100, height: 100 });
  const { svg } = pageSvg(page(photo), size, { ...none, picture });
  assert.match(svg, /<clipPath id="frame-e0"><rect width="200" height="100" rx="8"\/><\/clipPath>/);
  // 100×100 covering 200×100 is drawn 200×200, centred: 50 above the frame.
  assert.match(svg, /<image x="0" y="-50" width="200" height="200" href="data:image\/png;base64,AA" preserveAspectRatio="none"\/>/);
});

test("a zoomed or flipped photo is scaled about the frame's centre", () => {
  const photo = { id: "i1", type: "image", src: "a.jpg", x: 0, y: 0, w: 100, h: 100, rotation: 0, flipX: true, crop: { x: 0.5, y: 0.5, zoom: 2 } };
  const picture = () => ({ href: "data:,", width: 100, height: 100 });
  const { svg } = pageSvg(page(photo), size, { ...none, picture });
  assert.match(svg, /transform="translate\(50 50\) scale\(-2 2\) translate\(-50 -50\)"/);
});

test("a picture that did not load is the editor's grey placeholder", () => {
  const photo = { id: "i1", type: "image", src: "gone.jpg", x: 0, y: 0, w: 40, h: 40, rotation: 0 };
  assert.match(pageSvg(page(photo), size, none).svg, /<rect width="40" height="40" fill="#ECEBF1"\/>/);
});

test("text is placed as the picture the caller made of it, in paint order", () => {
  const text = { id: "t1", type: "text", content: "សួស្តី", x: 0, y: 0, w: 10, h: 10, rotation: 0 };
  const raster = () => ({ href: "data:t", x: 5, y: 6, width: 7, height: 8 });
  const { svg } = pageSvg(page(rect(), text), size, { ...none, raster });
  assert.ok(svg.indexOf("<path") < svg.indexOf('href="data:t"'));
  assert.match(svg, /<image x="5" y="6" width="7" height="8" href="data:t" preserveAspectRatio="none"\/>/);
  assert.deepEqual(rasterElements(page(rect(), text)).map((element) => element.id), ["t1"]);
});

test("hidden layers are left out and shadows are counted, not drawn", () => {
  const shadow = [{ type: "DROP_SHADOW", visible: true, x: 4, y: 4, blur: 8, spread: 0, color: "#000000", opacity: 0.5 }];
  const { svg, droppedEffects } = pageSvg(page(rect({ effects: shadow }), rect({ id: "s2", visible: false, fill: "#0000FF" })), size, none);
  assert.equal(droppedEffects, 1);
  assert.doesNotMatch(svg, /#0000FF|filter/);
});

test("markup in the model cannot break out of an attribute", () => {
  const { svg } = pageSvg(page(rect({ fill: '"/><script>' })), size, none);
  assert.doesNotMatch(svg, /<script>/);
});

test("librarySvg unwraps a bundled file and recolours it on request", () => {
  const file = `<?xml version="1.0"?><!-- traced --><svg xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 10 20"><g fill="#AF7A23" stroke="none"><path d="M0 0"/></g></svg>`;
  const plain = librarySvg(file);
  assert.deepEqual({ viewBox: plain.viewBox, width: plain.width, height: plain.height }, { viewBox: "0 0 10 20", width: 10, height: 20 });
  assert.equal(plain.body, '<g fill="#AF7A23" stroke="none"><path d="M0 0"/></g>');
  assert.equal(librarySvg(file, "#123456").body, '<g fill="#123456"><g fill="#123456" stroke="none"><path d="M0 0"/></g></g>');
  assert.equal(librarySvg("<svg><path/></svg>"), null);
});

test("outlined text is placed in its box, turned with it, and clipped to it", () => {
  const text = { id: "t1", type: "text", x: 10, y: 20, w: 300, h: 80, rotation: 15 };
  const { svg } = pageSvg(page(text), size, { ...none, text: () => '<path d="M0,0Z" fill="#000"/>' });
  assert.match(svg, /<g transform="translate\(10 20\) rotate\(15 150 40\)"><defs><clipPath id="text-e0"><rect width="300" height="80"\/><\/clipPath><\/defs><g clip-path="url\(#text-e0\)"><path d="M0,0Z" fill="#000"\/><\/g><\/g>/);
  assert.doesNotMatch(svg, /<image/);
});

test("text that cannot be outlined falls back to its picture", () => {
  const text = { id: "t1", type: "text", x: 0, y: 0, w: 10, h: 10, rotation: 0 };
  const raster = () => ({ href: "data:t", x: 0, y: 0, width: 10, height: 10 });
  assert.match(pageSvg(page(text), size, { ...none, text: () => null, raster }).svg, /href="data:t"/);
});
