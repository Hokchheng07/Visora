import { createSlice, current, nanoid } from "@reduxjs/toolkit";
import { CANVAS_HEIGHT, CANVAS_WIDTH, clamp, clampSelectionDelta, fitElement, selectionBounds } from "../Editor/elementGeometry.js";
import { shapeCatalog } from "../Editor/shapeCatalog.js";
import { defaultTimer, normalizeTimer } from "../Editor/editorDocument.js";

export const initialEditorState = {
  documentId: "backdrop-local", title: "Untitled-1", version: 0,
  pages: [{ id: "page-initial", background: { type: "COLOR", value: "#FFFFFF" }, elements: [] }],
  currentPage: 0, selectedIds: [], selectedId: null,
  past: [], future: [], gesture: null, copiedPage: null, copiedElements: [], zoom: null, snapGuides: [],
};

function setSelection(state, ids) {
  const valid = new Set(state.pages[state.currentPage].elements.map((element) => element.id));
  state.selectedIds = [...new Set(ids)].filter((id) => valid.has(id));
  state.selectedId = state.selectedIds.at(-1) || null;
}
function snapshot(state) {
  const plain = current(state);
  return { pages: plain.pages, currentPage: plain.currentPage, selectedIds: plain.selectedIds, selectedId: plain.selectedId, title: plain.title };
}
function remember(state, before = snapshot(state)) {
  state.past.push(before); if (state.past.length > 50) state.past.shift(); state.future = [];
}
function restore(state, saved) {
  state.pages = saved.pages; state.title = saved.title || state.title;
  state.currentPage = clamp(saved.currentPage, 0, state.pages.length - 1);
  setSelection(state, saved.selectedIds || (saved.selectedId ? [saved.selectedId] : []));
}
function cancelGesture(state) {
  if (state.gesture) restore(state, state.gesture.before);
  state.gesture = null; state.snapGuides = [];
}
const selected = (state) => state.pages[state.currentPage].elements.find((element) => element.id === state.selectedId);
const selectedElements = (state) => state.pages[state.currentPage].elements.filter((element) => state.selectedIds.includes(element.id));

const editorSlice = createSlice({
  name: "editor", initialState: initialEditorState,
  reducers: {
    documentLoaded(state, { payload }) {
      Object.assign(state, initialEditorState, payload); state.currentPage = 0; setSelection(state, []);
    },
    documentRenamed(state, { payload }) {
      const title = String(payload || "").trim(); if (!title || title === state.title) return;
      remember(state); state.title = title;
    },
    pageSelected(state, { payload }) {
      cancelGesture(state); state.currentPage = clamp(payload, 0, state.pages.length - 1); setSelection(state, []);
    },
    pageAdded: {
      prepare: () => ({ payload: { id: nanoid(), background: { type: "COLOR", value: "#FFFFFF" }, elements: [] } }),
      reducer(state, { payload }) {
        cancelGesture(state); remember(state); state.pages.push(payload); state.currentPage = state.pages.length - 1; setSelection(state, []);
      },
    },
    pageCopied(state, { payload }) { state.copiedPage = current(state.pages[payload]); },
    pageCloned: {
      prepare: (page, index) => ({ payload: { index, page: { ...page, id: nanoid(), elements: page.elements.map((element) => ({ ...element, id: nanoid() })) } } }),
      reducer(state, { payload }) {
        cancelGesture(state); remember(state); state.pages.splice(payload.index + 1, 0, payload.page);
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
    pageBackgroundChanged(state, { payload }) {
      const page = state.pages[state.currentPage];
      if (state.gesture || JSON.stringify(page.background) === JSON.stringify(payload)) return;
      remember(state); page.background = payload;
    },
    pageAnimationChanged(state, { payload }) {
      const page = state.pages[state.currentPage]; const animation = payload === "none" ? undefined : { preset: payload };
      if (JSON.stringify(page.animation) === JSON.stringify(animation)) return;
      remember(state); page.animation = animation;
    },
    elementSelected(state, { payload }) {
      if (state.gesture) return;
      const id = typeof payload === "object" ? payload.id : payload;
      const additive = typeof payload === "object" && payload.additive;
      if (!id) return setSelection(state, []);
      if (additive) setSelection(state, state.selectedIds.includes(id) ? state.selectedIds.filter((item) => item !== id) : [...state.selectedIds, id]);
      else setSelection(state, [id]);
    },
    elementsSelected(state, { payload }) { if (!state.gesture) setSelection(state, payload || []); },
    elementInserted: {
      prepare: (shape, position) => ({ payload: { shape, position, id: nanoid() } }),
      reducer(state, { payload }) {
        const preset = shapeCatalog.find((shape) => shape.id === payload.shape); if (!preset || state.gesture) return;
        remember(state); const elements = state.pages[state.currentPage].elements; const offset = (elements.length % 8) * 24;
        const x = payload.position ? payload.position.x - preset.w / 2 : (CANVAS_WIDTH - preset.w) / 2 + offset;
        const y = payload.position ? payload.position.y - preset.h / 2 : (CANVAS_HEIGHT - preset.h) / 2 + offset;
        elements.push(fitElement({ id: payload.id, type: "shape", shape: preset.id, x, y, w: preset.w, h: preset.h, rotation: 0,
          fill: "#ad8dea", stroke: "transparent", strokeWidth: 0, opacity: 1, locked: false, visible: true }));
        setSelection(state, [payload.id]);
      },
    },
    textInserted: {
      prepare: (preset = "body") => ({ payload: { preset, id: nanoid() } }),
      reducer(state, { payload }) {
        if (state.gesture) return;
        const presets = {
          heading: { content: "Add a heading", fontSize: 120, fontWeight: 700, w: 900, h: 180 },
          subheading: { content: "Add a subheading", fontSize: 72, fontWeight: 600, w: 760, h: 130 },
          body: { content: "Add body text", fontSize: 48, fontWeight: 400, w: 620, h: 110 },
        };
        const preset = presets[payload.preset] || presets.body; remember(state);
        const element = { id: payload.id, type: "text", x: (CANVAS_WIDTH - preset.w) / 2, y: (CANVAS_HEIGHT - preset.h) / 2,
          w: preset.w, h: preset.h, rotation: 0, fill: "#29243a", opacity: 1, fontFamily: "Poppins", textAlign: "center",
          lineHeight: 1.2, letterSpacing: 0, fontStyle: "normal", locked: false, visible: true, ...preset };
        state.pages[state.currentPage].elements.push(element); setSelection(state, [payload.id]);
      },
    },
    timerInserted: {
      prepare: (format = "HH:MM:SS") => ({ payload: { format, id: nanoid() } }),
      reducer(state, { payload }) {
        if (state.gesture) return;
        remember(state);
        const w = 900, h = 460;
        state.pages[state.currentPage].elements.push({
          id: payload.id, type: "timer",
          x: (CANVAS_WIDTH - w) / 2, y: (CANVAS_HEIGHT - h) / 2, w, h, rotation: 0,
          fill: "#705AE0", opacity: 1, fontFamily: "Poppins", fontSize: 120,
          locked: false, visible: true,
          timer: defaultTimer(payload.format),
        });
        setSelection(state, [payload.id]);
      },
    },
    /* Settings only. Nothing about a running clock reaches this reducer — live
       state belongs to DisplayTimer, and putting it here would re-serialise the
       whole document every tick and bury undo under countdown frames. */
    timerChanged(state, { payload }) {
      const element = selected(state);
      if (!element || element.type !== "timer" || state.gesture) return;
      const next = normalizeTimer({
        ...element.timer,
        ...payload,
        onComplete: { ...element.timer?.onComplete, ...(payload.onComplete || {}) },
        controls: { ...element.timer?.controls, ...(payload.controls || {}) },
      });
      if (JSON.stringify(element.timer) === JSON.stringify(next)) return;
      remember(state);
      element.timer = next;
    },
    elementDeleted(state) {
      if (!state.selectedIds.length || state.gesture) return;
      remember(state); const ids = new Set(state.selectedIds);
      state.pages[state.currentPage].elements = state.pages[state.currentPage].elements.filter((element) => !ids.has(element.id)); setSelection(state, []);
    },
    elementChanged(state, { payload }) {
      if (!selected(state) || state.gesture) return;
      const elements = selectedElements(state); const changes = elements.map((element) => fitElement({ ...element, ...payload }));
      if (elements.every((element, index) => JSON.stringify(element) === JSON.stringify(changes[index]))) return;
      remember(state); elements.forEach((element, index) => Object.assign(element, changes[index]));
    },
    elementsChanged(state, { payload }) {
      if (state.gesture?.token !== payload.token) return;
      const changes = new Map(payload.elements.map((element) => [element.id, element]));
      state.pages[state.currentPage].elements.forEach((element) => { if (changes.has(element.id)) Object.assign(element, changes.get(element.id)); });
      state.snapGuides = payload.guides || [];
    },
    elementNudged(state, { payload }) {
      const elements = selectedElements(state); if (!elements.length || state.gesture) return;
      const delta = clampSelectionDelta(elements, payload.x, payload.y); if (!delta.x && !delta.y) return;
      remember(state); elements.forEach((element) => { element.x += delta.x; element.y += delta.y; });
    },
    elementReordered(state, { payload }) {
      if (state.gesture || state.selectedIds.length !== 1) return;
      const elements = state.pages[state.currentPage].elements; const from = elements.findIndex((element) => element.id === state.selectedId);
      if (from < 0) return; const to = clamp(from + payload, 0, elements.length - 1); if (from === to) return;
      remember(state); const [element] = elements.splice(from, 1); elements.splice(to, 0, element);
    },
    selectionAligned(state, { payload }) {
      const elements = selectedElements(state), box = selectionBounds(elements); if (elements.length < 2 || !box) return;
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
      const elements = selectedElements(state); if (elements.length < 3) return;
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
    selectionCopied(state) { state.copiedElements = selectedElements(state).map((element) => ({ ...current(element) })); },
    selectionPasted(state) {
      if (!state.copiedElements.length || state.gesture) return;
      remember(state); const pasted = state.copiedElements.map((element) => fitElement({ ...element, id: nanoid(), x: element.x + 32, y: element.y + 32 }));
      state.pages[state.currentPage].elements.push(...pasted); state.copiedElements = pasted.map((element) => ({ ...element })); setSelection(state, pasted.map((element) => element.id));
    },
    gestureStarted(state, { payload }) { if (!state.gesture && state.selectedIds.length) state.gesture = { token: payload, before: snapshot(state) }; },
    elementTransformed(state, { payload }) {
      const element = selected(state); if (!element || state.gesture?.token !== payload.token) return;
      Object.assign(element, fitElement({ ...element, ...payload.changes }));
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
  },
});

export const { documentLoaded, documentRenamed, pageSelected, pageAdded, pageCopied, pageCloned, pageMoved, pageDeleted, pageBackgroundChanged, pageAnimationChanged,
  elementSelected, elementsSelected, elementInserted, textInserted, timerInserted, timerChanged, elementDeleted, elementChanged, elementsChanged,
  elementNudged, elementReordered, selectionAligned, selectionDistributed, selectionCopied, selectionPasted,
  gestureStarted, elementTransformed, gestureFinished, gestureCancelled, zoomChanged, undo, redo } = editorSlice.actions;
export default editorSlice.reducer;
