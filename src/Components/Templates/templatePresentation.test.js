import assert from "node:assert/strict";
import test from "node:test";

import {
  getTemplateCategoryTags,
  getTemplateFormat,
  templateHasTimer,
} from "./templatePresentation.js";

test("uses timer as a category when the API marks the template as timed", () => {
  const template = {
    eventType: "Examination",
    categories: ["Examination"],
    hasTimer: true,
    styles: ["Modern"],
  };

  assert.deepEqual(getTemplateCategoryTags(template), ["Examination", "Timer"]);
  assert.equal(templateHasTimer(template), true);
});

test("formats orientation and singular or plural page counts", () => {
  assert.equal(getTemplateFormat({ orientation: "LANDSCAPE", pageCount: 1 }).label, "Landscape · 1 page");
  assert.equal(getTemplateFormat({ orientation: "PORTRAIT", pageCount: 3 }).label, "Portrait · 3 pages");
});

test("keeps local sample cards on the same presentation contract", () => {
  const template = {
    type: "Examination",
    orientation: "Landscape",
    tags: ["Examination", "Timer", "Clean"],
    preview: { timer: "01:30:00" },
  };

  assert.deepEqual(getTemplateCategoryTags(template), ["Examination", "Timer"]);
  assert.equal(getTemplateFormat(template).label, "Landscape · 1 page");
});

test("accepts the modal's initial null template state", () => {
  assert.deepEqual(getTemplateCategoryTags(null), []);
  assert.equal(getTemplateFormat(null).label, "Landscape · 1 page");
  assert.equal(templateHasTimer(null), false);
});
