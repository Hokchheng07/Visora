import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import reducer, { animationAdded, animationChanged, elementInserted } from "../../redux/editorSlice.js";
import EditorAnimationPane from "./EditorAnimationPane.jsx";
import EditorToolPanel from "./EditorToolPanel.jsx";

afterEach(cleanup);

/* The selects are ours now, not the browser's, so a test picks an option the
   way a person does: open the menu, click the row. */
function pick(name, option) {
  fireEvent.click(screen.getByRole("button", { name }));
  fireEvent.click(screen.getByRole("option", { name: option }));
}

function setup() {
  const store = configureStore({ reducer: { editor: reducer } });
  store.dispatch(elementInserted("square"));
  const stop = vi.fn(), preview = vi.fn();
  function Harness() {
    const [mode, setMode] = useState("page");
    return <><EditorToolPanel activeTool="animations" animationMode={mode} onAnimationModeChange={setMode} onAnimationPreview={preview} />
      <EditorAnimationPane docked mode={mode} onStopPreview={stop} onPreview={preview} /></>;
  }
  render(<Provider store={store}><Harness /></Provider>);
  return { store, stop, preview };
}
describe("animation authoring", () => {
  it("keeps trigger editing on the right and defaults new effects by the existing steps", () => {
    const { store } = setup();
    fireEvent.click(screen.getByRole("tab", { name: "Element" }));
    expect(screen.queryByRole("button", { name: "New animation trigger" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Fade in" }));
    const row = store.getState().editor.pages[0].animations[0];
    expect(row.trigger).toBe("with");
    act(() => {
      store.dispatch(elementInserted("circle"));
    });
    fireEvent.click(screen.getByRole("button", { name: "Fade in" }));
    expect(store.getState().editor.pages[0].animations[1].trigger).toBe("with");
    act(() => {
      store.dispatch(animationChanged({ id: row.id, changes: { trigger: "click" } }));
      store.dispatch(elementInserted("square"));
    });
    fireEvent.click(screen.getByRole("button", { name: "Fade in" }));
    expect(store.getState().editor.pages[0].animations[2].trigger).toBe("click");
    expect(screen.getByRole("button", { name: "Animation trigger" })).toBeTruthy();
  });
  it("adds an entry, swaps duplicate entrance choices, previews it, and edits row timing", () => {
    const { store, preview } = setup();
    fireEvent.click(screen.getByRole("tab", { name: "Element" }));
    fireEvent.click(screen.getByRole("button", { name: "Fade in" }));
    expect(store.getState().editor.pages[0].animations).toHaveLength(1);
    expect(preview).toHaveBeenCalledWith(expect.objectContaining({ type: "element", kind: "entrance", preset: "fade" }));
    fireEvent.click(screen.getByRole("button", { name: "Rise in" }));
    expect(store.getState().editor.pages[0].animations).toHaveLength(1);
    expect(store.getState().editor.pages[0].animations[0].preset).toBe("rise");
    fireEvent.change(screen.getByRole("spinbutton", { name: "Animation delay" }), { target: { value: "0.3" } });
    expect(store.getState().editor.pages[0].animations[0].delayMs).toBe(300);
    fireEvent.click(screen.getByRole("button", { name: "Remove animation" }));
    expect(store.getState().editor.pages[0].animations).toHaveLength(0);
  });
  it("offers None for each phase and clears only that phase", () => {
    const { store } = setup();
    fireEvent.click(screen.getByRole("tab", { name: "Element" }));
    expect(screen.getAllByRole("button", { name: "None" })).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Fade in" }));
    fireEvent.click(screen.getByRole("button", { name: "Fade out" }));
    fireEvent.click(screen.getAllByRole("button", { name: "None" })[0]);
    expect(store.getState().editor.pages[0].animations.map((row) => row.kind)).toEqual(["exit"]);
  });
  it("stores transitions separately and preview does not edit document state", () => {
    const { store, preview } = setup();
    pick("Page transition", "Morph");
    expect(store.getState().editor.pages[0].transition.preset).toBe("morph");
    const before = store.getState();
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(preview).toHaveBeenCalledOnce(); expect(store.getState()).toBe(before);
  });
  it("refuses overlapping timing while permitting After previous", () => {
    const store = configureStore({ reducer: { editor: reducer } }); store.dispatch(elementInserted("square"));
    store.dispatch(animationAdded({ kind: "entrance", preset: "fade" }));
    store.dispatch(animationAdded({ kind: "exit", preset: "fade", trigger: "after" }));
    render(<Provider store={store}><EditorAnimationPane docked mode="element" onStopPreview={() => {}} onPreview={() => {}} /></Provider>);
    fireEvent.click(screen.getByRole("button", { name: /exit Square Fade out/ }));
    pick("Animation trigger", "With previous");
    expect(screen.getByRole("status").textContent).toMatch(/overlap/);
    expect(store.getState().editor.pages[0].animations[1].trigger).toBe("after");
  });
});
