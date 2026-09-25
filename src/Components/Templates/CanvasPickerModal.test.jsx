import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import editorReducer, { documentLoaded } from "../redux/editorSlice.js";
import CanvasPickerModal from "./CanvasPickerModal.jsx";

afterEach(cleanup);

describe("CanvasPickerModal", () => {
  it("offers exactly the four supported presets and returns their actual dimensions", () => {
    const onCreate = vi.fn();
    render(<CanvasPickerModal open onClose={() => {}} onCreate={onCreate} />);

    const presets = [
      ["Presentation 16:9", 1920, 1080],
      ["Presentation 4:3", 1920, 1440],
      ["Portrait 9:16", 1080, 1920],
      ["A4 document", 1358, 1920],
    ];
    for (const [label, width, height] of presets) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(label) }));
      expect(onCreate).toHaveBeenLastCalledWith({ width, height });
    }
    expect(onCreate).toHaveBeenCalledTimes(4);
  });

  it("accepts a custom size in pixels", () => {
    const onCreate = vi.fn();
    render(<CanvasPickerModal open onClose={() => {}} onCreate={onCreate} />);
    fireEvent.click(screen.getByRole("button", { name: "Custom size" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: /Width/ }), { target: { value: "1200" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: /Height/ }), { target: { value: "800" } });
    fireEvent.click(screen.getByRole("button", { name: "Create design" }));
    expect(onCreate).toHaveBeenCalledWith({ width: 1200, height: 800 });
  });

  it("starts a fresh blank document at the selected size", () => {
    const sized = editorReducer(undefined, documentLoaded({ canvas: { width: 1358, height: 1920 } }));
    expect(sized.canvas).toEqual({ width: 1358, height: 1920 });
    expect(sized.pages).toHaveLength(1);
    expect(sized.pages[0].elements).toEqual([]);
  });
});
