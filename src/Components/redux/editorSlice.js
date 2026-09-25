import { createSlice, current, nanoid } from "@reduxjs/toolkit";
import { clamp, clampSelectionDelta, fitElement, selectionBounds } from "../Editor/model/elementGeometry.js";
import { DEFAULT_PAGE, normalizePageSize, samePageSize, scalePagesToSize } from "../Editor/model/pageSize.js";
import { shapeCatalog } from "../Editor/model/shapeCatalog.js";
import { isPageNumber, normalizePageNumbers, pageNumberPlacement, syncPageNumbers } from "../Editor/model/pageNumbers.js";
import { defaultTimer, normalizeTimer } from "../Editor/model/editorDocument.js";
import { defaultClockFormat, formatClock } from "../Editor/model/clockText.js";
import { DEFAULT_EDITOR_TEXT_COLOR } from "../Editor/model/editorDefaults.js";
import { appendAnimations, extractAnimations, insertionRows, migrateAnimations, normalizeTransition, removeAnimationRows, remapAnimations, repairTimeline, validateTimeline } from "../Editor/animation/animationTimeline.js";
import { canvasSelectable, cleanName, effectiveVisible, cloneLayers, detachLayers, effectiveLocked, expandCanvasSelection, groupSelection, moveIntoGroup, nextGroupName, nextPageName, normalizeGroups, pageLabel,
  stepLayers, removeFromGroup, reorderLayers, selectedGroup, ungroupSelection } from "../Editor/model/layerModel.js";

export const initialEditorState = {
  documentId: "backdrop-local", title: "Untitled-1", version: 0,
  // The size of every page, in design pixels; see model/pageSize.js.
  canvas: { ...DEFAULT_PAGE },
  pages: [{ id: "page-initial", background: { type: "COLOR", value: "#FFFFFF" }, groups: [], elements: [] }],
  currentPage: 0, selectedIds: [], selectedId: null, selectionMode: "direct",
  /* Which pages the strip has picked out, by id so a reorder cannot rename the
     selection. It is view state: not in a snapshot, not undone. */
  selectedPages: ["page-initial"],
  pageNumbers: { enabled: false, position: "bottom-right", skipFirst: false },
  past: [], future: [], gesture: null, edit: null, pointEdit: null, cropping: null, copiedPage: null, copiedElements: [], copiedGroups: [], copiedAnimations: [], zoom: null, snapGuides: [],
};

/* Every selection change comes through here. `mode` is "group" only when a
   caller selects a whole group; anything else goes back to direct selection. */
function setSelection(state, ids, mode = "direct") {
  const valid = new Set(state.pages[state.currentPage].elements.map((element) => element.id));
  state.selectedIds = [...new Set(ids)].filter((id) => valid.has(id));
  state.selectedId = state.selectedIds.at(-1) || null;
  state.selectionMode = mode === "group" && state.selectedIds.length ? "group" : "direct";
  // Point editing belongs to one selected shape; selecting anything else ends it.
  if (state.pointEdit && !(state.selectedIds.length === 1 && state.selectedIds[0] === state.pointEdit.elementId)) state.pointEdit = null;
  // Cropping belongs to one selected photo, for the same reason.
  if (state.cropping && !(state.selectedIds.length === 1 && state.selectedIds[0] === state.cropping.elementId)) state.cropping = null;
}
const currentPageOf = (state) => state.pages[state.currentPage];
const pageSizeOf = (state) => normalizePageSize(state.canvas);
/* Locking is enforced here, not only by greyed-out buttons: every reducer that
   moves, restyles, reorders or deletes layers asks first, and a refused action
   changes nothing and adds no undo step. */
function isEditable(state, ids, page = currentPageOf(state)) {
  const chosen = new Set(ids);
  return !page.elements.some((element) => chosen.has(element.id) && effectiveLocked(page, element));
}
const selectionEditable = (state) => isEditable(state, state.selectedIds);
// Removes groups left with no members and gathers split groups back together.
function tidyGroups(page) {
  const plain = current(page), tidy = normalizeGroups(plain);
  if (tidy !== plain) { page.groups = tidy.groups; page.elements = tidy.elements; }
}
function snapshot(state) {
  const plain = current(state);
  return { pages: plain.pages, currentPage: plain.currentPage, selectedIds: plain.selectedIds, selectedId: plain.selectedId, selectionMode: plain.selectionMode, title: plain.title, pageNumbers: plain.pageNumbers, canvas: plain.canvas };
}
function remember(state, before = snapshot(state)) {
  state.past.push(before); if (state.past.length > 50) state.past.shift(); state.future = [];
}
function restore(state, saved) {
  state.pages = saved.pages; state.title = saved.title || state.title;
  if (saved.pageNumbers) state.pageNumbers = saved.pageNumbers;
  if (saved.canvas) state.canvas = saved.canvas;
  state.currentPage = clamp(saved.currentPage, 0, state.pages.length - 1);
  setSelection(state, saved.selectedIds || (saved.selectedId ? [saved.selectedId] : []), saved.selectionMode);
}
function cancelGesture(state) {
  if (state.gesture) restore(state, state.gesture.before);
  state.gesture = null; state.snapGuides = [];
}
/*
 * Inspector edit sessions.
 *
 * A slider drag, a colour-picker drag or a scrub sends dozens of changes, but
 * the person made one edit, so it must be one undo step. A session records the
 * document when the edit starts and adds a single history entry when it ends.
 *
 * Sessions are separate from canvas gestures on purpose. A gesture locks the
 * whole editor (every reducer refuses changes while one is running); a session
 * only groups its own changes, so the control being dragged keeps working. A
 * session also names its target when it starts — element ids, a timer or a
 * page — rather than following the selection, because a field can commit after
 * the selection has already moved on (blur fires after the click that selected
 * something else), and it works with nothing selected, for page settings.
 *
 * Any other action settles an open session first (see the wrapper at the
 * bottom of the reducers), so a session can never swallow an unrelated change
 * into its undo step: undo during a drag finishes the drag and then undoes it.
 */
function settleEdit(state) {
  if (!state.edit) return;
  const { before } = state.edit;
  state.edit = null;
  if (JSON.stringify(before.pages) !== JSON.stringify(current(state).pages)) remember(state, before);
}
const mergeTimer = (timer, changes) => normalizeTimer({
  ...timer, ...changes,
  onComplete: { ...timer?.onComplete, ...(changes.onComplete || {}) },
  controls: { ...timer?.controls, ...(changes.controls || {}) },
  buttonColors: { ...timer?.buttonColors, ...(changes.buttonColors || {}) },
});
const PAGE_FIELDS = ["background", "transition", "name"];
const GROUP_FIELDS = ["name", "visible", "locked"];
// The only changes a locked layer accepts: it can still be renamed, hidden, shown or unlocked.
const LOCK_SAFE = new Set(["name", "visible", "locked"]);
/* `changes` is passed when known, so a locked target can still take a rename
   or an unlock; without it (a session starting) a locked target is refused. */
function validTarget(state, target, changes) {
  const page = state.pages.find((item) => item.id === target?.pageId);
  if (!page) return null;
  if (target.kind === "page") return { kind: "page", pageId: page.id };
  if (target.kind === "animation") {
    const row = (page.animations || []).find((item) => item.id === target.rowId);
    return row && isEditable(state, [row.elementId], page) ? { kind: "animation", pageId: page.id, rowId: row.id } : null;
  }
  if (target.kind === "group") return (page.groups || []).some((group) => group.id === target.groupId) ? { kind: "group", pageId: page.id, groupId: target.groupId } : null;
  if (target.kind !== "elements" && target.kind !== "timer") return null;
  const ids = (target.ids || []).filter((id) => page.elements.some((element) => element.id === id));
  if (!ids.length) return null;
  const lockSafe = target.kind === "elements" && changes && typeof changes === "object" && Object.keys(changes).every((key) => LOCK_SAFE.has(key));
  if (!lockSafe && !isEditable(state, ids, page)) return null;
  return { kind: target.kind, pageId: page.id, ids };
}
// Names are trimmed and capped; an empty name removes the custom name instead of storing "".
function assignName(item, value) {
  const name = cleanName(value);
  if (name) item.name = name; else delete item.name;
}
function applyToTarget(state, target, changes) {
  const page = state.pages.find((item) => item.id === target.pageId);
  if (!page || !changes || typeof changes !== "object") return;
  if (target.kind === "page") {
    for (const key of PAGE_FIELDS) if (key in changes) { if (key === "name") assignName(page, changes.name); else page[key] = key === "transition" ? normalizeTransition(changes[key]) : changes[key]; }
    return;
  }
  if (target.kind === "animation") {
    const allowed = Object.fromEntries(Object.entries(changes).filter(([key]) => ["trigger", "preset", "kind", "delayMs", "durationMs"].includes(key)));
    const rows = page.animations.map((row) => row.id === target.rowId ? { ...row, ...allowed } : row);
    if (!validateTimeline({ ...page, animations: rows }).length) page.animations = rows;
    return;
  }
  if (target.kind === "group") {
    const group = page.groups.find((item) => item.id === target.groupId);
    for (const key of GROUP_FIELDS) {
      if (!(key in changes)) continue;
      if (key === "name") { if (cleanName(changes.name)) group.name = cleanName(changes.name); }
      else group[key] = !!changes[key];
    }
    return;
  }
  const ids = new Set(target.ids);
  for (const element of page.elements) {
    if (!ids.has(element.id)) continue;
    if (target.kind === "timer") { if (element.type === "timer") element.timer = mergeTimer(element.timer, changes); }
    else {
      const { name, ...rest } = changes;
      Object.assign(element, fitElement({ ...element, ...rest }, pageSizeOf(state)));
      if ("name" in changes) assignName(element, name);
    }
  }
}

const selected = (state) => state.pages[state.currentPage].elements.find((element) => element.id === state.selectedId);
const selectedElements = (state) => state.pages[state.currentPage].elements.filter((element) => state.selectedIds.includes(element.id));

function applyLayerMove(state, payload, operation) {
  if (state.gesture) return;
  const page = currentPageOf(state), plain = current(page);
  const ids = payload.ids || state.selectedIds;
  if (!isEditable(state, ids)) return;
  const mode = payload.mode || state.selectionMode;
  let next;
  if (operation === "step") next = { ...plain, elements: stepLayers(plain, ids, payload.direction, mode) };
  if (operation === "reorder") next = { ...plain, elements: reorderLayers(plain.elements, ids, payload.targetId, payload.placement, mode) };
  if (operation === "into") next = moveIntoGroup(plain, ids, payload.groupId, payload.targetId, payload.placement);
  if (operation === "out") next = removeFromGroup(plain, ids, payload.targetId, payload.placement);
  if (next.elements === plain.elements) return;
  remember(state); page.elements = next.elements; page.groups = next.groups;
  tidyGroups(page); setSelection(state, ids, mode);
}

const reducers = {
    documentLoaded(state, { payload }) {
      Object.assign(state, initialEditorState, payload);
      state.pageNumbers = normalizePageNumbers(payload?.pageNumbers);
      state.canvas = normalizePageSize(payload?.canvas);
      state.pages = state.pages.map((page) => migrateAnimations(normalizeGroups({ ...page, groups: page.groups || [] })));
      state.currentPage = 0; setSelection(state, []);
    },
    /* A new page size for the whole design, "scale to fit": everything on
       every page grows or shrinks by one factor and is centred (see
       scalePagesToSize), so nothing is stretched or pushed off the page.
       One undo step puts the old size and the old layout back together. */
    pageSizeChanged(state, { payload }) {
      if (state.gesture) return;
      const from = pageSizeOf(state), to = normalizePageSize(payload);
      if (samePageSize(from, to)) return;
      cancelGesture(state); remember(state);
      state.pages = scalePagesToSize(current(state).pages, from, to);
      state.canvas = to;
    },
    documentRenamed(state, { payload }) {
      const title = String(payload || "").trim(); if (!title || title === state.title) return;
      remember(state); state.title = title;
    },
    pageSelected(state, { payload }) {
      cancelGesture(state); state.currentPage = clamp(payload, 0, state.pages.length - 1); setSelection(state, []);
      state.selectedPages = [state.pages[state.currentPage].id];
    },
    /* Several pages at once: Ctrl-click, Shift-click, Select all. `current` is
       the page the strip should show — the one last clicked, not the first of
       the run, so the canvas follows the pointer rather than jumping back. */
    pagesSelected(state, { payload }) {
      const ids = new Set(state.pages.map((page) => page.id));
      const chosen = [...new Set(payload?.ids || [])].filter((id) => ids.has(id));
      if (!chosen.length) return;
      cancelGesture(state);
      const index = state.pages.findIndex((page) => page.id === (payload?.current ?? chosen.at(-1)));
      if (index >= 0 && index !== state.currentPage) { state.currentPage = index; setSelection(state, []); }
      state.selectedPages = chosen;
    },
    /* Delete and duplicate work on the strip's selection, so they take a list
       of indexes and land as one undo step however many pages are in it. */
    pagesDeleted(state, { payload }) {
      const doomed = [...new Set(payload || [])].filter((index) => state.pages[index]).sort((a, b) => b - a);
      if (!doomed.length || doomed.length >= state.pages.length) return;
      cancelGesture(state); remember(state);
      const activeId = state.pages[state.currentPage].id;
      doomed.forEach((index) => state.pages.splice(index, 1));
      const stillThere = state.pages.findIndex((page) => page.id === activeId);
      state.currentPage = clamp(stillThere >= 0 ? stillThere : Math.min(doomed.at(-1), state.pages.length - 1), 0, state.pages.length - 1);
      setSelection(state, []); state.selectedPages = [state.pages[state.currentPage].id];
    },
    pagesCloned: {
      prepare: (pages, indexes) => ({ payload: {
        after: Math.max(...indexes),
        copies: indexes.map((index) => {
          const page = pages[index];
          const { idMap, ...layers } = cloneLayers(page.elements, page.groups || [], nanoid);
          return { ...page, id: nanoid(), name: cleanName(`${pageLabel(page, index)} copy`), ...layers,
            animations: remapAnimations(page.animations || [], idMap, nanoid) };
        }),
      } }),
      reducer(state, { payload }) {
        if (!payload.copies.length) return;
        cancelGesture(state); remember(state);
        state.pages.splice(payload.after + 1, 0, ...payload.copies.map(normalizeGroups));
        state.currentPage = payload.after + 1; setSelection(state, []);
        state.selectedPages = payload.copies.map((page) => page.id);
      },
    },
    pageAdded: {
      prepare: () => ({ payload: { id: nanoid(), background: { type: "COLOR", value: "#FFFFFF" }, groups: [], elements: [] } }),
      reducer(state, { payload }) {
        cancelGesture(state); remember(state); state.pages.push({ ...payload, name: nextPageName(current(state).pages) }); state.currentPage = state.pages.length - 1; setSelection(state, []);
      },
    },
    // The copy remembers the label it had, so pasting it elsewhere still reads "Agenda copy", not the new position's number.
    pageCopied(state, { payload }) {
      const page = state.pages[payload]; if (!page) return;
      state.copiedPage = { ...current(page), name: pageLabel(page, payload) };
    },
    /* Duplicate and paste page. cloneLayers gives every element and every group
       a new id, with groupIds remapped, so the copy never shares a group id. */
    pageCloned: {
      prepare: (page, index) => {
        const { idMap, ...layers } = cloneLayers(page.elements, page.groups || [], nanoid);
        return { payload: { index, page: { ...page, id: nanoid(), name: cleanName(`${pageLabel(page, index)} copy`), ...layers,
          animations: remapAnimations(page.animations || [], idMap, nanoid) } } };
      },
      reducer(state, { payload }) {
        cancelGesture(state); remember(state); state.pages.splice(payload.index + 1, 0, normalizeGroups(payload.page));
        state.currentPage = payload.index + 1; setSelection(state, []);
      },
    },
    pageMoved(state, { payload }) {
      const from = clamp(payload.from, 0, state.pages.length - 1), to = clamp(payload.to, 0, state.pages.length - 1);
      if (from === to) return;
      cancelGesture(state); remember(state); const activeId = state.pages[state.currentPage].id;
      const [page] = state.pages.splice(from, 1); state.pages.splice(to, 0, page);
      state.currentPage = state.pages.findIndex((item) => item.id === activeId);
    },
    pageDeleted(state, { payload }) {
      if (state.pages.length === 1 || !state.pages[payload]) return;
      cancelGesture(state); remember(state); state.pages.splice(payload, 1);
      state.currentPage = clamp(state.currentPage - (payload <= state.currentPage ? 1 : 0), 0, state.pages.length - 1); setSelection(state, []);
    },
    /* One switch for the whole design; see model/pageNumbers.js. */
    /* The switch and its options. The layers themselves are added, removed and
       kept alike by syncPageNumbers, which runs after every action. A position
       preset moves the layers to that corner; after that they can go anywhere. */
    pageNumbersChanged(state, { payload }) {
      const next = normalizePageNumbers({ ...state.pageNumbers, ...payload });
      if (state.gesture || JSON.stringify(normalizePageNumbers(state.pageNumbers)) === JSON.stringify(next)) return;
      remember(state); state.pageNumbers = next;
      if (payload?.position) state.pages.forEach((page) => page.elements.filter(isPageNumber)
        .forEach((element) => Object.assign(element, pageNumberPlacement(next.position, element.w, element.h, pageSizeOf(state)))));
    },
    pageBackgroundChanged(state, { payload }) {
      const page = state.pages[state.currentPage];
      if (state.gesture || JSON.stringify(page.background) === JSON.stringify(payload)) return;
      remember(state); page.background = payload;
    },
    pageTransitionChanged(state, { payload }) {
      if (state.gesture) return;
      const page = currentPageOf(state), next = normalizeTransition(payload);
      if (JSON.stringify(page.transition) === JSON.stringify(next)) return;
      remember(state); page.transition = next;
    },
    animationAdded: {
      prepare: (options) => ({ payload: { ...options, seed: nanoid() } }),
      reducer(state, { payload }) {
        if (state.gesture) return;
        const page = currentPageOf(state);
        /* scope "page" animates every element on the page, so a whole design can
           be animated without selecting anything; locked and hidden layers stay
           out of it either way. */
        const ids = payload.scope === "page"
          ? page.elements.filter((element) => element.visible !== false && !effectiveLocked(page, element)).map((element) => element.id)
          : state.selectedIds;
        if (!ids.length || !isEditable(state, ids)) return;
        if (payload.preset === "none") {
          const removed = new Set((page.animations || []).filter((row) => row.kind === payload.kind && ids.includes(row.elementId)).map((row) => row.id));
          if (!removed.size) return;
          remember(state);
          page.animations = repairTimeline({ ...page, animations: removeAnimationRows(page, removed) });
          return;
        }
        /* Picking a preset for an element that already has one of that kind
           swaps it, rather than refusing until the old one is removed: an
           element has one entrance and one exit, so choosing is the edit. */
        const chosen = new Set(ids);
        const swapped = new Set();
        const kept = (page.animations || []).map((row) => {
          if (row.kind !== payload.kind || !chosen.has(row.elementId) || payload.kind === "emphasis") return row;
          swapped.add(row.elementId);
          return { ...row, preset: payload.preset };
        });
        const fresh = ids.filter((id) => !swapped.has(id));
        const added = insertionRows(page, fresh, payload.kind, payload.preset, payload.trigger || "with")
          .map((row, index) => ({ ...row, id: `${payload.seed}-${index}` }));
        const rows = [...kept, ...added];
        if (!rows.length || validateTimeline({ ...page, animations: rows }).length) return;
        if (JSON.stringify(rows) === JSON.stringify(page.animations || [])) return;
        remember(state); page.animations = rows;
      },
    },
    animationChanged(state, { payload }) {
      if (state.gesture) return;
      const target = validTarget(state, { kind: "animation", pageId: payload.pageId || currentPageOf(state).id, rowId: payload.id });
      if (!target) return;
      const before = snapshot(state); applyToTarget(state, target, payload.changes);
      if (JSON.stringify(before.pages) !== JSON.stringify(current(state).pages)) remember(state, before);
    },
    animationRemoved(state, { payload }) {
      const page = currentPageOf(state), row = page.animations?.find((item) => item.id === payload);
      if (!row || state.gesture || !isEditable(state, [row.elementId])) return;
      remember(state);
      page.animations = repairTimeline({ ...page, animations: removeAnimationRows(page, new Set([payload])) });
    },
    animationMoved(state, { payload }) {
      const page = currentPageOf(state), rows = [...(page.animations || [])], from = rows.findIndex((row) => row.id === payload.id);
      if (from < 0 || state.gesture || !isEditable(state, rows.map((row) => row.elementId))) return;
      const to = clamp(payload.to, 0, rows.length - 1);
      if (from === to) return;
      const [row] = rows.splice(from, 1); rows.splice(to, 0, row);
      if (validateTimeline({ ...page, animations: rows }).length) return;
      remember(state); page.animations = rows;
    },
    elementSelected(state, { payload }) {
      if (state.gesture) return;
      const id = payload && typeof payload === "object" ? payload.id : payload;
      const additive = payload && typeof payload === "object" && payload.additive;
      if (!id) return setSelection(state, []);
      if (additive) setSelection(state, state.selectedIds.includes(id) ? state.selectedIds.filter((item) => item !== id) : [...state.selectedIds, id]);
      else setSelection(state, [id]);
    },
    elementsSelected(state, { payload }) { if (!state.gesture) setSelection(state, payload || []); },
    canvasLayersSelected(state, { payload }) {
      if (state.gesture) return;
      const ids = expandCanvasSelection(currentPageOf(state), payload || []);
      setSelection(state, ids, "group");
      if (!selectedGroup(state)) state.selectionMode = "direct";
    },
    // Select all from the canvas: hidden and locked layers are left out, as in Figma.
    canvasAllSelected(state) {
      if (state.gesture) return;
      const page = currentPageOf(state);
      setSelection(state, expandCanvasSelection(page, page.elements.filter((element) => canvasSelectable(page, element)).map((element) => element.id)), "group");
      if (!selectedGroup(state)) state.selectionMode = "direct";
    },
    // Selecting a group (from the Layers panel) selects its members as one object.
    groupSelected(state, { payload }) {
      if (state.gesture) return;
      const page = currentPageOf(state);
      if (!(page.groups || []).some((group) => group.id === payload)) return;
      setSelection(state, page.elements.filter((element) => element.groupId === payload).map((element) => element.id), "group");
    },
    layersStepped(state, { payload }) { applyLayerMove(state, payload, "step"); },
    layersReordered(state, { payload }) { applyLayerMove(state, payload, "reorder"); },
    layersMovedIntoGroup(state, { payload }) { applyLayerMove(state, payload, "into"); },
    layersRemovedFromGroup(state, { payload }) { applyLayerMove(state, payload, "out"); },
    selectionGrouped: {
      prepare: () => ({ payload: { id: nanoid() } }),
      reducer(state, { payload }) {
        if (state.gesture) return;
        const page = currentPageOf(state), plain = current(page);
        const next = groupSelection(plain, state.selectedIds, () => payload.id, nextGroupName(state.pages));
        if (next === plain) return;
        remember(state); page.elements = next.elements; page.groups = next.groups;
        setSelection(state, state.selectedIds, "group");
      },
    },
    /* Point editing (Figma's "edit object"). Only the mode and which points are
       picked live here — never in history — so undo changes the outline without
       throwing you out of the editor. The outline itself is changed through
       targetChanged and canvas gestures, like every other edit. */
    pointEditStarted(state, { payload }) {
      if (state.gesture) return;
      const page = currentPageOf(state);
      const id = payload || (state.selectedIds.length === 1 ? state.selectedIds[0] : null);
      const element = page.elements.find((item) => item.id === id);
      if (!element || element.type !== "shape" || effectiveLocked(page, element) || !effectiveVisible(page, element)) return;
      if (state.selectedIds.length !== 1 || state.selectedIds[0] !== id) setSelection(state, [id]);
      state.pointEdit = { elementId: id, keys: [] };
    },
    pointEditFinished(state) { state.pointEdit = null; },
    /* Cropping, the image counterpart of point editing. The mode lives here and
       never in history; the crop itself is an ordinary element property changed
       through targetChanged, so undo walks back through the crop rather than
       throwing the photo out of the cropper. */
    cropStarted(state, { payload }) {
      if (state.gesture) return;
      const page = currentPageOf(state);
      const id = payload || (state.selectedIds.length === 1 ? state.selectedIds[0] : null);
      const element = page.elements.find((item) => item.id === id);
      if (!element || element.type !== "image" || effectiveLocked(page, element) || !effectiveVisible(page, element)) return;
      if (state.selectedIds.length !== 1 || state.selectedIds[0] !== id) setSelection(state, [id]);
      state.cropping = { elementId: id };
      state.pointEdit = null;
    },
    cropFinished(state) { state.cropping = null; },
    // payload: { keys, additive }. Additive toggles the given points in or out.
    pointsSelected(state, { payload }) {
      if (!state.pointEdit) return;
      const keys = [...new Set(payload?.keys || [])];
      if (!payload?.additive) { state.pointEdit.keys = keys; return; }
      const current = new Set(state.pointEdit.keys);
      const allIn = keys.every((key) => current.has(key));
      keys.forEach((key) => (allIn ? current.delete(key) : current.add(key)));
      state.pointEdit.keys = [...current];
    },
    /* Move the selection to another page: one undo step covering both pages,
       the current page and the selection. The layers land at the front of the
       destination, and the editor follows them there. */
    layersMovedToPage: {
      prepare: (payload) => ({ payload: { ...payload, seed: nanoid() } }),
      reducer(state, { payload }) {
      if (state.gesture) return;
      const index = payload?.pageIndex, to = state.pages[index], from = currentPageOf(state);
      if (!to || to === from || !state.selectedIds.length || !isEditable(state, state.selectedIds)) return;
      const moved = detachLayers(current(from), state.selectedIds);
      if (!moved) return;
      remember(state);
      const movingIds = new Set(state.selectedIds), movingRows = extractAnimations(from, movingIds);
      from.animations = repairTimeline({ ...from, animations: removeAnimationRows(from, new Set(movingRows.map((row) => row.id))) });
      const keys = new Set(to.elements.map((item) => item.morphId || item.id));
      moved.moved.elements.forEach((item, index) => { const key = item.morphId || item.id; if (keys.has(key)) item.morphId = `${payload.seed}-${index}`; keys.add(item.morphId || item.id); });
      from.elements = moved.source.elements; from.groups = moved.source.groups;
      to.elements.push(...moved.moved.elements);
      to.groups = [...(to.groups || []), ...moved.moved.groups];
      to.animations = appendAnimations(to, movingRows);
      state.currentPage = index;
      setSelection(state, moved.moved.elements.map((item) => item.id), moved.moved.groups.length === 1 ? "group" : "direct");
      if (!selectedGroup(state)) state.selectionMode = "direct";
    } },
    groupUngrouped(state, { payload }) {
      if (state.gesture) return;
      const page = currentPageOf(state), plain = current(page);
      const next = ungroupSelection(plain, payload || selectedGroup(state)?.id);
      if (next === plain) return;
      remember(state); page.elements = next.elements; page.groups = next.groups;
      setSelection(state, next.memberIds);
    },
    /* One undo step that unlocks the selection and any group locking it, so the
       sidebar's Unlock button always works in a single press. */
    selectionUnlocked(state) {
      const page = currentPageOf(state);
      const chosen = page.elements.filter((element) => state.selectedIds.includes(element.id));
      const groupIds = new Set(chosen.map((element) => element.groupId).filter(Boolean));
      if (!chosen.some((element) => effectiveLocked(page, element)) || state.gesture) return;
      remember(state);
      chosen.forEach((element) => { element.locked = false; });
      (page.groups || []).forEach((group) => { if (groupIds.has(group.id)) group.locked = false; });
    },
    elementInserted: {
      prepare: (shape, position) => ({ payload: { shape, position, id: nanoid() } }),
      reducer(state, { payload }) {
        const preset = shapeCatalog.find((shape) => shape.id === payload.shape); if (!preset || state.gesture) return;
        remember(state); const elements = state.pages[state.currentPage].elements; const offset = (elements.length % 8) * 24;
        const size = pageSizeOf(state);
        const x = payload.position ? payload.position.x - preset.w / 2 : (size.width - preset.w) / 2 + offset;
        const y = payload.position ? payload.position.y - preset.h / 2 : (size.height - preset.h) / 2 + offset;
        elements.push(fitElement({ id: payload.id, type: "shape", shape: preset.id, x, y, w: preset.w, h: preset.h, rotation: 0,
          fill: "#ad8dea", fillOpacity: 1, fillVisible: true, opacity: 1, locked: false, visible: true,
          stroke: null, strokeWidth: 0, strokeAlign: "inside", strokeOpacity: 1, strokeVisible: true,
          cornerRadius: preset.id === "rounded-rectangle" ? 50 : 0, flipX: false, flipY: false, lockAspect: false, effects: [] }, size));
        setSelection(state, [payload.id]);
      },
    },
    textInserted: {
      prepare: (preset = "body") => ({ payload: { preset, id: nanoid() } }),
      reducer(state, { payload }) {
        if (state.gesture) return;
        const presets = {
          // Poppins Bold needs ~900px for the heading itself, plus text padding.
          heading: { content: "Add a heading", fontSize: 120, fontWeight: 700, w: 960, h: 180 },
          subheading: { content: "Add a subheading", fontSize: 72, fontWeight: 600, w: 760, h: 130 },
          body: { content: "Add body text", fontSize: 48, fontWeight: 400, w: 620, h: 110 },
          /* Event components (functional requirement 3). Time and Date generate
             their words from the clock, so they carry a `dynamic` mark and a
             snapshot in `content`; see clockText.js. */
          time: { content: formatClock("time", defaultClockFormat("time")), dynamic: "time", clockFormat: defaultClockFormat("time"), fontSize: 120, fontWeight: 600, w: 720, h: 180 },
          date: { content: formatClock("date", defaultClockFormat("date")), dynamic: "date", clockFormat: defaultClockFormat("date"), fontSize: 72, fontWeight: 500, w: 900, h: 130 },
        };
        const preset = presets[payload.preset] || presets.body; remember(state);
        const size = pageSizeOf(state);
        const element = { id: payload.id, type: "text", x: (size.width - preset.w) / 2, y: (size.height - preset.h) / 2,
          w: preset.w, h: preset.h, rotation: 0, fill: DEFAULT_EDITOR_TEXT_COLOR, opacity: 1, fontFamily: "Poppins", textAlign: "center",
          lineHeight: 1.2, letterSpacing: 0, fontStyle: "normal", locked: false, visible: true, ...preset };
        state.pages[state.currentPage].elements.push(element); setSelection(state, [payload.id]);
      },
    },
    /* An uploaded picture. `src` is the storage fileName the upload returned,
       never the full link or the image data: the document stays small, and it
       still works if the server address changes (see getStorageUrl). The box
       keeps the photo's own proportions and fits inside 60% of the page. */
    imageInserted: {
      prepare: (src, size = {}, name = "") => ({ payload: { src, width: size.width, height: size.height, name, id: nanoid() } }),
      reducer(state, { payload }) {
        if (!payload.src || state.gesture) return;
        const width = payload.width > 0 ? payload.width : 800, height = payload.height > 0 ? payload.height : 600;
        const size = pageSizeOf(state);
        const scale = Math.min(1, (size.width * 0.6) / width, (size.height * 0.6) / height);
        const w = Math.max(24, Math.round(width * scale)), h = Math.max(24, Math.round(height * scale));
        remember(state);
        const elements = state.pages[state.currentPage].elements; const offset = (elements.length % 8) * 24;
        elements.push({
          id: payload.id, type: "image", src: payload.src,
          ...(cleanName(payload.name) ? { name: cleanName(payload.name) } : {}),
          x: (size.width - w) / 2 + offset, y: (size.height - h) / 2 + offset, w, h, rotation: 0,
          opacity: 1, cornerRadius: 0, flipX: false, flipY: false, lockAspect: true,
          locked: false, visible: true, effects: [],
        });
        setSelection(state, [payload.id]);
      },
    },
    timerInserted: {
      /* timerInserted("STOPWATCH") adds a stopwatch; anything else adds a
         countdown, and a format string ("MM:SS") is still accepted for it. */
      prepare: (option = "COUNTDOWN", buttonColors) => ({ payload: {
        mode: option === "STOPWATCH" ? "STOPWATCH" : "COUNTDOWN",
        format: option === "STOPWATCH" || option === "COUNTDOWN" ? "HH:MM:SS" : option,
        buttonColors, id: nanoid(),
      } }),
      reducer(state, { payload }) {
        if (state.gesture) return;
        remember(state);
        const w = 900, h = 460, size = pageSizeOf(state);
        state.pages[state.currentPage].elements.push({
          id: payload.id, type: "timer",
          x: (size.width - w) / 2, y: (size.height - h) / 2, w, h, rotation: 0,
          fill: DEFAULT_EDITOR_TEXT_COLOR, opacity: 1, fontFamily: "Poppins", fontSize: 120,
          locked: false, visible: true,
          timer: defaultTimer(payload.format, payload.buttonColors, payload.mode),
        });
        setSelection(state, [payload.id]);
      },
    },
    /* Settings only. Nothing about a running clock reaches this reducer — live
       state belongs to DisplayTimer, and putting it here would re-serialise the
       whole document every tick and bury undo under countdown frames. */
    timerChanged(state, { payload }) {
      const element = selected(state);
      if (!element || element.type !== "timer" || state.gesture || !isEditable(state, [element.id])) return;
      const next = mergeTimer(element.timer, payload);
      if (JSON.stringify(element.timer) === JSON.stringify(next)) return;
      remember(state);
      element.timer = next;
    },
    elementDeleted(state) {
      if (!state.selectedIds.length || state.gesture || !selectionEditable(state)) return;
      remember(state); const ids = new Set(state.selectedIds);
      const page = currentPageOf(state);
      page.animations = removeAnimationRows(page, new Set((page.animations || []).filter((row) => ids.has(row.elementId)).map((row) => row.id)));
      page.elements = page.elements.filter((element) => !ids.has(element.id)); tidyGroups(page); setSelection(state, []);
      page.animations = repairTimeline(page);
    },
    elementChanged(state, { payload }) {
      if (!selected(state) || state.gesture || !selectionEditable(state)) return;
      const elements = selectedElements(state); const changes = elements.map((element) => fitElement({ ...element, ...payload }, pageSizeOf(state)));
      if (elements.every((element, index) => JSON.stringify(element) === JSON.stringify(changes[index]))) return;
      remember(state); elements.forEach((element, index) => Object.assign(element, changes[index]));
    },
    elementsChanged(state, { payload }) {
      if (state.gesture?.token !== payload.token || !isEditable(state, payload.elements.map((element) => element.id))) return;
      const changes = new Map(payload.elements.map((element) => [element.id, element]));
      state.pages[state.currentPage].elements.forEach((element) => { if (changes.has(element.id)) Object.assign(element, changes.get(element.id)); });
      state.snapGuides = payload.guides || [];
    },
    elementNudged(state, { payload }) {
      const elements = selectedElements(state); if (!elements.length || state.gesture || !selectionEditable(state)) return;
      const delta = clampSelectionDelta(elements, payload.x, payload.y, pageSizeOf(state)); if (!delta.x && !delta.y) return;
      remember(state); elements.forEach((element) => { element.x += delta.x; element.y += delta.y; });
    },
    selectionAligned(state, { payload }) {
      // One element aligns to the page, several align to their shared bounds, as in Figma.
      const elements = selectedElements(state); if (!elements.length || state.gesture || !selectionEditable(state)) return;
      const box = elements.length === 1 ? { left: 0, top: 0, right: pageSizeOf(state).width, bottom: pageSizeOf(state).height } : selectionBounds(elements);
      if (!box) return;
      remember(state); elements.forEach((element) => {
        const own = selectionBounds([element]);
        if (payload === "left") element.x += box.left - own.left;
        if (payload === "center") element.x += (box.left + box.right - own.left - own.right) / 2;
        if (payload === "right") element.x += box.right - own.right;
        if (payload === "top") element.y += box.top - own.top;
        if (payload === "middle") element.y += (box.top + box.bottom - own.top - own.bottom) / 2;
        if (payload === "bottom") element.y += box.bottom - own.bottom;
      });
    },
    selectionDistributed(state, { payload }) {
      const elements = selectedElements(state); if (elements.length < 3 || state.gesture || !selectionEditable(state)) return;
      const horizontal = payload === "horizontal";
      /* Even *gaps*, not evenly spaced top-left corners. Spacing the corners
         leaves visibly unequal gaps the moment the elements differ in size,
         which is the one case the command exists to fix. Measured through
         selectionBounds so rotated elements distribute by what the eye sees,
         the same basis selectionAligned uses. */
      const measured = elements.map((element) => ({ element, box: selectionBounds([element]) }))
        .sort((a, b) => (horizontal ? a.box.left - b.box.left : a.box.top - b.box.top));
      const size = (item) => (horizontal ? item.box.w : item.box.h);
      const startEdge = (item) => (horizontal ? item.box.left : item.box.top);
      const endEdge = (item) => (horizontal ? item.box.right : item.box.bottom);
      const span = endEdge(measured.at(-1)) - startEdge(measured[0]);
      const gap = (span - measured.reduce((total, item) => total + size(item), 0)) / (measured.length - 1);
      // First and last stay put; only the elements between them move.
      let cursor = endEdge(measured[0]);
      const moves = measured.slice(1, -1).map((item) => {
        cursor += gap; const delta = cursor - startEdge(item); cursor += size(item);
        return { element: item.element, delta };
      });
      if (!moves.some((move) => Math.abs(move.delta) > 0.001)) return;
      remember(state);
      moves.forEach(({ element, delta }) => { if (horizontal) element.x += delta; else element.y += delta; });
    },
    /* A group travels with a copy only when all of its members were copied; a
       layer copied out of a group pastes ungrouped, as in Figma. */
    selectionCopied(state) {
      const page = currentPageOf(state);
      const chosen = selectedElements(state).map((element) => ({ ...current(element) }));
      const whole = new Set((page.groups || []).filter((group) => {
        const members = page.elements.filter((element) => element.groupId === group.id);
        return members.length && members.every((element) => state.selectedIds.includes(element.id));
      }).map((group) => group.id));
      state.copiedElements = chosen.map(({ groupId, ...element }) => (whole.has(groupId) ? { ...element, groupId } : element));
      state.copiedGroups = (page.groups || []).filter((group) => whole.has(group.id)).map((group) => ({ ...current(group) }));
      state.copiedAnimations = extractAnimations(page, new Set(state.selectedIds));
    },
    selectionPasted: {
      prepare: () => ({ payload: { seed: nanoid() } }),
      reducer(state, { payload }) {
        if (!state.copiedElements.length || state.gesture) return;
        let count = 0; const makeId = () => `${payload.seed}-${count++}`;
        const layers = cloneLayers(current(state).copiedElements, current(state).copiedGroups || [], makeId);
        remember(state);
        const pasted = layers.elements.map((element) => fitElement({ ...element, x: element.x + 32, y: element.y + 32 }, pageSizeOf(state)));
        const page = currentPageOf(state);
        const keys = new Set(page.elements.map((item) => item.morphId || item.id));
        pasted.forEach((item) => { if (keys.has(item.morphId || item.id)) item.morphId = makeId(); keys.add(item.morphId || item.id); });
        page.groups = [...(page.groups || []), ...layers.groups];
        page.elements.push(...pasted);
        const copiedRows = remapAnimations(state.copiedAnimations || [], layers.idMap, makeId);
        page.animations = appendAnimations(page, copiedRows);
        state.copiedAnimations = copiedRows;
        state.copiedElements = pasted.map((element) => ({ ...element })); state.copiedGroups = layers.groups;
        setSelection(state, pasted.map((element) => element.id), layers.groups.length === 1 && pasted.every((element) => element.groupId === layers.groups[0].id) ? "group" : "direct");
      },
    },
    // A canvas gesture never starts on a selection holding a locked layer.
    gestureStarted(state, { payload }) { if (!state.gesture && state.selectedIds.length && selectionEditable(state)) state.gesture = { token: payload, before: snapshot(state) }; },
    elementTransformed(state, { payload }) {
      const element = selected(state); if (!element || state.gesture?.token !== payload.token) return;
      Object.assign(element, fitElement({ ...element, ...payload.changes }, pageSizeOf(state)));
    },
    gestureFinished(state, { payload }) {
      if (state.gesture?.token !== payload) return; const before = state.gesture.before;
      if (JSON.stringify(before.pages) !== JSON.stringify(state.pages)) remember(state, before);
      state.gesture = null; state.snapGuides = [];
    },
    gestureCancelled(state, { payload }) { if (state.gesture?.token === payload) cancelGesture(state); },
    zoomChanged(state, { payload }) { state.zoom = payload === null ? null : clamp(payload, 0.1, 2); },
    undo(state) {
      if (state.gesture) { cancelGesture(state); return; } if (!state.past.length) return;
      state.future.push(snapshot(state)); restore(state, state.past.pop());
    },
    redo(state) {
      if (state.gesture || !state.future.length) return; state.past.push(snapshot(state)); restore(state, state.future.pop());
    },

    /* payload: { token, target, property }. target is { kind: "elements" | "timer", pageId, ids } or { kind: "page", pageId }. */
    editStarted(state, { payload }) {
      if (state.gesture || state.edit?.token === payload?.token) return;
      settleEdit(state);
      const target = validTarget(state, payload?.target);
      if (!target) return;
      state.edit = { token: payload.token, target, property: payload.property || null, before: snapshot(state) };
    },
    editUpdated(state, { payload }) {
      if (!state.edit || state.edit.token !== payload?.token) return;
      applyToTarget(state, state.edit.target, payload.changes);
    },
    editFinished(state, { payload }) { if (state.edit?.token === payload) settleEdit(state); },
    editCancelled(state, { payload }) {
      if (state.edit?.token !== payload) return;
      state.pages = state.edit.before.pages; state.edit = null;
    },
    /* A single committed change to a named target — a typed value, a swatch, a
       toggle. One undo step, and it still lands on the right element if the
       selection changed between focusing the field and committing it. */
    targetChanged(state, { payload }) {
      if (state.gesture) return;
      const target = validTarget(state, payload?.target, payload?.changes);
      if (!target) return;
      const before = snapshot(state);
      applyToTarget(state, target, payload.changes);
      if (JSON.stringify(before.pages) !== JSON.stringify(current(state).pages)) remember(state, before);
    },
};

// Actions that may run while a session is open without settling it: the session's
// own actions, canvas-gesture updates (a gesture can only start after settling),
// and actions that do not touch the document.
const SESSION_SAFE = new Set(["pointsSelected", "editStarted", "editUpdated", "editFinished", "editCancelled", "elementsChanged", "elementTransformed", "zoomChanged", "pageCopied", "selectionCopied"]);
for (const [name, definition] of Object.entries(reducers)) {
  if (SESSION_SAFE.has(name)) continue;
  if (typeof definition === "function") {
    reducers[name] = (state, action) => { settleEdit(state); return definition(state, action); };
  } else {
    reducers[name] = { ...definition, reducer: (state, action) => { settleEdit(state); return definition.reducer(state, action); } };
  }
}

const editorSlice = createSlice({ name: "editor", initialState: initialEditorState, reducers });

export const { documentLoaded, pageSizeChanged, documentRenamed, pageSelected, pagesSelected, pagesDeleted, pagesCloned, pageAdded, pageCopied, pageCloned, pageMoved, pageDeleted, pageBackgroundChanged, pageNumbersChanged,
  elementSelected, elementsSelected, canvasAllSelected, groupSelected, selectionUnlocked, elementInserted, textInserted, imageInserted, timerInserted, timerChanged, elementDeleted, elementChanged, elementsChanged,
  elementNudged, selectionAligned, selectionDistributed, selectionCopied, selectionPasted,
  gestureStarted, elementTransformed, gestureFinished, gestureCancelled, zoomChanged, undo, redo,
  editStarted, editUpdated, editFinished, editCancelled, targetChanged } = editorSlice.actions;
export const { cropStarted, cropFinished, pointEditStarted, pointEditFinished, pointsSelected, layersMovedToPage, layersStepped, layersReordered, layersMovedIntoGroup, layersRemovedFromGroup, selectionGrouped, groupUngrouped, canvasLayersSelected } = editorSlice.actions;
export const { pageTransitionChanged, animationAdded, animationChanged, animationRemoved, animationMoved } = editorSlice.actions;
/* The strip's selection is not in the history, so undo, a load or a delete can
   leave it naming pages that are gone. Rather than repeat the repair in every
   reducer, it is checked once after each action. */
function keepPageSelection(state) {
  if (!state?.pages?.length) return state;
  const alive = new Set(state.pages.map((page) => page.id));
  const kept = (state.selectedPages || []).filter((id) => alive.has(id));
  const wanted = kept.length ? kept : [state.pages[clamp(state.currentPage, 0, state.pages.length - 1)].id];
  if (wanted.length === (state.selectedPages || []).length && wanted.every((id, index) => id === state.selectedPages[index])) return state;
  return { ...state, selectedPages: wanted };
}

// The slice, then the page-number pass (see model/pageNumbers.js).
export default function editorReducer(state, action) {
  return keepPageSelection(syncPageNumbers(state, editorSlice.reducer(state, action), action, editorSlice.actions.elementDeleted.type));
}
