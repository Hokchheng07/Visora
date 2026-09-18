import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it } from "vitest";
import editorReducer from "../../redux/editorSlice.js";
import EditorToolPanel from "./EditorToolPanel.jsx";

afterEach(cleanup);

describe("Timer panel", () => {
  it("offers a countdown and a stopwatch, with no colour pickers before adding", () => {
    const store = configureStore({ reducer: { editor: editorReducer } });
    render(<Provider store={store}><EditorToolPanel activeTool="timer" /></Provider>);
    expect(document.querySelectorAll("#editor-panel-timer input[type='color']")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Add a stopwatch" }));
    fireEvent.click(screen.getByRole("button", { name: "Add a countdown" }));
    const modes = store.getState().editor.pages[0].elements.map((element) => element.timer.mode);
    expect(modes).toEqual(["STOPWATCH", "COUNTDOWN"]);
  });
});
