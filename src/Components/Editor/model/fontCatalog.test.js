import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  EDITOR_FONTS, fontSupportsKhmer, fontWeightOptions, normalizeFontWeight,
} from "./fontCatalog.js";

test("editor font families are unique and all have a local font face", () => {
  const families = EDITOR_FONTS.map((font) => font.value);
  assert.equal(families.length, 37);
  assert.equal(new Set(families).size, families.length);

  const css = ["../../../styles/foundation.css", "../../../styles/editor-fonts.css"]
    .map((path) => readFileSync(new URL(path, import.meta.url), "utf8"))
    .join("\n");
  for (const family of families) assert.match(css, new RegExp(`font-family: "${family}"`));

  const publicFonts = new URL("../../../../public/fonts/", import.meta.url);
  for (const [, encodedPath] of css.matchAll(/url\("\/fonts\/([^"?]+)"\)/g)) {
    assert.equal(existsSync(new URL(decodeURIComponent(encodedPath), publicFonts)), true, `${encodedPath} is missing`);
  }
});

test("weight choices follow the files that were added", () => {
  assert.deepEqual(fontWeightOptions("Pacifico"), [{ value: "400", label: "Regular" }]);
  assert.deepEqual(fontWeightOptions("Hanuman").map((option) => option.value), ["400", "500", "600", "700"]);
  assert.deepEqual(fontWeightOptions("Inter").map((option) => option.value), ["400", "500", "600", "700"]);
  assert.deepEqual(fontWeightOptions("Tinos"), [{ value: "400", label: "Regular" }]);
  assert.equal(normalizeFontWeight("Pacifico", 700), 400);
  assert.equal(normalizeFontWeight("Signika", 700), 700);
});

test("Khmer support distinguishes Khmer fonts from Latin-only display fonts", () => {
  assert.equal(fontSupportsKhmer("Battambang"), true);
  assert.equal(fontSupportsKhmer("Freehand"), true);
  assert.equal(fontSupportsKhmer("Lobster"), false);
});
