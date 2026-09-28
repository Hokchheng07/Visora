import test from "node:test";
import assert from "node:assert/strict";
import { hydrateDocument, serializeDocument } from "./editorDocument.js";
import {
  gradientPageBackground, normalizePageBackground, pageBackgroundColor, pageBackgroundCss, solidPageBackground,
} from "./pageBackground.js";
import { defaultGradient } from "./shapePaint.js";

test("a solid page stays compatible with the existing COLOR background", () => {
  assert.deepEqual(solidPageBackground("#112233"), { type: "COLOR", value: "#112233" });
  assert.deepEqual(normalizePageBackground({ type: "NOPE", value: "javascript:bad" }), { type: "COLOR", value: "#FFFFFF" });
  assert.equal(pageBackgroundCss(null), "#FFFFFF");
});

test("a gradient page has a CSS ramp and a solid fallback", () => {
  const background = gradientPageBackground(defaultGradient("#112233", "#A78DFF"), "#112233");
  assert.equal(background.type, "GRADIENT");
  assert.equal(background.value, "#112233");
  assert.equal(pageBackgroundColor(background), "#112233");
  assert.equal(pageBackgroundCss(background), "linear-gradient(180deg, #112233 0%, #A78DFF 100%)");
});

test("page gradients survive document save, API-shaped JSON and reload", () => {
  const background = gradientPageBackground({
    type: "LINEAR", angle: 35,
    stops: [{ offset: 0, color: "#112233", opacity: 1 }, { offset: 1, color: "#A78DFF", opacity: .8 }],
  });
  const editor = { title: "Gradient", pages: [{ id: "p1", background, elements: [] }] };
  const saved = serializeDocument(editor);
  assert.deepEqual(saved.pages[0].background, background);
  assert.deepEqual(hydrateDocument(saved).pages[0].background, background);
});
