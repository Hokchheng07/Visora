import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GradientColourMenu from "./GradientColourMenu.jsx";

afterEach(cleanup);

function PaintHarness({ onCommit }) {
  const [paint, setPaint] = useState({ fill: "#223344", gradient: null });
  return (
    <GradientColourMenu
      label="Text colour"
      heading="Text colour"
      description="Fill the selected text."
      solid={paint.fill}
      gradient={paint.gradient}
      gradientTo="#8A1FA8"
      onChange={(next) => { onCommit(next); setPaint(next); }}
    />
  );
}

describe("GradientColourMenu", () => {
  it("switches toolbar text paint between a normalized gradient and its solid fallback", () => {
    const onCommit = vi.fn();
    render(<PaintHarness onCommit={onCommit} />);

    fireEvent.click(screen.getByRole("button", { name: "Text colour" }));
    fireEvent.click(screen.getByRole("button", { name: "Gradient" }));

    expect(onCommit).toHaveBeenLastCalledWith(expect.objectContaining({
      fill: "#223344",
      gradient: expect.objectContaining({
        type: "LINEAR",
        stops: [
          expect.objectContaining({ color: "#223344", offset: 0 }),
          expect.objectContaining({ color: "#8A1FA8", offset: 1 }),
        ],
      }),
    }));
    expect(screen.getByRole("button", { name: "Add gradient stop" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Solid" }));
    expect(onCommit).toHaveBeenLastCalledWith({ fill: "#223344", gradient: null });
  });
});
