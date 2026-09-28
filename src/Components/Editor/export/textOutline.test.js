import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as hb from "harfbuzzjs";
import { cssWeight, makeFont, outlineRuns, pickFace, placePath, textMarkup, underlineRects } from "./textOutline.js";

const font = (file, options) => {
  const data = readFileSync(new URL(`../../../../public/fonts/${file}`, import.meta.url));
  return makeFont(hb, data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength), options);
};

const faces = [
  { family: "Poppins", url: "/r", style: "normal", min: 400, max: 400 },
  { family: "Poppins", url: "/m", style: "normal", min: 500, max: 500 },
  { family: "Poppins", url: "/b", style: "normal", min: 700, max: 700 },
  { family: "Roboto", url: "/rv", style: "normal", min: 100, max: 900 },
  { family: "Roboto", url: "/ri", style: "italic", min: 100, max: 900 },
  { family: "Moul", url: "/moul", style: "normal", min: 400, max: 400 },
];

test("cssWeight reads keywords and numbers", () => {
  assert.equal(cssWeight("bold"), 700);
  assert.equal(cssWeight("normal"), 400);
  assert.equal(cssWeight(undefined), 400);
  assert.equal(cssWeight("600"), 600);
});

test("pickFace takes the face whose weight range holds the weight", () => {
  assert.equal(pickFace(faces, "Poppins", 500, false).face.url, "/m");
  assert.equal(pickFace(faces, "roboto", 650, false).face.url, "/rv");
  assert.equal(pickFace(faces, "Roboto", 650, false).weight, 650);
  assert.equal(pickFace(faces, "Roboto", 400, true).face.url, "/ri");
});

test("pickFace falls back the way CSS does: heavier above 500, lighter at 400 and below", () => {
  assert.equal(pickFace(faces, "Poppins", 600, false).face.url, "/b");
  assert.equal(pickFace(faces, "Poppins", 300, false).face.url, "/r");
});

test("pickFace flags the styles the browser would fake", () => {
  assert.equal(pickFace(faces, "Moul", 700, false).syntheticBold, true);
  assert.equal(pickFace(faces, "Poppins", 400, true).syntheticItalic, true);
  assert.equal(pickFace(faces, "Poppins", 700, false).syntheticBold, false);
  assert.equal(pickFace(faces, "Nope", 400, false), null);
});

test("placePath scales, flips y and moves a glyph path", () => {
  assert.equal(placePath("M10,20L30,-40Z", 0.5, 100, 200), "M105,190L115,220Z");
});

test("Khmer is shaped with its subscripts, and every glyph exists", () => {
  const battambang = font("Battambang-Regular.ttf");
  const { d, missing } = outlineRuns(hb, battambang, [{ text: "សួស្តី", x: 0, baseline: 50 }], { size: 40 });
  assert.equal(missing, false);
  assert.match(d, /^M/);
  // Two clusters' worth of stacked glyphs, not one path per code point in a row.
  assert.ok((d.match(/M/g) || []).length > 3);
});

test("a character the font lacks is reported, so the caller can keep a picture", () => {
  const poppins = font("Poppins-Regular.ttf");
  assert.equal(outlineRuns(hb, poppins, [{ text: "សួស្តី", x: 0, baseline: 0 }], { size: 20 }).missing, true);
  assert.equal(outlineRuns(hb, poppins, [{ text: "Hello", x: 0, baseline: 0 }], { size: 20 }).missing, false);
});

test("letter spacing is added after every character", () => {
  const poppins = font("Poppins-Regular.ttf");
  const firstX = (d) => d.match(/M(-?[\d.]+),/g).map((move) => Number(move.slice(1, -1)));
  const plain = firstX(outlineRuns(hb, poppins, [{ text: "ll", x: 0, baseline: 0 }], { size: 100 }).d);
  const spaced = firstX(outlineRuns(hb, poppins, [{ text: "ll", x: 0, baseline: 0 }], { size: 100, letterSpacing: 10 }).d);
  assert.equal(Math.round((spaced[1] - spaced[0]) - (plain[1] - plain[0])), 10);
});

test("a variable face is drawn at the weight asked for", () => {
  const thin = outlineRuns(hb, font("Inter[opsz,wght].ttf", { weight: 100, size: 40 }), [{ text: "l", x: 0, baseline: 0 }], { size: 40 }).d;
  const black = outlineRuns(hb, font("Inter[opsz,wght].ttf", { weight: 900, size: 40 }), [{ text: "l", x: 0, baseline: 0 }], { size: 40 }).d;
  assert.notEqual(thin, black);
});

test("underlines run from the first word to the end of the last, one per line", () => {
  const runs = [{ x: 10, right: 40, baseline: 50 }, { x: 50, right: 90, baseline: 50 }, { x: 5, right: 30, baseline: 100 }];
  assert.deepEqual(underlineRects(runs, { offset: 4, thickness: 2 }), [
    { x: 10, y: 54, width: 80, height: 2 },
    { x: 5, y: 104, width: 25, height: 2 },
  ]);
});

test("textMarkup puts the outline stroke behind the letters", () => {
  const markup = textMarkup({ fill: "#111111", stroke: "#FF0000", strokeWidth: 3 }, "M0,0Z", [{ x: 0, y: 1, width: 2, height: 1 }]);
  assert.ok(markup.indexOf('stroke="#FF0000"') < markup.indexOf('fill="#111111"'));
  assert.match(markup, /stroke-width="6"/);
  assert.match(markup, /<rect x="0" y="1" width="2" height="1" fill="#111111"\/>/);
  assert.equal(textMarkup({ fill: "#000" }, ""), "");
});
