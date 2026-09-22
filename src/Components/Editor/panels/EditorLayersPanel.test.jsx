import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it } from "vitest";
import editorReducer, { elementInserted, textInserted, timerInserted, elementsSelected, pageAdded, pageSelected, undo } from "../../redux/editorSlice.js";
import EditorLayersPanel from "./EditorLayersPanel.jsx";
import EditorInspector from "../inspector/EditorInspector.jsx";
import EditorElement from "../canvas/EditorElement.jsx";
import { useRef } from "react";
import { useEditorKeyboard } from "../hooks/useEditorKeyboard.js";
import { selectionGrouped, elementSelected } from "../../redux/editorSlice.js";

function KeyboardShell({ children }) {
  const ref = useRef(null);
  useEditorKeyboard(false, ref);
  return <div ref={ref}>{children}<input aria-label="Typing" /></div>;
}

function setup(actions = [elementInserted("star"), textInserted("heading"), timerInserted()]) {
  const store = configureStore({ reducer: { editor: editorReducer } });
  actions.forEach((action) => store.dispatch(action));
  const view = render(<Provider store={store}><EditorLayersPanel /><EditorInspector docked onClose={() => {}} /></Provider>);
  const editor = () => store.getState().editor;
  const elements = () => editor().pages[0].elements;
  return { store, view, editor, elements };
}
const rows = () => screen.getAllByRole("treeitem");

afterEach(cleanup);

describe("layer keyboard and canvas selection", () => {
  it("handles all four ordering keys but leaves input typing alone", () => {
    const store = configureStore({ reducer: { editor: editorReducer } });
    for (let i = 0; i < 3; i++) store.dispatch(elementInserted("rectangle"));
    const ids = store.getState().editor.pages[0].elements.map(e => e.id);
    store.dispatch(elementSelected(ids[1]));
    render(<Provider store={store}><KeyboardShell /></Provider>);
    const order = () => store.getState().editor.pages[0].elements.map(e => e.id);
    expect(fireEvent.keyDown(document.body, { key: "]", code: "BracketRight" })).toBe(false);
    expect(order()).toEqual([ids[0], ids[2], ids[1]]);
    expect(fireEvent.keyDown(document.body, { key: "[", code: "BracketLeft" })).toBe(false);
    expect(order()).toEqual(ids);
    expect(fireEvent.keyDown(document.body, { key: "[", metaKey: true })).toBe(false);
    expect(order()).toEqual([ids[1], ids[0], ids[2]]);
    expect(fireEvent.keyDown(document.body, { key: "]", ctrlKey: true })).toBe(false);
    expect(order()).toEqual([ids[0], ids[2], ids[1]]);
    const before = order();
    expect(fireEvent.keyDown(screen.getByLabelText("Typing"), { key: "[", metaKey: true })).toBe(true);
    expect(order()).toEqual(before);
  });

  it("selects a canvas group, deep-selects a member, and climbs out with Escape", () => {
    const store = configureStore({ reducer: { editor: editorReducer } });
    store.dispatch(elementInserted("rectangle")); store.dispatch(elementInserted("star"));
    const page = store.getState().editor.pages[0];
    store.dispatch(elementsSelected(page.elements.map(e => e.id))); store.dispatch(selectionGrouped()); store.dispatch(elementSelected(null));
    const sheetRef = { current: document.createElement("div") };
    const element = store.getState().editor.pages[0].elements[0];
    const { container } = render(<Provider store={store}><KeyboardShell><EditorElement element={element} pageId={page.id} sheetRef={sheetRef} scale={1} /></KeyboardShell></Provider>);
    const hit = container.querySelector(".editor-element-hit");
    hit.setPointerCapture = () => {}; hit.hasPointerCapture = () => false;
    sheetRef.current.getBoundingClientRect = () => ({ width: 1920 });
    const click = metaKey => { fireEvent.pointerDown(hit, { button: 0, pointerId: 9, clientX: 10, clientY: 10, metaKey }); fireEvent.pointerUp(hit, { pointerId: 9, clientX: 10, clientY: 10 }); };
    click(false); expect(store.getState().editor.selectionMode).toBe("group");
    click(true); expect(store.getState().editor.selectedIds).toEqual([element.id]); expect(store.getState().editor.selectionMode).toBe("direct");
    fireEvent.keyDown(document.body, { key: "Escape" }); expect(store.getState().editor.selectionMode).toBe("group");
    fireEvent.keyDown(document.body, { key: "Escape" }); expect(store.getState().editor.selectedIds).toEqual([]);
  });
});

describe("EditorLayersPanel", () => {
  function positionRows() {
    rows().forEach((row, index) => {
      row.getBoundingClientRect = () => ({ left: 0, right: 300, width: 300, top: 100 + index * 44, bottom: 140 + index * 44, height: 40 });
      row.setPointerCapture = () => {}; row.hasPointerCapture = () => false;
    });
  }

  it("a real pointer sequence reorders once and suppresses the following click", () => {
    const { editor, elements } = setup(); positionRows();
    const original = elements().map((item) => item.id), history = editor().past.length;
    const star = screen.getByRole("treeitem", { name: "Star" });
    fireEvent.pointerDown(star, { button: 0, pointerId: 7, clientX: 50, clientY: 200 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 50, clientY: 102 });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 50, clientY: 102 });
    expect(elements().map((item) => item.id)).toEqual([original[1], original[2], original[0]]);
    expect(editor().past.length).toBe(history + 1);
    const selection = editor().selectedIds;
    fireEvent.click(star); expect(editor().selectedIds).toEqual(selection);
  });

  it("Escape cancels a pointer drag without changing order or undo", () => {
    const { editor, elements } = setup(); positionRows();
    const before = elements(), history = editor().past.length;
    fireEvent.pointerDown(screen.getByRole("treeitem", { name: "Star" }), { button: 0, pointerId: 8, clientX: 50, clientY: 200 });
    fireEvent.pointerMove(window, { pointerId: 8, clientX: 50, clientY: 102 });
    expect(fireEvent.keyDown(document, { key: "Escape" })).toBe(false);
    fireEvent.pointerUp(window, { pointerId: 8, clientX: 50, clientY: 102 });
    expect(elements()).toBe(before); expect(editor().past.length).toBe(history);
  });

  it("small movement remains a click and locked rows cannot drag", () => {
    const { editor, elements } = setup(); positionRows();
    const star = screen.getByRole("treeitem", { name: "Star" });
    const before = elements(), history = editor().past.length;
    fireEvent.pointerDown(star, { button: 0, pointerId: 3, clientX: 50, clientY: 200 });
    fireEvent.pointerMove(window, { pointerId: 3, clientX: 52, clientY: 202 });
    fireEvent.pointerUp(window, { pointerId: 3, clientX: 52, clientY: 202 });
    fireEvent.click(star);
    expect(editor().selectedIds).toEqual([before[0].id]);
    expect(elements()).toBe(before); expect(editor().past.length).toBe(history);
    fireEvent.click(screen.getByRole("button", { name: "Lock Star" }));
    const locked = elements(), lockedHistory = editor().past.length;
    fireEvent.pointerDown(star, { button: 0, pointerId: 4, clientX: 50, clientY: 200 });
    fireEvent.pointerMove(window, { pointerId: 4, clientX: 50, clientY: 102 });
    fireEvent.pointerUp(window, { pointerId: 4, clientX: 50, clientY: 102 });
    expect(elements()).toBe(locked); expect(editor().past.length).toBe(lockedHistory);
  });

  it.each(["pointerCancel", "blur"])("%s cancels without saving a layer move", (event) => {
    const { editor, elements } = setup(); positionRows();
    const before = elements(), history = editor().past.length;
    fireEvent.pointerDown(screen.getByRole("treeitem", { name: "Star" }), { button: 0, pointerId: 8, clientX: 50, clientY: 200 });
    fireEvent.pointerMove(window, { pointerId: 8, clientX: 50, clientY: 102 });
    fireEvent[event](window, { pointerId: 8 });
    fireEvent.pointerUp(window, { pointerId: 8, clientX: 50, clientY: 102 });
    expect(elements()).toBe(before); expect(editor().past.length).toBe(history);
  });

  it("group creation, collapse, inspector rename, ungroup, and undo keep members intact", () => {
    const { store, elements, editor } = setup();
    act(() => { store.dispatch(elementsSelected(elements().slice(0, 2).map((item) => item.id))); });
    fireEvent.click(screen.getByRole("button", { name: "Group selection", exact: true }));
    expect(editor().pages[0].groups).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Collapse Group 1" }));
    expect(screen.queryByRole("treeitem", { name: "Star", exact: true })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Expand Group 1" }));
    fireEvent.click(screen.getByTitle("Rename group"));
    fireEvent.change(screen.getByRole("textbox", { name: "Group name" }), { target: { value: "Header" } });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Group name" }), { key: "Enter" });
    expect(editor().pages[0].groups[0].name).toBe("Header");
    fireEvent.click(screen.getAllByRole("button", { name: "Ungroup", exact: true })[0]);
    expect(editor().pages[0].groups).toHaveLength(0);
    act(() => { store.dispatch(undo()); });
    expect(editor().selectionMode).toBe("group");
    expect(editor().pages[0].groups[0].name).toBe("Header");
  });
  it("lists layers front to back with computed names", () => {
    setup();
    expect(rows().map((row) => row.getAttribute("aria-label"))).toEqual(["Countdown timer", "Add a heading", "Star"]);
    expect(rows().map((row) => row.getAttribute("aria-level"))).toEqual(["1", "1", "1"]);
  });

  it("double-click renames a layer: Enter saves as one undo step, Escape keeps the old name", () => {
    const { editor, elements } = setup();
    const history = editor().past.length;
    fireEvent.doubleClick(screen.getByRole("treeitem", { name: "Star" }));
    const field = screen.getByRole("textbox", { name: "Layer name" });
    fireEvent.change(field, { target: { value: "  Gold star " } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(elements()[0].name).toBe("Gold star");
    expect(editor().past.length).toBe(history + 1);

    fireEvent.keyDown(screen.getByRole("treeitem", { name: "Gold star" }), { key: "F2" });
    fireEvent.change(screen.getByRole("textbox", { name: "Layer name" }), { target: { value: "Changed" } });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Layer name" }), { key: "Escape" });
    expect(elements()[0].name).toBe("Gold star");
    expect(editor().past.length).toBe(history + 1);
  });

  it("an empty name changes nothing", () => {
    const { editor } = setup();
    const history = editor().past.length;
    fireEvent.doubleClick(screen.getByRole("treeitem", { name: "Star" }));
    const field = screen.getByRole("textbox", { name: "Layer name" });
    fireEvent.change(field, { target: { value: "   " } });
    fireEvent.blur(field);
    expect(editor().past.length).toBe(history);
    expect(screen.getByRole("treeitem", { name: "Star" })).toBeTruthy();
  });

  it("arrow keys walk the tree, expand and collapse groups, and Enter selects", () => {
    const { store, editor, elements } = setup();
    act(() => { store.dispatch(elementsSelected(elements().slice(0, 2).map((item) => item.id))); });
    fireEvent.click(screen.getByRole("button", { name: "Group selection", exact: true }));
    const timer = screen.getByRole("treeitem", { name: "Countdown timer" });
    // Only one row is in the tab order at a time.
    expect(rows().filter((row) => row.tabIndex === 0)).toHaveLength(1);
    timer.focus();
    fireEvent.keyDown(timer, { key: "ArrowDown" });
    const group = screen.getByRole("treeitem", { name: "Group 1" });
    expect(document.activeElement).toBe(group);
    expect(group.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(group, { key: "ArrowLeft" });
    expect(screen.getByRole("treeitem", { name: "Group 1" }).getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("treeitem", { name: "Star" })).toBe(null);
    fireEvent.keyDown(screen.getByRole("treeitem", { name: "Group 1" }), { key: "ArrowRight" });
    const child = screen.getByRole("treeitem", { name: "Star" });
    expect(child.getAttribute("aria-level")).toBe("2");
    fireEvent.keyDown(screen.getByRole("treeitem", { name: "Group 1" }), { key: "ArrowRight" });
    expect(document.activeElement.getAttribute("aria-label")).toBe("Add a heading");
    fireEvent.keyDown(child, { key: "Enter" });
    expect(editor().selectedIds).toEqual([elements()[0].id]);
    fireEvent.keyDown(child, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(screen.getByRole("treeitem", { name: "Group 1" }));
  });

  it("moves the selection to another page and follows it there", () => {
    const { store, editor, elements } = setup();
    act(() => { store.dispatch(pageAdded()); store.dispatch(pageSelected(0)); store.dispatch(elementSelected(elements()[0].id)); });
    const moved = elements()[0].id, history = editor().past.length;
    fireEvent.click(screen.getByRole("button", { name: "Move to page" }));
    fireEvent.click(screen.getByRole("button", { name: "2 · Page 2" }));
    expect(editor().currentPage).toBe(1);
    expect(editor().pages[0].elements.some((item) => item.id === moved)).toBe(false);
    expect(editor().pages[1].elements.at(-1).id).toBe(moved);
    expect(editor().selectedIds).toEqual([moved]);
    expect(editor().past.length).toBe(history + 1);
    act(() => { store.dispatch(undo()); });
    expect(editor().pages[0].elements.some((item) => item.id === moved)).toBe(true);
    expect(editor().currentPage).toBe(0);
  });

  it("renames the page from the panel heading", () => {
    const { editor } = setup();
    fireEvent.doubleClick(screen.getByRole("button", { name: "Page 1" }));
    const field = screen.getByRole("textbox", { name: "Page name" });
    fireEvent.change(field, { target: { value: "Opening" } });
    fireEvent.blur(field);
    expect(editor().pages[0].name).toBe("Opening");
    expect(screen.getByRole("tree", { name: "Layers on Opening" })).toBeTruthy();
  });

  it("a hidden layer stays in the list and can be shown again", () => {
    const { elements } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Hide Star" }));
    expect(elements()[0].visible).toBe(false);
    const row = screen.getByRole("treeitem", { name: "Star" });
    expect(row.className).toMatch(/is-hidden/);
    fireEvent.click(within(row).getByRole("button", { name: "Show Star" }));
    expect(elements()[0].visible).toBe(true);
  });

  it("a locked layer can be selected here; the sidebar disables its fields and unlocks in one press", () => {
    const { elements, editor } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Lock Star" }));
    expect(elements()[0].locked).toBe(true);
    fireEvent.click(screen.getByRole("treeitem", { name: "Star" }));
    expect(editor().selectedIds).toEqual([elements()[0].id]);
    expect(screen.getByRole("status").textContent).toMatch(/Locked/);
    expect(screen.getByLabelText("X position").disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Delete layer" }).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Unlock" }));
    expect(elements()[0].locked).toBe(false);
    expect(screen.getByLabelText("X position").disabled).toBe(false);
  });
});

describe("locked elements on the canvas", () => {
  it("ignore the pointer and cannot start text editing", () => {
    const store = configureStore({ reducer: { editor: editorReducer } });
    store.dispatch(textInserted("body"));
    const element = store.getState().editor.pages[0].elements[0];
    const { container } = render(
      <Provider store={store}>
        <EditorElement element={element} pageId={store.getState().editor.pages[0].id} sheetRef={{ current: document.createElement("div") }} scale={1} locked />
      </Provider>,
    );
    expect(container.querySelector(".editor-element").className).toMatch(/is-locked/);
    const hit = container.querySelector(".editor-element-hit");
    act(() => { fireEvent.doubleClick(hit); });
    expect(hit.querySelector(".editor-text-art").getAttribute("contenteditable")).toBe("false");
  });
});
