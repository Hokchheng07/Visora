import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it } from "vitest";
import editorReducer, { elementInserted, elementSelected, elementsSelected, pageAdded, textInserted, timerInserted } from "../redux/editorSlice.js";
import EditorInspector from "./EditorInspector.jsx";

function setup(actions = [], props = { docked: true }) {
  const store = configureStore({ reducer: { editor: editorReducer } });
  actions.forEach((action) => store.dispatch(action));
  const view = render(<Provider store={store}><EditorInspector onClose={() => {}} {...props} /></Provider>);
  const editor = () => store.getState().editor;
  return { store, view, editor, element: () => editor().pages[editor().currentPage].elements[0] };
}
const scrubFor = (label) => screen.getByLabelText(label).closest("label").querySelector(".editor-inspector-scrub");

afterEach(cleanup);

describe("EditorInspector", () => {
  it("renders nothing when nothing is selected, so the page bar takes over", () => {
    const { view } = setup([pageAdded()]);
    expect(view.container.querySelector("#editor-inspector")).toBe(null);
  });

  it("names the selection in the header, with layer order and delete there", () => {
    setup([textInserted("heading")]);
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("heading", { name: "Text" })).toBeTruthy();
    expect(within(header).getByRole("button", { name: "Layer order" })).toBeTruthy();
    expect(within(header).getByRole("button", { name: "Delete" })).toBeTruthy();
  });

  it("text typed in the sidebar shows on the element as it is typed, and the run is one undo step", () => {
    const { editor, element } = setup([textInserted("heading")]);
    const history = editor().past.length;
    const content = screen.getByLabelText("Text content");
    for (const value of ["G", "Gr", "Gra", "Grad\nCeremony"]) {
      fireEvent.change(content, { target: { value } });
      expect(element().content).toBe(value);
    }
    fireEvent.blur(content);
    expect(editor().edit).toBe(null);
    expect(editor().past.length).toBe(history + 1);
  });

  it("Escape while typing puts the text back", () => {
    const { element } = setup([textInserted("heading")]);
    const content = screen.getByLabelText("Text content");
    fireEvent.change(content, { target: { value: "Oops" } });
    fireEvent.keyDown(content, { key: "Escape" });
    expect(element().content).toBe("Add a heading");
  });

  it("underline, weight and bold each commit as one undo step and stay in sync", () => {
    const { editor, element } = setup([textInserted("heading")]);
    let history = editor().past.length;
    fireEvent.click(screen.getByRole("button", { name: "Underline" }));
    expect(element().textDecoration).toBe("underline");
    expect(screen.getByRole("button", { name: "Underline" }).getAttribute("aria-pressed")).toBe("true");
    expect(editor().past.length).toBe(++history);

    fireEvent.change(screen.getByRole("combobox", { name: "Font weight" }), { target: { value: "500" } });
    expect(element().fontWeight).toBe(500);
    expect(screen.getByRole("button", { name: "Bold" }).getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(element().fontWeight).toBe(700);
  });

  it("the Khmer font note appears only for Khmer text", () => {
    const { element } = setup([textInserted("body")]);
    expect(screen.queryByRole("status")).toBe(null);
    fireEvent.change(screen.getByLabelText("Text content"), { target: { value: "សួស្តី" } });
    expect(element().content).toBe("សួស្តី");
    expect(screen.getByRole("status").textContent).toMatch(/Khmer/);
  });

  it("text has the same Effects section as shapes", () => {
    const { element } = setup([textInserted("heading")]);
    const titles = [...document.querySelectorAll(".editor-inspector-group h3")].map((heading) => heading.textContent);
    expect(titles.at(-1)).toBe("Effects");
    fireEvent.click(screen.getByRole("button", { name: "Add effect" }));
    expect(element().effects).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Hide effect" }));
    expect(element().effects[0].visible).toBe(false);
  });

  it("dragging a field label scrubs the value as one undo step", () => {
    const { editor, element } = setup([elementInserted("square")]);
    const history = editor().past.length, start = element().w;
    const handle = scrubFor("Width");
    fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 1 });
    for (const clientX of [110, 130, 160]) fireEvent.pointerMove(handle, { clientX, pointerId: 1 });
    fireEvent.pointerUp(handle, { pointerId: 1 });
    expect(element().w).toBe(start + 30);
    expect(editor().past.length).toBe(history + 1);
    expect(editor().edit).toBe(null);
  });

  it("invalid typed values go back to the last good value", () => {
    const { element } = setup([textInserted("body")]);
    const hex = screen.getByLabelText("Text colour hex");
    fireEvent.focus(hex);
    fireEvent.change(hex, { target: { value: "zz" } });
    fireEvent.blur(hex);
    expect(element().fill).toBe("#29243a");
    expect(hex.value).toBe("29243A");
  });

  it("shape fill: colour and fill opacity sit in one row; each typed value commits once", () => {
    const { editor, element } = setup([elementInserted("square")]);
    const history = editor().past.length;
    const hex = screen.getByLabelText("Fill hex");
    fireEvent.focus(hex);
    for (const value of ["1", "12", "123"]) fireEvent.change(hex, { target: { value } });
    fireEvent.keyDown(hex, { key: "Enter" });
    const opacity = screen.getByLabelText("Fill opacity");
    expect(hex.closest(".editor-inspector-frame")).toBe(opacity.closest(".editor-inspector-frame"));
    fireEvent.focus(opacity);
    fireEvent.change(opacity, { target: { value: "40" } });
    fireEvent.blur(opacity);
    expect(element().fill).toBe("#112233");
    expect(element().fillOpacity).toBe(0.4);
    expect(element().opacity).toBe(1);
    expect(editor().past.length).toBe(history + 2);
  });

  it("shape sections follow Figma's order", () => {
    setup([elementInserted("star")]);
    const titles = [...document.querySelectorAll(".editor-inspector-group h3")].map((heading) => heading.textContent);
    expect(titles).toEqual(["Position", "Layout", "Appearance", "Fill", "Stroke", "Effects"]);
  });

  it("fill can be hidden and removed, stroke added with a position, and effects added up to four", () => {
    const { element } = setup([elementInserted("square")]);
    fireEvent.click(screen.getByRole("button", { name: "Hide fill" }));
    expect(element().fillVisible).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Remove fill" }));
    expect(element().fill).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Add fill" }));
    expect(element().fill).toBe("#D9D9D9");

    fireEvent.click(screen.getByRole("button", { name: "Add stroke" }));
    expect(element().stroke).toBe("#211D29");
    fireEvent.change(screen.getByRole("combobox", { name: "Stroke position" }), { target: { value: "outside" } });
    expect(element().strokeAlign).toBe("outside");

    const add = screen.getByRole("button", { name: "Add effect" });
    for (let count = 0; count < 4; count++) fireEvent.click(add);
    expect(element().effects.length).toBe(4);
    expect(screen.getByRole("button", { name: "Up to 4 effects" }).disabled).toBe(true);
    fireEvent.change(screen.getByRole("combobox", { name: "Effect 2 type" }), { target: { value: "INNER_SHADOW" } });
    expect(element().effects[1].type).toBe("INNER_SHADOW");
    fireEvent.click(screen.getAllByRole("button", { name: "Remove effect" })[0]);
    expect(element().effects.length).toBe(3);
  });

  it("locked proportions keep the shape's ratio when a size is typed", () => {
    const { element } = setup([elementInserted("rectangle")]);
    const { w, h } = element();
    fireEvent.click(screen.getByRole("button", { name: "Lock proportions" }));
    expect(element().lockAspect).toBe(true);
    const width = screen.getByLabelText("Width");
    fireEvent.focus(width);
    fireEvent.change(width, { target: { value: String(w / 2) } });
    fireEvent.blur(width);
    expect(element().h).toBeCloseTo(h / 2, 5);
  });

  it("rotate 90°, flips, corner radius and page alignment", () => {
    const { element } = setup([elementInserted("square")]);
    fireEvent.click(screen.getByRole("button", { name: "Rotate 90° right" }));
    expect(element().rotation).toBe(90);
    fireEvent.click(screen.getByRole("button", { name: "Flip horizontal" }));
    expect(element().flipX).toBe(true);
    const radius = screen.getByLabelText("Corner radius");
    fireEvent.focus(radius);
    fireEvent.change(radius, { target: { value: "24" } });
    fireEvent.blur(radius);
    expect(element().cornerRadius).toBe(24);
    fireEvent.click(screen.getByRole("button", { name: "Align left" }));
    expect(Math.round(element().x)).toBe(0);
  });

  it("a typed value still reaches its element when the selection changes before it commits", () => {
    const { store, editor } = setup([elementInserted("square"), elementInserted("circle")]);
    const [first, second] = editor().pages[0].elements;
    act(() => { store.dispatch(elementSelected(first.id)); });
    const x = screen.getByLabelText("X position");
    fireEvent.focus(x);
    fireEvent.change(x, { target: { value: "42" } });
    // Selecting another element swaps the body before the field can blur.
    act(() => { store.dispatch(elementSelected(second.id)); });
    expect(editor().pages[0].elements[0].x).toBe(42);
    expect(editor().pages[0].elements[1].x).not.toBe(42);
  });

  it("several selected: distribute needs three, and delete removes them all", () => {
    const { store, editor } = setup([elementInserted("square"), elementInserted("circle")]);
    act(() => { store.dispatch(elementsSelected(editor().pages[0].elements.map((item) => item.id))); });
    expect(screen.getByRole("heading", { name: "2 elements" })).toBeTruthy();
    for (const button of screen.getAllByRole("button", { name: "Select three or more to space evenly" })) expect(button.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Align left edges" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete 2 elements" }));
    expect(editor().pages[0].elements.length).toBe(0);
  });

  it("shows the timer settings for a selected timer", () => {
    const { editor, element } = setup([timerInserted()]);
    expect(screen.getByRole("combobox", { name: "Completion sound" })).toBeTruthy();
    const history = editor().past.length;
    const minutes = screen.getByLabelText("Minutes");
    fireEvent.focus(minutes);
    fireEvent.change(minutes, { target: { value: "1" } });
    fireEvent.change(minutes, { target: { value: "12" } });
    fireEvent.blur(minutes);
    expect(element().timer.durationMs).toBe(12 * 60 * 1000);
    expect(editor().past.length).toBe(history + 1);
  });

  it("the Start / Stop toggle stays locked on", () => {
    setup([timerInserted()]);
    const toggle = within(screen.getByText("Start / Stop").closest("label")).getByRole("checkbox");
    expect(toggle.disabled).toBe(true);
    expect(toggle.checked).toBe(true);
  });

  it("as a drawer it has a close button; docked it does not", () => {
    setup([elementInserted("square")], { docked: false });
    expect(screen.getByLabelText("Close Customize")).toBeTruthy();
    cleanup();
    setup([elementInserted("square")], { docked: true });
    expect(screen.queryByLabelText("Close Customize")).toBe(null);
  });
});
