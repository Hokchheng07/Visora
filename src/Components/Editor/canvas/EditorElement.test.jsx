import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import editorReducer, { textInserted } from "../../redux/editorSlice.js";
import EditorElement from "./EditorElement.jsx";

// jsdom has no innerText; the editor reads it to keep line breaks.
beforeAll(() => {
  if (!("innerText" in HTMLElement.prototype)) {
    Object.defineProperty(HTMLElement.prototype, "innerText", {
      get() { return this.textContent; }, set(value) { this.textContent = value; }, configurable: true,
    });
  }
});
afterEach(cleanup);

function setup() {
  const store = configureStore({ reducer: { editor: editorReducer } });
  store.dispatch(textInserted("body"));
  const sheet = document.createElement("div");
  const editor = () => store.getState().editor;
  const element = () => editor().pages[0].elements[0];
  const view = render(
    <Provider store={store}>
      <EditorElement element={element()} pageId={editor().pages[0].id} sheetRef={{ current: sheet }} scale={1} selected />
    </Provider>,
  );
  const hit = view.container.querySelector(".editor-element-hit");
  const rerender = () => view.rerender(
    <Provider store={store}>
      <EditorElement element={element()} pageId={editor().pages[0].id} sheetRef={{ current: sheet }} scale={1} selected />
    </Provider>,
  );
  return { store, editor, element, hit, view, rerender };
}

function startEditing(hit) {
  act(() => { fireEvent.doubleClick(hit); });
  return hit.querySelector(".editor-text-art");
}

describe("EditorElement text editing", () => {
  it("Space typed in the text is not blocked by the element wrapper", () => {
    const { hit } = setup();
    const text = startEditing(hit);
    expect(text.getAttribute("contenteditable")).toBe("plaintext-only");
    // fireEvent returns false when a handler called preventDefault.
    expect(fireEvent.keyDown(text, { key: " " })).toBe(true);
    expect(fireEvent.keyDown(text, { key: "Enter" })).toBe(true);
  });

  it("while editing, the wrapper stops acting as a button", () => {
    const { hit } = setup();
    expect(hit.getAttribute("role")).toBe("button");
    startEditing(hit);
    expect(hit.hasAttribute("role")).toBe(false);
    expect(hit.getAttribute("tabindex")).toBe("-1");
  });

  it("Space on the focused wrapper still selects the element when not editing", () => {
    const { hit } = setup();
    expect(fireEvent.keyDown(hit, { key: " " })).toBe(false);
  });

  it("IME composition keys are never intercepted", () => {
    const { hit } = setup();
    expect(fireEvent.keyDown(hit, { key: " ", isComposing: true })).toBe(true);
  });

  it("control: pressing the wrapper when not editing does start a drag", () => {
    const { hit, editor } = setup();
    hit.setPointerCapture = () => {};
    fireEvent.pointerDown(hit, { button: 0, pointerId: 1, clientX: 5, clientY: 5 });
    expect(editor().gesture).not.toBe(null);
  });

  it("pressing inside text being edited does not start a canvas drag", () => {
    const { hit, editor } = setup();
    const text = startEditing(hit);
    hit.setPointerCapture = () => {};
    fireEvent.pointerDown(text, { button: 0, pointerId: 1, clientX: 5, clientY: 5 });
    expect(editor().gesture).toBe(null);
  });

  it("commit keeps repeated, leading and trailing spaces, turns non-breaking spaces into spaces, and is one undo step", () => {
    const { hit, element, editor } = setup();
    const history = editor().past.length;
    const text = startEditing(hit);
    text.textContent = "  Hello   world again ";
    act(() => { fireEvent.blur(text); });
    expect(element().content).toBe("  Hello   world again ");
    expect(editor().past.length).toBe(history + 1);
  });

  it("Escape puts the original text back", () => {
    const { hit, element } = setup();
    const text = startEditing(hit);
    text.textContent = "Changed";
    act(() => { fireEvent.keyDown(text, { key: "Escape" }); });
    expect(element().content).toBe("Add body text");
  });
});
