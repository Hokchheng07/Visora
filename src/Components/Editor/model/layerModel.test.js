import test from "node:test";
import assert from "node:assert/strict";
import { checkInvariants, cleanName, cloneLayers, effectiveLocked, effectiveVisible, layerLabel, layerRows, moveLayer,
  nextPageName, normalizeGroups, pageLabel } from "./layerModel.js";

const el = (id, extra = {}) => ({ id, type: "shape", shape: "square", ...extra });
const ids = (elements) => elements.map((element) => element.id);

test("names are trimmed, capped at 80 characters, and empty means no name", () => {
  assert.equal(cleanName("  Agenda  "), "Agenda");
  assert.equal(cleanName("x".repeat(120)).length, 80);
  assert.equal(cleanName("   "), "");
  assert.equal(cleanName(undefined), "");
});

test("fallback labels are computed from the layer, never stored", () => {
  assert.equal(pageLabel({}, 2), "Page 3");
  assert.equal(pageLabel({ name: "Agenda" }, 2), "Agenda");
  assert.equal(layerLabel({ type: "text", content: "  Welcome\n  everyone " }), "Welcome everyone");
  assert.equal(layerLabel({ type: "text", content: "a".repeat(60) }).length, 40);
  assert.equal(layerLabel({ type: "timer" }), "Countdown timer");
  assert.equal(layerLabel({ type: "shape", shape: "star" }), "Star");
  assert.equal(layerLabel({ type: "shape", shape: "star", name: "Gold star" }), "Gold star");
});

test("a new page takes the first unused Page N", () => {
  assert.equal(nextPageName([{}, {}]), "Page 3");
  assert.equal(nextPageName([{}, { name: "Page 3" }]), "Page 4");
});

test("group visibility and lock apply to members without overwriting their own flags", () => {
  const page = { groups: [{ id: "g", name: "Group 1", visible: false, locked: true }], elements: [el("a", { groupId: "g", visible: true, locked: false }), el("b")] };
  assert.equal(effectiveVisible(page, page.elements[0]), false);
  assert.equal(effectiveLocked(page, page.elements[0]), true);
  assert.equal(page.elements[0].visible, true);
  assert.equal(effectiveVisible(page, page.elements[1]), true);
});

test("layer rows run front to back, with a group row before its members", () => {
  const page = { groups: [{ id: "g", name: "Header" }], elements: [el("back"), el("a", { groupId: "g" }), el("b", { groupId: "g" }), el("front")] };
  assert.deepEqual(layerRows(page).map((row) => `${row.kind}:${row.id}:${row.depth}`), ["element:front:0", "group:g:0", "element:b:1", "element:a:1", "element:back:0"]);
});

test("normalizeGroups drops dangling references, gathers split groups and removes empty ones", () => {
  const page = {
    groups: [{ id: "g" }, { id: "empty" }],
    elements: [el("a", { groupId: "g" }), el("x"), el("b", { groupId: "g" }), el("y", { groupId: "missing" })],
  };
  const tidy = normalizeGroups(page);
  assert.deepEqual(ids(tidy.elements), ["x", "a", "b", "y"]);
  assert.equal(tidy.elements[3].groupId, undefined);
  assert.deepEqual(tidy.groups.map((group) => group.id), ["g"]);
  assert.deepEqual(checkInvariants({ pages: [tidy] }), []);
  // A page that already follows the rules is returned as the same object.
  assert.equal(normalizeGroups(tidy), tidy);
});

test("cloneLayers gives new element and group ids and remaps groupId", () => {
  let n = 0;
  const groups = [{ id: "g", name: "Header" }, { id: "unused", name: "Other" }];
  const copy = cloneLayers([el("a", { groupId: "g" }), el("b", { groupId: "g" }), el("c")], groups, () => `new-${n++}`);
  assert.equal(copy.groups.length, 1);
  assert.notEqual(copy.groups[0].id, "g");
  assert.equal(copy.groups[0].name, "Header");
  assert.ok(copy.elements.every((element) => !["a", "b", "c"].includes(element.id)));
  assert.equal(copy.elements[0].groupId, copy.groups[0].id);
  assert.equal(copy.elements[2].groupId, undefined);
});

test("moveLayer never splits a group", () => {
  const elements = [el("a"), el("g1", { groupId: "g" }), el("g2", { groupId: "g" }), el("b")];
  // An ungrouped layer steps over the whole group block.
  assert.deepEqual(ids(moveLayer(elements, "a", 1)), ["g1", "g2", "a", "b"]);
  assert.deepEqual(ids(moveLayer(elements, "b", -1)), ["a", "b", "g1", "g2"]);
  // A grouped layer moves only among its own group.
  assert.deepEqual(ids(moveLayer(elements, "g1", 1)), ["a", "g2", "g1", "b"]);
  assert.equal(moveLayer(elements, "g2", 5), elements);
  assert.deepEqual(ids(moveLayer(elements, "a", elements.length)), ["g1", "g2", "b", "a"]);
  assert.equal(moveLayer(elements, "a", -1), elements);
});

test("checkInvariants names every broken rule", () => {
  const problems = checkInvariants({ pages: [
    { groups: [{ id: "g" }, { id: "empty" }], elements: [el("a", { groupId: "g" }), el("x"), el("b", { groupId: "g" }), el("c", { groupId: "nope" })] },
    { groups: [{ id: "g" }], elements: [el("a", { groupId: "g" })] },
  ] });
  for (const expected of [/split apart/, /is empty/, /missing group nope/, /group id g is used twice/, /element id a is used twice/]) {
    assert.ok(problems.some((problem) => expected.test(problem)), `expected ${expected}`);
  }
});
