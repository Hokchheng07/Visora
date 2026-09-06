import { createSlice, current, nanoid } from "@reduxjs/toolkit";
import { CANVAS_HEIGHT, CANVAS_WIDTH, clamp, fitElement } from "../Editor/elementGeometry.js";
import { shapeCatalog } from "../Editor/shapeCatalog.js";

export const initialEditorState = {
  pages: [{ id: "page-initial", elements: [] }], currentPage: 0, selectedId: null,
  past: [], future: [], gesture: null, copiedPage: null,
};

function snapshot(state) {
  const plain = current(state);
  return { pages: plain.pages, currentPage: plain.currentPage, selectedId: plain.selectedId };
}
function remember(state, before = snapshot(state)) {
  state.past.push(before);
  if (state.past.length > 50) state.past.shift();
  state.future = [];
}
function restore(state, saved) {
  state.pages = saved.pages;
  state.currentPage = clamp(saved.currentPage, 0, state.pages.length - 1);
  state.selectedId = state.pages[state.currentPage].elements.some((el) => el.id === saved.selectedId) ? saved.selectedId : null;
}
function cancelGesture(state) {
  if (state.gesture) restore(state, state.gesture.before);
  state.gesture = null;
}
const selected = (state) => state.pages[state.currentPage].elements.find((el) => el.id === state.selectedId);

const editorSlice = createSlice({
  name: "editor", initialState: initialEditorState,
  reducers: {
    pageSelected(state, { payload }) {
      cancelGesture(state);
      state.currentPage = clamp(payload, 0, state.pages.length - 1);
      state.selectedId = null;
    },
    pageAdded: {
      prepare: () => ({ payload: { id: nanoid(), elements: [] } }),
      reducer(state, { payload }) {
        cancelGesture(state); remember(state);
        state.pages.push(payload); state.currentPage = state.pages.length - 1; state.selectedId = null;
      },
    },
    pageCopied(state, { payload }) { state.copiedPage = state.pages[payload]; },
    pageCloned: {
      prepare: (page, index) => ({ payload: { index, page: { ...page, id: nanoid(), elements: page.elements.map((el) => ({ ...el, id: nanoid() })) } } }),
      reducer(state, { payload }) {
        cancelGesture(state); remember(state);
        state.pages.splice(payload.index + 1, 0, payload.page);
        state.currentPage = payload.index + 1; state.selectedId = null;
      },
    },
    pageDeleted(state, { payload }) {
      if (state.pages.length === 1 || !state.pages[payload]) return;
      cancelGesture(state); remember(state);
      state.pages.splice(payload, 1);
      state.currentPage = clamp(state.currentPage - (payload <= state.currentPage ? 1 : 0), 0, state.pages.length - 1);
      state.selectedId = null;
    },
    elementSelected(state, { payload }) {
      if (state.gesture) return;
      state.selectedId = state.pages[state.currentPage].elements.some((el) => el.id === payload) ? payload : null;
    },
    elementInserted: {
      prepare: (shape, position) => ({ payload: { shape, position, id: nanoid() } }),
      reducer(state, { payload }) {
        const preset = shapeCatalog.find((shape) => shape.id === payload.shape);
        if (!preset || state.gesture) return;
        remember(state);
        const elements = state.pages[state.currentPage].elements;
        const offset = (elements.length % 8) * 24;
        const x = payload.position ? payload.position.x - preset.w / 2 : (CANVAS_WIDTH - preset.w) / 2 + offset;
        const y = payload.position ? payload.position.y - preset.h / 2 : (CANVAS_HEIGHT - preset.h) / 2 + offset;
        elements.push(fitElement({ id: payload.id, type: "shape", shape: preset.id, x, y, w: preset.w, h: preset.h, rotation: 0, fill: "#ad8dea", opacity: 1 }));
        state.selectedId = payload.id;
      },
    },
    elementDeleted(state) {
      if (!selected(state) || state.gesture) return;
      remember(state);
      state.pages[state.currentPage].elements = state.pages[state.currentPage].elements.filter((el) => el.id !== state.selectedId);
      state.selectedId = null;
    },
    elementChanged(state, { payload }) {
      const el = selected(state);
      if (!el || state.gesture) return;
      const next = fitElement({ ...el, ...payload });
      if (JSON.stringify(el) === JSON.stringify(next)) return;
      remember(state); Object.assign(el, next);
    },
    elementNudged(state, { payload }) {
      const el = selected(state);
      if (!el || state.gesture) return;
      const next = fitElement({ ...el, x: el.x + payload.x, y: el.y + payload.y });
      if (next.x === el.x && next.y === el.y) return;
      remember(state); Object.assign(el, next);
    },
    elementReordered(state, { payload }) {
      if (state.gesture) return;
      const elements = state.pages[state.currentPage].elements;
      const from = elements.findIndex((el) => el.id === state.selectedId);
      if (from < 0) return;
      const to = clamp(from + payload, 0, elements.length - 1);
      if (from === to) return;
      remember(state);
      const [el] = elements.splice(from, 1); elements.splice(to, 0, el);
    },
    gestureStarted(state, { payload }) {
      if (!state.gesture && selected(state)) state.gesture = { token: payload, before: snapshot(state) };
    },
    elementTransformed(state, { payload }) {
      const el = selected(state);
      if (!el || state.gesture?.token !== payload.token) return;
      Object.assign(el, fitElement({ ...el, ...payload.changes }));
    },
    gestureFinished(state, { payload }) {
      if (state.gesture?.token !== payload) return;
      const before = state.gesture.before;
      if (JSON.stringify(before.pages) !== JSON.stringify(state.pages)) remember(state, before);
      state.gesture = null;
    },
    gestureCancelled(state, { payload }) {
      if (state.gesture?.token === payload) cancelGesture(state);
    },
    undo(state) {
      if (state.gesture) { cancelGesture(state); return; }
      if (!state.past.length) return;
      state.future.push(snapshot(state)); restore(state, state.past.pop());
    },
    redo(state) {
      if (state.gesture || !state.future.length) return;
      state.past.push(snapshot(state)); restore(state, state.future.pop());
    },
  },
});
export const { pageSelected, pageAdded, pageCopied, pageCloned, pageDeleted, elementSelected, elementInserted,
  elementDeleted, elementChanged, elementNudged, elementReordered, gestureStarted, elementTransformed,
  gestureFinished, gestureCancelled, undo, redo } = editorSlice.actions;
export default editorSlice.reducer;
