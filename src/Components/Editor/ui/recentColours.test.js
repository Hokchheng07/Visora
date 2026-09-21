import assert from "node:assert/strict";
import test from "node:test";
import { MAX_RECENT_COLOURS, withRecentColour } from "./recentColours.js";

test("a new colour goes to the front", () => {
  assert.deepEqual(withRecentColour(["#111111"], "#222222"), ["#222222", "#111111"]);
});

test("a colour used again moves to the front instead of repeating", () => {
  assert.deepEqual(withRecentColour(["#111111", "#222222"], "#222222"), ["#222222", "#111111"]);
});

test("hex is stored in one case, so the same colour is one entry", () => {
  assert.deepEqual(withRecentColour(["#AABBCC"], "#aabbcc"), ["#AABBCC"]);
});

test("the row stops at its limit, dropping the oldest", () => {
  const full = Array.from({ length: MAX_RECENT_COLOURS }, (_, index) => `#${String(index).repeat(6)}`);
  const next = withRecentColour(full, "#ABCDEF");
  assert.equal(next.length, MAX_RECENT_COLOURS);
  assert.equal(next[0], "#ABCDEF");
  assert.equal(next.includes(full.at(-1)), false);
});

test("anything that is not a hex colour leaves the list alone", () => {
  const list = ["#111111"];
  assert.deepEqual(withRecentColour(list, "red"), list);
  assert.deepEqual(withRecentColour(list, null), list);
  assert.deepEqual(withRecentColour(list, "#FFF"), list);
});
