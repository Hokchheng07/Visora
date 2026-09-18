import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InspectorResizer, PanelToggle } from "./EditorLayoutHandles.jsx";

afterEach(cleanup);

describe("PanelToggle", () => {
  it("names what it will do and shows the shortcut", () => {
    const onToggle = vi.fn();
    const { rerender } = render(<PanelToggle open controls="panel" onToggle={onToggle} />);
    const button = screen.getByRole("button", { name: "Collapse panel" });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.textContent).toMatch(/\//);
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
    rerender(<PanelToggle open={false} controls="panel" onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: "Expand panel" })).toBeTruthy();
  });
});

describe("InspectorResizer", () => {
  it("drags wider to the left, stays within 260–480 px, and double-click resets", () => {
    const onResize = vi.fn();
    render(<InspectorResizer width={300} onResize={onResize} />);
    const handle = screen.getByRole("separator", { name: "Resize Customize panel" });
    handle.setPointerCapture = () => {};
    fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 1000 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 940 });
    expect(onResize).toHaveBeenLastCalledWith(360);
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 400 });
    expect(onResize).toHaveBeenLastCalledWith(480);
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 1400 });
    expect(onResize).toHaveBeenLastCalledWith(260);
    fireEvent.pointerUp(handle, { pointerId: 1 });
    fireEvent.doubleClick(handle);
    expect(onResize).toHaveBeenLastCalledWith(300);
  });

  it("arrow keys resize from the keyboard", () => {
    const onResize = vi.fn();
    render(<InspectorResizer width={300} onResize={onResize} />);
    const handle = screen.getByRole("separator");
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(onResize).toHaveBeenLastCalledWith(316);
    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
    expect(onResize).toHaveBeenLastCalledWith(260);
  });
});
