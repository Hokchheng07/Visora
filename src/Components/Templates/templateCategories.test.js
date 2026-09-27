import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_TEMPLATE_CATEGORIES,
  normalizeSelectedCategories,
  templateCategoryNames,
  templateCategoryPayload,
  templateCategoryUuids,
} from "./templateCategories.js";

test("reads multi-category responses before legacy scalar fields", () => {
  const template = {
    categories: [{ uuid: "workshop-id", name: "Workshop" }, { uuid: "school-id", name: "School Event" }],
    eventType: "Workshop",
    categoryUuid: "workshop-id",
  };

  assert.deepEqual(templateCategoryNames(template), ["Workshop", "School Event"]);
  assert.deepEqual(templateCategoryUuids(template), ["workshop-id", "school-id"]);
});

test("keeps legacy templates searchable by their single category", () => {
  assert.deepEqual(templateCategoryNames({ eventType: "Examination" }), ["Examination"]);
  assert.deepEqual(templateCategoryUuids({ categoryUuid: "exam-id" }), ["exam-id"]);
});

test("deduplicates selections and caps them at the server's one", () => {
  const selected = normalizeSelectedCategories([
    { uuid: "1", name: "One" },
    { uuid: "1", name: "One again" },
    { uuid: "2", name: "Two" },
    { uuid: "3", name: "Three" },
    { uuid: "4", name: "Four" },
    { uuid: "5", name: "Five" },
    { uuid: "6", name: "Six" },
  ]);

  assert.equal(selected.length, MAX_TEMPLATE_CATEGORIES);
  assert.deepEqual(selected.map((category) => category.uuid), ["1"]);
});

test("builds array fields with scalar compatibility fields, one category only", () => {
  assert.deepEqual(templateCategoryPayload([
    { uuid: "exam-id", name: "Examination" },
    { uuid: "school-id", name: "School Event" },
  ]), {
    categoryUuids: ["exam-id"],
    eventTypes: ["Examination"],
    categoryUuid: "exam-id",
    eventType: "Examination",
  });
});
