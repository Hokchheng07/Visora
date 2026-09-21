import assert from "node:assert/strict";
import test from "node:test";
import { fontFamilies } from "./exportFonts.js";

const page = (...elements) => ({ elements });

test("every family the text and timers use, across pages", () => {
  assert.deepEqual(
    fontFamilies([page({ type: "text", fontFamily: "Poppins" }), page({ type: "timer", fontFamily: "Freehand" })]),
    ["Poppins", "Freehand"],
  );
});

test("a family is listed once however often it is used", () => {
  assert.deepEqual(
    fontFamilies([page({ type: "text", fontFamily: "Freehand" }, { type: "text", fontFamily: "Freehand" })]),
    ["Freehand"],
  );
});

test("shapes and images have no type, so they add none", () => {
  assert.deepEqual(fontFamilies([page({ type: "shape" }, { type: "image" }, { type: "text", fontFamily: "Freehand" })]), ["Freehand"]);
});

test("text with no family of its own falls back to the default", () => {
  assert.deepEqual(fontFamilies([page({ type: "text" })]), ["Poppins"]);
});

test("a design with no text still asks for the default", () => {
  assert.deepEqual(fontFamilies([page({ type: "shape" })]), ["Poppins"]);
  assert.deepEqual(fontFamilies([]), ["Poppins"]);
  assert.deepEqual(fontFamilies(null), ["Poppins"]);
});
