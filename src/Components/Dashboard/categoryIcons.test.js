import test from "node:test";
import assert from "node:assert/strict";
import { Shapes, Trophy, ClipboardCheck } from "lucide-react";
import { CATEGORY_ICONS, categoryIcon, guessCategoryIcon } from "./categoryIcons.js";

test("a saved icon wins over the name's guess", () => {
  assert.equal(categoryIcon("Final Examination", "trophy"), Trophy);
});

test("no saved icon, or an unknown key, falls back to the name", () => {
  assert.equal(categoryIcon("Final Examination"), ClipboardCheck);
  assert.equal(categoryIcon("Final Examination", "not-an-icon"), ClipboardCheck);
  assert.equal(categoryIcon("Something else"), Shapes);
});

test("every guess is a choice the picker offers", () => {
  const keys = new Set(CATEGORY_ICONS.map((choice) => choice.key));
  for (const name of ["Graduation", "Exam", "Workshop", "Seminar", "Khmer New Year", "Birthday", "Kids day", "Coding club", "Whatever"]) {
    assert.ok(keys.has(guessCategoryIcon(name)), name);
  }
});
