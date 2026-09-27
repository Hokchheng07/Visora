import test from "node:test";
import assert from "node:assert/strict";
import { categoryUpdate } from "./categoryUpdate.js";

const category = { uuid: "c1", name: "Examination", description: "Exams", displayOrder: 3, isActive: true, active: true };

test("an edit sends every primitive field, with the change on top", () => {
  assert.deepEqual(categoryUpdate(category, { name: "Exams", description: "Finals" }),
    { uuid: "c1", name: "Exams", description: "Finals", displayOrder: 3, isActive: true });
});

test("a toggle keeps the other fields and flips isActive", () => {
  assert.deepEqual(categoryUpdate(category, { isActive: false }),
    { uuid: "c1", name: "Examination", description: "Exams", displayOrder: 3, isActive: false });
});

test("missing primitives from the server get safe values, never null", () => {
  const body = categoryUpdate({ uuid: "c2", name: "New", isActive: null, displayOrder: null });
  assert.equal(body.isActive, true);
  assert.equal(body.displayOrder, 0);
  assert.equal(body.description, "");
  assert.equal(JSON.stringify(body).includes("null"), false);
});

test("a picked icon is saved with the rest of the category", () => {
  assert.equal(categoryUpdate(category, { icon: "trophy" }).icon, "trophy");
});
