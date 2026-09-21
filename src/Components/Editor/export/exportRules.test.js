import assert from "node:assert/strict";
import test from "node:test";
import { exportBlockedReason, hasTimer, isPhoto, pageImageFormat, TIMER_BLOCK_REASON } from "./exportRules.js";

const doc = (...types) => ({ pages: [{ elements: types.map((type, index) => ({ id: `e${index}`, type })) }] });

test("hasTimer finds a timer on any page", () => {
  assert.equal(hasTimer(doc("text", "shape")), false);
  assert.equal(hasTimer(doc("text", "timer")), true);
  assert.equal(hasTimer({ pages: [{ elements: [{ type: "text" }] }, { elements: [{ type: "timer" }] }] }), true);
});

test("hasTimer survives a missing or half-built document", () => {
  assert.equal(hasTimer(null), false);
  assert.equal(hasTimer({}), false);
  assert.equal(hasTimer({ pages: [{}] }), false);
});

test("a timer blocks the still formats only", () => {
  const timed = doc("timer");
  assert.equal(exportBlockedReason("pdf", timed), TIMER_BLOCK_REASON);
  assert.equal(exportBlockedReason("ai", timed), TIMER_BLOCK_REASON);
  assert.equal(exportBlockedReason("json", timed), null);
});

test("nothing is blocked without a timer", () => {
  const plain = doc("text", "shape", "image");
  assert.equal(exportBlockedReason("pdf", plain), null);
  assert.equal(exportBlockedReason("ai", plain), null);
});

test("a page of text and ornaments is drawn as PNG", () => {
  assert.equal(pageImageFormat({ elements: [{ type: "text" }, { type: "shape" }] }), "PNG");
  assert.equal(pageImageFormat({ elements: [{ type: "image", src: "library:corners/top-left" }] }), "PNG");
  assert.equal(pageImageFormat({ elements: [] }), "PNG");
  assert.equal(pageImageFormat(null), "PNG");
});

test("a page carrying an uploaded photo is drawn as JPEG", () => {
  assert.equal(pageImageFormat({ elements: [{ type: "image", src: "a1b2c3.jpg" }] }), "JPEG");
  assert.equal(pageImageFormat({ elements: [{ type: "text" }, { type: "image", src: "https://example.test/p.png" }] }), "JPEG");
});

test("only uploaded pictures count as photos", () => {
  assert.equal(isPhoto({ type: "image", src: "a1b2c3.jpg" }), true);
  assert.equal(isPhoto({ type: "image", src: "library:corners/top-left" }), false);
  assert.equal(isPhoto({ type: "shape" }), false);
  assert.equal(isPhoto(null), false);
});
