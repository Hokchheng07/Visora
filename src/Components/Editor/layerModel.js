import { shapeName } from "./shapeCatalog.js";
import { selectionBounds } from "./elementGeometry.js";

// A whole group is a top-level block; direct selection keeps children at their own level.
export function selectionLevel(page, ids, mode = "auto") {
  const chosen = new Set(ids);
  const items = page.elements.filter((item) => chosen.has(item.id));
  if (!items.length || items.length !== chosen.size) return null;
  const groupId = items[0].groupId;
  if (groupId && items.every((item) => item.groupId === groupId)
    && (mode === "direct" || page.elements.some((item) => item.groupId === groupId && !chosen.has(item.id)))) {
    return { level: "group", groupId };
  }
  if (items.some((item) => item.groupId && page.elements.some((other) => other.groupId === item.groupId && !chosen.has(other.id)))) return null;
  return { level: "top" };
}

function blocksAt(page, level) {
  if (level.level === "group") return page.elements.filter((item) => item.groupId === level.groupId).map((item) => [item]);
  const blocks = [];
  for (const item of page.elements) {
    if (item.groupId && blocks.at(-1)?.[0].groupId === item.groupId) blocks.at(-1).push(item);
    else blocks.push([item]);
  }
  return blocks;
}

export function selectionBlocks(page, ids, mode) {
  const level = selectionLevel(page, ids, mode);
  return level ? blocksAt(page, level).filter((block) => block.some((item) => ids.includes(item.id))) : [];
}

function replaceLevel(page, level, blocks) {
  const members = blocks.flat();
  const next = level.level === "top" ? members : page.elements.flatMap((item, index, list) => {
    if (item.groupId !== level.groupId) return [item];
    return index === list.findIndex((other) => other.groupId === level.groupId) ? members : [];
  });
  return next.every((item, index) => item === page.elements[index]) ? page.elements : next;
}

export function reorderLayers(elements, ids, targetId, placement, mode) {
  const page = { elements }, level = selectionLevel(page, ids, mode);
  if (!level || !["before", "after"].includes(placement)) return elements;
  const blocks = blocksAt(page, level);
  const moving = blocks.filter((block) => block.some((item) => ids.includes(item.id)));
  if (moving.some((block) => block.some((item) => item.id === targetId))) return elements;
  const rest = blocks.filter((block) => !moving.includes(block));
  const at = rest.findIndex((block) => block.some((item) => item.id === targetId || item.groupId === targetId));
  if (at < 0) return elements;
  rest.splice(at + (placement === "after" ? 1 : 0), 0, ...moving);
  return replaceLevel(page, level, rest);
}

export function stepLayers(page, ids, direction, mode) {
  const level = selectionLevel(page, ids, mode);
  if (!level || !["forward", "backward", "front", "back"].includes(direction)) return page.elements;
  const blocks = blocksAt(page, level);
  const moving = blocks.filter((block) => block.some((item) => ids.includes(item.id)));
  const rest = blocks.filter((block) => !moving.includes(block));
  if (!rest.length) return page.elements;
  let at;
  if (direction === "front") at = rest.length;
  else if (direction === "back") at = 0;
  else if (direction === "forward") {
    const next = blocks.slice(blocks.indexOf(moving.at(-1)) + 1).find((block) => !moving.includes(block));
    if (!next) return page.elements;
    at = rest.indexOf(next) + 1;
  } else {
    const prev = blocks.slice(0, blocks.indexOf(moving[0])).reverse().find((block) => !moving.includes(block));
    if (!prev) return page.elements;
    at = rest.indexOf(prev);
  }
  rest.splice(at, 0, ...moving);
  return replaceLevel(page, level, rest);
}

export function moveIntoGroup(page, ids, groupId, targetId = null, placement = "after") {
  const group = (page.groups || []).find((item) => item.id === groupId);
  const items = page.elements.filter((item) => ids.includes(item.id));
  if (!group || group.locked || !items.length || items.length !== new Set(ids).size
    || items.some((item) => item.groupId || effectiveLocked(page, item)) || !["before", "after"].includes(placement)) return page;
  const rest = page.elements.filter((item) => !ids.includes(item.id));
  const target = targetId ? rest.findIndex((item) => item.id === targetId && item.groupId === groupId)
    : rest.findLastIndex((item) => item.groupId === groupId);
  if (target < 0) return page;
  rest.splice(target + (!targetId || placement === "after" ? 1 : 0), 0, ...items.map((item) => ({ ...item, groupId })));
  return normalizeGroups({ ...page, elements: rest });
}

export function removeFromGroup(page, ids, targetId, placement) {
  const level = selectionLevel(page, ids, "direct");
  if (level?.level !== "group" || !["before", "after"].includes(placement)) return page;
  const items = page.elements.filter((item) => ids.includes(item.id));
  if (items.some((item) => effectiveLocked(page, item))) return page;
  const blocks = blocksAt(page, { level: "top" });
  const target = blocks.find((block) => block.some((item) => item.id === targetId || item.groupId === targetId));
  if (!target || target[0].groupId === level.groupId) return page;
  const rest = page.elements.filter((item) => !ids.includes(item.id));
  const at = placement === "after" ? rest.indexOf(target.at(-1)) + 1 : rest.indexOf(target[0]);
  rest.splice(at, 0, ...items.map(({ groupId: _groupId, ...item }) => item));
  return normalizeGroups({ ...page, elements: rest });
}

/*
 * Layers leaving a page, ready to be added to the front of another one.
 * A group travels with its metadata only when every member is moving; a child
 * moving on its own leaves the group behind. Geometry, ids, names, visibility
 * and locking are untouched, and the source page is repaired afterwards, so a
 * group emptied by the move disappears with it.
 *
 * (When morphKey lands, the caller re-keys any moved layer whose key already
 * exists on the destination page.)
 */
export function detachLayers(page, ids) {
  const moving = page.elements.filter((item) => ids.includes(item.id));
  if (!moving.length || moving.length !== new Set(ids).size) return null;
  if (moving.some((item) => effectiveLocked(page, item))) return null;
  const whole = (page.groups || []).filter((group) => {
    const members = groupMembers(page, group.id);
    return members.length && members.every((item) => ids.includes(item.id));
  });
  const kept = new Set(whole.map((group) => group.id));
  const source = normalizeGroups({ ...page, elements: page.elements.filter((item) => !ids.includes(item.id)) });
  return {
    source: { elements: source.elements, groups: source.groups || [] },
    moved: {
      elements: moving.map((item) => (kept.has(item.groupId) ? { ...item } : (({ groupId: _groupId, ...rest }) => rest)(item))),
      groups: whole.map((group) => ({ ...group })),
    },
  };
}

export function canGroup(page, ids) {
  const items = page.elements.filter((item) => ids.includes(item.id));
  return items.length >= 2 && items.length === new Set(ids).size && items.every((item) => !item.groupId && !effectiveLocked(page, item));
}

export function groupSelection(page, ids, makeId, name) {
  if (!canGroup(page, ids)) return page;
  const groupId = makeId();
  const grouped = normalizeGroups({ ...page, groups: [...(page.groups || []), { id: groupId, name, visible: true, locked: false }],
    elements: page.elements.map((item) => ids.includes(item.id) ? { ...item, groupId } : item) });
  return { ...grouped, groupId };
}

export function ungroupSelection(page, groupId) {
  const members = groupMembers(page, groupId);
  if (!members.length || members.some((item) => effectiveLocked(page, item))) return page;
  return { ...page, groups: (page.groups || []).filter((group) => group.id !== groupId),
    elements: page.elements.map((item) => item.groupId === groupId ? (({ groupId: _id, ...rest }) => rest)(item) : item),
    memberIds: members.map((item) => item.id) };
}

export const groupBounds = (page, groupId) => selectionBounds(groupMembers(page, groupId).filter((item) => effectiveVisible(page, item)));

// Picking a visible member picks the whole unlocked group, including hidden members in its identity.
export function expandCanvasSelection(page, ids) {
  const picked = new Set();
  for (const item of page.elements) {
    if (!ids.includes(item.id) || !canvasSelectable(page, item)) continue;
    const members = item.groupId ? groupMembers(page, item.groupId) : [item];
    if (members.some((member) => effectiveLocked(page, member))) continue;
    members.forEach((member) => picked.add(member.id));
  }
  return page.elements.filter((item) => picked.has(item.id)).map((item) => item.id);
}

/*
 * Layers, groups and names.
 *
 * `page.elements` stays the one back-to-front render order. A group is only
 * metadata on the page — `{ id, name, visible, locked }` — and its members are
 * the elements carrying its `groupId`, kept next to each other in that array,
 * so the group's place in the stack is where its block sits. Bounds are never
 * stored; they come from the members.
 *
 * Every function here is pure: it reads plain objects and returns new ones, so
 * the reducers, hydration and tests all share one set of rules.
 */

export const NAME_MAX = 80;

/* A typed name, cleaned: trimmed and cut to 80 characters. An empty result
   means "no name", never an empty label. */
export function cleanName(value) {
  return typeof value === "string" ? value.trim().slice(0, NAME_MAX) : "";
}

export const pageLabel = (page, index) => cleanName(page?.name) || `Page ${index + 1}`;

/* Fallback names are computed, never stored, so a text layer's label follows
   its words until someone names it. */
export function layerLabel(element) {
  const name = cleanName(element?.name);
  if (name) return name;
  if (element?.type === "timer") return "Countdown timer";
  if (element?.type === "text") {
    const words = String(element.content || "").replace(/\s+/g, " ").trim();
    return words ? (words.length > 40 ? `${words.slice(0, 39)}…` : words) : "Empty text";
  }
  // Figma calls a shape whose points were edited a Vector.
  return element?.shape === "custom" ? "Vector" : shapeName(element?.shape);
}

// The first unused "Page N", counting from the page's position.
export function nextPageName(pages) {
  const taken = new Set(pages.map(pageLabel));
  let number = pages.length + 1;
  while (taken.has(`Page ${number}`)) number++;
  return `Page ${number}`;
}

export function nextGroupName(pages) {
  const taken = new Set(pages.flatMap((page) => (page.groups || []).map((group) => group.name)));
  let number = 1;
  while (taken.has(`Group ${number}`)) number++;
  return `Group ${number}`;
}

export const groupOf = (page, element) => (element?.groupId ? (page.groups || []).find((group) => group.id === element.groupId) || null : null);
export const groupMembers = (page, groupId) => page.elements.filter((element) => element.groupId === groupId);

// A layer inside a hidden group is hidden, whatever its own flag says; showing the group gives the child its own state back.
export const effectiveVisible = (page, element) => element.visible !== false && groupOf(page, element)?.visible !== false;
export const effectiveLocked = (page, element) => element.locked === true || groupOf(page, element)?.locked === true;

// What the canvas may pick by click, marquee or Select all.
export const canvasSelectable = (page, element) => effectiveVisible(page, element) && !effectiveLocked(page, element);
export const visibleElements = (page) => page.elements.filter((element) => effectiveVisible(page, element));

/* Rows for the Layers panel, front to back. A group is one row followed by its
   members, indented; its position is that of its block. */
export function layerRows(page) {
  const rows = [];
  const groups = new Map((page.groups || []).map((group) => [group.id, group]));
  const seen = new Set();
  for (const element of [...page.elements].reverse()) {
    const group = groups.get(element.groupId);
    if (group && !seen.has(group.id)) {
      seen.add(group.id);
      rows.push({ kind: "group", id: group.id, group, depth: 0 });
    }
    rows.push({ kind: "element", id: element.id, element, group: group || null, depth: group ? 1 : 0 });
  }
  return rows;
}

/* A group is selected when the selection is exactly its members and the
   selection was made as a group. Worked out every time, so undo, delete or a
   page switch can never leave a stale group selected. */
export function selectedGroup(editor) {
  if (editor.selectionMode !== "group" || !editor.selectedIds.length) return null;
  const page = editor.pages[editor.currentPage];
  const first = page.elements.find((element) => element.id === editor.selectedIds[0]);
  const group = groupOf(page, first);
  if (!group) return null;
  const members = groupMembers(page, group.id);
  const chosen = new Set(editor.selectedIds);
  return members.length === chosen.size && members.every((element) => chosen.has(element.id)) ? group : null;
}

/*
 * Repairs a page's groups so the invariants hold: references to missing groups
 * are dropped, members are gathered into one block where their frontmost member
 * sits, and groups with no members are removed. Pages that already follow the
 * rules come back unchanged (same order, same objects).
 */
export function normalizeGroups(page) {
  const groups = (page.groups || []).filter((group, index, list) => group && typeof group.id === "string" && list.findIndex((item) => item?.id === group.id) === index);
  const known = new Set(groups.map((group) => group.id));
  let elements = page.elements.map((element) => {
    if (element.groupId === undefined || known.has(element.groupId)) return element;
    const { groupId: _dropped, ...rest } = element;
    return rest;
  });
  for (const group of groups) {
    const indexes = elements.flatMap((element, index) => (element.groupId === group.id ? [index] : []));
    if (indexes.length < 2 || indexes.at(-1) - indexes[0] === indexes.length - 1) continue;
    const members = indexes.map((index) => elements[index]);
    const rest = elements.filter((element) => element.groupId !== group.id);
    // Everything that was behind the frontmost member stays behind the block.
    const insertAt = indexes.at(-1) - (indexes.length - 1);
    elements = [...rest.slice(0, insertAt), ...members, ...rest.slice(insertAt)];
  }
  const used = new Set(elements.map((element) => element.groupId).filter(Boolean));
  const kept = groups.filter((group) => used.has(group.id));
  const unchanged = kept.length === (page.groups || []).length && elements.every((element, index) => element === page.elements[index]);
  return unchanged ? page : { ...page, groups: kept, elements };
}

/*
 * Copies of layers with fresh identities: new element ids and new group ids,
 * with every groupId pointed at its new group. Groups nobody in `elements`
 * belongs to are left behind. Used by page duplicate, page paste and element
 * paste, so a copy can never share a group with its original.
 */
export function cloneLayers(elements, groups = [], makeId) {
  const used = new Set(elements.map((element) => element.groupId).filter(Boolean));
  const ids = new Map(groups.filter((group) => used.has(group.id)).map((group) => [group.id, makeId()]));
  const idMap = new Map(elements.map((element) => [element.id, makeId()]));
  return {
    idMap,
    groups: groups.filter((group) => ids.has(group.id)).map((group) => ({ ...group, id: ids.get(group.id) })),
    elements: elements.map((element) => {
      const { groupId, ...rest } = element;
      const clone = { ...rest, id: idMap.get(element.id), morphId: element.morphId || element.id };
      return ids.has(groupId) ? { ...clone, groupId: ids.get(groupId) } : clone;
    }),
  };
}

/*
 * Moves one layer through the stack without breaking a group apart. A grouped
 * layer moves among its own group's members; an ungrouped layer steps over a
 * whole group block at a time. `delta` counts steps, so ±Infinity (or the
 * element count) means front or back.
 */
export function moveLayer(elements, id, delta) {
  const from = elements.findIndex((element) => element.id === id);
  if (from < 0 || !delta) return elements;
  const element = elements[from];
  const blocks = [];
  if (element.groupId) {
    const indexes = elements.flatMap((item, index) => (item.groupId === element.groupId ? [index] : []));
    const start = indexes[0], members = indexes.map((index) => elements[index]);
    const at = members.indexOf(element);
    const to = Math.max(0, Math.min(members.length - 1, at + delta));
    if (to === at) return elements;
    const reordered = [...members]; reordered.splice(at, 1); reordered.splice(to, 0, element);
    return [...elements.slice(0, start), ...reordered, ...elements.slice(start + members.length)];
  }
  for (const item of elements) {
    const last = blocks.at(-1);
    if (item.groupId && last?.[0].groupId === item.groupId) last.push(item);
    else blocks.push([item]);
  }
  const at = blocks.findIndex((block) => block[0] === element);
  const to = Math.max(0, Math.min(blocks.length - 1, at + delta));
  if (to === at) return elements;
  const [block] = blocks.splice(at, 1); blocks.splice(to, 0, block);
  return blocks.flat();
}

/*
 * The layer rules, checked. Returns a list of plain-language violations — an
 * empty list means the document is sound. Reducer tests run this after every
 * action, so a future change cannot quietly split a group.
 */
export function checkInvariants(editor) {
  const problems = [];
  const elementIds = new Set(), groupIds = new Set();
  editor.pages.forEach((page, pageIndex) => {
    const where = `page ${pageIndex + 1}`;
    const groups = page.groups || [];
    for (const group of groups) {
      if (groupIds.has(group.id)) problems.push(`${where}: group id ${group.id} is used twice`);
      groupIds.add(group.id);
      if (group.groupId) problems.push(`${where}: group ${group.id} is nested`);
    }
    const local = new Set(groups.map((group) => group.id));
    for (const element of page.elements) {
      if (elementIds.has(element.id)) problems.push(`${where}: element id ${element.id} is used twice`);
      elementIds.add(element.id);
      if (element.groupId && !local.has(element.groupId)) problems.push(`${where}: ${element.id} points at missing group ${element.groupId}`);
    }
    for (const group of groups) {
      const indexes = page.elements.flatMap((element, index) => (element.groupId === group.id ? [index] : []));
      if (!indexes.length) problems.push(`${where}: group ${group.id} is empty`);
      else if (indexes.at(-1) - indexes[0] !== indexes.length - 1) problems.push(`${where}: group ${group.id} is split apart`);
    }
  });
  return problems;
}
