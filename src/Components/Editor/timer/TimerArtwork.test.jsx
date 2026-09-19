import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import TimerArtwork from "./TimerArtwork.jsx";

const timerElement = {
  type: "timer",
  fill: "#705AE0",
  opacity: 1,
  fontFamily: "Poppins",
  fontSize: 120,
  timer: {
    durationMs: 90_000,
    format: "HH:MM:SS",
    onComplete: { sound: "chime", message: "" },
    controls: { startStop: true, pauseResume: true, reset: true },
  },
};

afterEach(cleanup);

describe("TimerArtwork", () => {
  it("draws editor and thumbnail controls as inert presentation only", () => {
    render(<TimerArtwork element={timerElement} />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
    for (const control of document.querySelectorAll(".editor-timer-button")) {
      expect(control.tagName).toBe("SPAN");
      expect(control.getAttribute("tabindex")).toBe("-1");
      expect(control.getAttribute("aria-hidden")).toBe("true");
      expect(control.hasAttribute("aria-label")).toBe(false);
    }
  });

  it("uses real accessible buttons only for the live DisplayTimer caller", () => {
    render(<TimerArtwork element={timerElement} interactive status="ready" />);
    const buttons = screen.getAllByRole("button");

    // Three positions, not four — Start and Stop share the first one.
    expect(buttons).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Start countdown" }).disabled).toBe(false);
    expect(screen.getByRole("button", { name: "Pause countdown" }).disabled).toBe(true);
    expect(screen.queryByRole("button", { name: /Stop presenting/ })).toBeNull();
  });

  it("does not render hidden controls and closes the row without placeholders", () => {
    const element = {
      ...timerElement,
      timer: { ...timerElement.timer, controls: { ...timerElement.timer.controls, pauseResume: false, reset: false } },
    };
    const { container } = render(<TimerArtwork element={element} />);
    const row = container.querySelector(".editor-timer-controls");

    // Only the locked Start/Stop position survives when the other two are off.
    expect(row.children).toHaveLength(1);
    expect(row.textContent).toContain("Start");
    expect(row.textContent).not.toContain("Pause");
    expect(row.textContent).not.toContain("Reset");
  });

  it("replaces only the digits with a wrappable completion message", () => {
    const message = "សូមអរគុណសម្រាប់ការចូលរួម — Thank you for celebrating this very special day with us";
    const element = {
      ...timerElement,
      timer: { ...timerElement.timer, onComplete: { ...timerElement.timer.onComplete, message } },
    };
    const { container } = render(<TimerArtwork element={element} status="completed" remainingMs={0} />);

    expect(screen.getByText(message).classList.contains("editor-timer-message")).toBe(true);
    expect(container.querySelector(".editor-timer-digits")).toBeNull();
    expect(container.querySelector(".editor-timer-controls").children).toHaveLength(3);
    // At zero the first position reads Stop, and Reset stays available.
    expect(screen.getByText("Stop")).toBeTruthy();
    expect(screen.getByText("Reset")).toBeTruthy();
  });
});

describe("the first control changes identity once the countdown begins", () => {
  const at = (status) => {
    cleanup();
    render(<TimerArtwork element={timerElement} interactive status={status} />);
    return [...document.querySelectorAll(".editor-timer-button")].map((b) => ({
      text: b.querySelector("span").textContent,
      disabled: b.disabled,
    }));
  };

  it("matches the agreed layout at every state", () => {
    expect(at("ready")).toEqual([
      { text: "Start", disabled: false },
      { text: "Pause", disabled: true },
      { text: "Reset", disabled: false },
    ]);
    expect(at("running")).toEqual([
      { text: "Stop", disabled: false },
      { text: "Pause", disabled: false },
      { text: "Reset", disabled: false },
    ]);
    expect(at("paused")).toEqual([
      { text: "Stop", disabled: false },
      { text: "Resume", disabled: false },
      { text: "Reset", disabled: false },
    ]);
    expect(at("completed")).toEqual([
      { text: "Stop", disabled: false },
      { text: "Pause", disabled: true },
      { text: "Reset", disabled: false },
    ]);
  });
});
