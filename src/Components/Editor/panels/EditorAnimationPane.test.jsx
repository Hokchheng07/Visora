import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import reducer, { animationAdded, animationChanged, elementInserted } from "../../redux/editorSlice.js";
import EditorAnimationPane from "./EditorAnimationPane.jsx";
import EditorToolPanel from "./EditorToolPanel.jsx";

afterEach(cleanup);
function setup() {
  const store = configureStore({ reducer: { editor: reducer } });
  store.dispatch(elementInserted("square"));
  const stop = vi.fn(), preview = vi.fn();
  render(<Provider store={store}><EditorToolPanel activeTool="animations" /><EditorAnimationPane docked onStopPreview={stop} onPreview={preview} /></Provider>);
  return { store, stop, preview };
}
describe("animation authoring", () => {
  it("keeps trigger editing on the right and defaults new effects by the existing steps", () => {
    const { store } = setup();
    expect(screen.queryByRole("combobox", { name: "New animation trigger" })).toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: "Fade in" })[1]);
    const row = store.getState().editor.pages[0].animations[0];
    expect(row.trigger).toBe("with");
    act(() => {
      store.dispatch(elementInserted("circle"));
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Fade in" })[1]);
    expect(store.getState().editor.pages[0].animations[1].trigger).toBe("with");
    act(() => {
      store.dispatch(animationChanged({ id: row.id, changes: { trigger: "click" } }));
      store.dispatch(elementInserted("square"));
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Fade in" })[1]);
    expect(store.getState().editor.pages[0].animations[2].trigger).toBe("click");
    expect(screen.getByRole("combobox", { name: "Animation trigger" })).toBeTruthy();
  });
  it("adds an entry, disables duplicate entrances, and edits row timing", () => {
    const { store } = setup();
    // Fade appears once for transitions and once for entrances.
    fireEvent.click(screen.getAllByRole("button", { name: "Fade in" })[1]);
    expect(store.getState().editor.pages[0].animations).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Fade in" })[1].disabled).toBe(true);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Animation delay" }), { target: { value: "0.3" } });
    expect(store.getState().editor.pages[0].animations[0].delayMs).toBe(300);
    fireEvent.click(screen.getByRole("button", { name: "Remove animation" }));
    expect(store.getState().editor.pages[0].animations).toHaveLength(0);
  });
  it("stores transitions separately and preview does not edit document state", () => {
    const { store, preview } = setup();
    fireEvent.change(screen.getByRole("combobox", { name: "Page transition" }), { target: { value: "morph" } });
    expect(store.getState().editor.pages[0].transition.preset).toBe("morph");
    const before = store.getState();
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(preview).toHaveBeenCalledOnce(); expect(store.getState()).toBe(before);
  });
  it("refuses overlapping timing while permitting After previous", () => {
    const store = configureStore({ reducer: { editor: reducer } }); store.dispatch(elementInserted("square"));
    store.dispatch(animationAdded({ kind: "entrance", preset: "fade" }));
    store.dispatch(animationAdded({ kind: "exit", preset: "fade", trigger: "after" }));
    render(<Provider store={store}><EditorAnimationPane docked onStopPreview={() => {}} onPreview={() => {}} /></Provider>);
    fireEvent.click(screen.getByRole("button", { name: /exit Square Fade out/ }));
    fireEvent.change(screen.getByRole("combobox", { name: "Animation trigger" }), { target: { value: "with" } });
    expect(screen.getByRole("status").textContent).toMatch(/overlap/);
    expect(store.getState().editor.pages[0].animations[1].trigger).toBe("after");
  });
});
