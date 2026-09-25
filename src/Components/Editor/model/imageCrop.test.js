import assert from "node:assert/strict";
import test from "node:test";
import { cropDragDelta, cropStyle, DEFAULT_CROP, isDefaultCrop, MAX_ZOOM, normalizeCrop, panCrop, serializeCrop } from "./imageCrop.js";

test("a missing or broken crop is the whole photo, centred", () => {
  assert.deepEqual(normalizeCrop(undefined), DEFAULT_CROP);
  assert.deepEqual(normalizeCrop(null), DEFAULT_CROP);
  assert.deepEqual(normalizeCrop("nonsense"), DEFAULT_CROP);
  assert.deepEqual(normalizeCrop({}), DEFAULT_CROP);
});

test("position stays inside the photo and zoom never goes below natural size", () => {
  assert.deepEqual(normalizeCrop({ x: -3, y: 9, zoom: 0.2 }), { x: 0, y: 1, zoom: 1 });
  assert.equal(normalizeCrop({ zoom: 99 }).zoom, MAX_ZOOM);
});

test("only a crop that changes something is saved", () => {
  assert.equal(serializeCrop(DEFAULT_CROP), null);
  assert.equal(serializeCrop(undefined), null);
  assert.deepEqual(serializeCrop({ x: 0.2, y: 0.5, zoom: 2 }), { x: 0.2, y: 0.5, zoom: 2 });
  assert.equal(isDefaultCrop({ x: 0.5, y: 0.5, zoom: 1 }), true);
  assert.equal(isDefaultCrop({ x: 0.5, y: 0.5, zoom: 1.5 }), false);
});

test("the default crop asks CSS for nothing it would not have done anyway", () => {
  assert.deepEqual(cropStyle(DEFAULT_CROP), { objectPosition: "50% 50%" });
  assert.deepEqual(cropStyle({ x: 0, y: 1, zoom: 2 }), { objectPosition: "0% 100%", scale: "2" });
});

test("flipping an image does not mirror its chosen crop position", () => {
  const crop = { x: 0.2, y: 0.8, zoom: 2 };
  assert.deepEqual(cropStyle(crop), { objectPosition: "20% 80%", scale: "2" });
  assert.deepEqual(cropStyle(crop, { flipX: true }), { objectPosition: "80% 80%", scale: "2" });
  assert.deepEqual(cropStyle(crop, { flipY: true }), { objectPosition: "20% 20%", scale: "2" });
  assert.deepEqual(cropStyle(crop, { flipX: true, flipY: true }), { objectPosition: "80% 20%", scale: "2" });
});

test("dragging right shows what was off to the left, and stops at the edge", () => {
  assert.equal(panCrop(DEFAULT_CROP, 100, 0, 1000, 500).x, 0.4);
  assert.equal(panCrop(DEFAULT_CROP, 0, -50, 1000, 500).y, 0.6);
  assert.equal(panCrop(DEFAULT_CROP, 5000, 0, 1000, 500).x, 0);
  assert.equal(panCrop(DEFAULT_CROP, -5000, 0, 1000, 500).x, 1);
});

test("a drag keeps the zoom it was made at", () => {
  assert.equal(panCrop({ ...DEFAULT_CROP, zoom: 2.5 }, 10, 10, 800, 400).zoom, 2.5);
});

test("crop dragging follows the screen even when the image frame is rotated", () => {
  assert.deepEqual(cropDragDelta(20, 10, 0), { x: 20, y: 10 });
  const upsideDown = cropDragDelta(20, 10, 180);
  assert.ok(Math.abs(upsideDown.x + 20) < 1e-10);
  assert.ok(Math.abs(upsideDown.y + 10) < 1e-10);
  const quarterTurn = cropDragDelta(20, 10, 90);
  assert.ok(Math.abs(quarterTurn.x - 10) < 1e-10);
  assert.ok(Math.abs(quarterTurn.y + 20) < 1e-10);
});
