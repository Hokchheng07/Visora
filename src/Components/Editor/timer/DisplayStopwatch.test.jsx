import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DisplayTimer from "./DisplayTimer.jsx";
import { defaultTimer } from "../model/editorDocument.js";

const stopwatch = { id: "sw", type: "timer", x: 0, y: 0, w: 900, h: 460, rotation: 0, fill: "#705AE0", opacity: 1,
  fontFamily: "Poppins", fontSize: 120, timer: defaultTimer("HH:MM:SS", {}, "STOPWATCH") };
const digits = () => document.querySelector(".editor-timer-digits").textContent;
const press = (name) => act(() => { fireEvent.click(screen.getByRole("button", { name })); });
const wait = (ms) => act(() => { vi.advanceTimersByTime(ms); });

beforeEach(() => { vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "setTimeout", "Date"] }); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("stopwatch in display mode", () => {
  it("has only Start/Stop and Reset, and starts at zero", () => {
    render(<DisplayTimer element={stopwatch} />);
    expect(digits()).toBe("00:00:00");
    expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label")))
      .toEqual(["Start the stopwatch", "Reset stopwatch to zero"]);
  });

  it("counts up, Stop freezes the reading, Start carries on from it, Reset returns to zero", () => {
    const running = vi.fn();
    render(<DisplayTimer element={stopwatch} onRunningChange={running} />);
    press("Start the stopwatch");
    wait(5230);
    expect(digits()).toBe("00:00:05");
    expect(running).toHaveBeenLastCalledWith("sw", true);

    press("Stop the stopwatch");
    const frozen = digits();
    wait(3000);
    expect(digits()).toBe(frozen);

    press("Start the stopwatch again from here");
    wait(1000);
    expect(digits()).toBe("00:00:06");

    press("Reset stopwatch to zero");
    expect(digits()).toBe("00:00:00");
    expect(screen.getByRole("button", { name: "Start the stopwatch" })).toBeTruthy();
    expect(running).toHaveBeenLastCalledWith("sw", false);
  });

  it("the Stop button never leaves the presentation", () => {
    const leave = vi.fn();
    render(<DisplayTimer element={stopwatch} onRequestStop={leave} />);
    press("Start the stopwatch");
    wait(500);
    press("Stop the stopwatch");
    expect(leave).not.toHaveBeenCalled();
  });

  it("screen readers hear start, stop and reset, not every tick", () => {
    render(<DisplayTimer element={stopwatch} />);
    const live = document.querySelector("[aria-live='polite']");
    press("Start the stopwatch");
    expect(live.textContent).toBe("Stopwatch started");
    wait(2000);
    expect(live.textContent).toBe("Stopwatch started");
    press("Stop the stopwatch");
    expect(live.textContent).toBe("Stopwatch stopped at 00:00:02");
  });
});
