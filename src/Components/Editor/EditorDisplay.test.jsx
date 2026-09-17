import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import EditorDisplay from "./EditorDisplay.jsx";
vi.mock("animejs", () => ({ animate: () => ({ cancel: vi.fn(), revert: vi.fn() }), createTimer: () => ({ revert: vi.fn() }) }));
vi.mock("motion/react", () => ({ useReducedMotion: () => false }));
afterEach(cleanup);
const shape = (id) => ({ id, type: "shape", shape: "square", w: 100, h: 100, x: 0, y: 0, rotation: 0, opacity: 1, fill: "#ff0000" });
const entry = (elementId, trigger = "with") => ({ id: `${elementId}:row`, elementId, kind: "entrance", preset: "fade", trigger, delayMs: 0, durationMs: 500 });
const pages = [{ id: "p1", elements: [shape("a")], animations: [entry("a", "click")] }, { id: "p2", elements: [shape("b")], transition: { preset: "rise", durationMs: 700, delayMs: 0 }, animations: [entry("b")] }];
it("navigation uses click steps; held keys and focused controls do not advance", () => {
  const { container } = render(<EditorDisplay pages={pages} onClose={() => {}} />);
  const a = () => container.querySelector('[data-element-id="a"]');
  expect(a().style.visibility).toBe("hidden");
  fireEvent.keyDown(document, { key: "ArrowRight", repeat: true }); expect(a().style.visibility).toBe("hidden");
  fireEvent.keyDown(screen.getByRole("button", { name: "Next page" }), { key: " " }); expect(a().style.visibility).toBe("hidden");
  fireEvent.click(screen.getByRole("button", { name: "Next page" }));
  fireEvent.click(screen.getByRole("button", { name: "Next page" })); expect(a().style.opacity).toBe("1");
  fireEvent.keyDown(document, { key: "ArrowRight" }); expect(screen.getByRole("dialog").getAttribute("aria-label")).toContain("page 2");
  fireEvent.keyDown(document, { key: "ArrowRight" });
  expect(container.querySelector('[data-element-id="b"]').style.opacity).toBe("1");
  fireEvent.keyDown(document, { key: "ArrowRight" }); expect(screen.getByRole("dialog").getAttribute("aria-label")).toContain("page 2");
  fireEvent.click(screen.getByRole("button", { name: "Previous page" })); expect(a().style.visibility).toBe("hidden");
});
it("Previous resets automatic entry without replaying the page transition", () => {
  const first = { ...pages[0], animations: [entry("a")] };
  const { container } = render(<EditorDisplay pages={[first, pages[1]]} initialPage={1} onClose={() => {}} />);
  fireEvent.keyDown(document, { key: "ArrowLeft" });
  expect(container.querySelector('.editor-animation-surface').style.opacity).toBe("1");
  expect(container.querySelector('[data-element-id="a"]').style.opacity).toBe("0");
  fireEvent.keyDown(document, { key: "ArrowRight" });
  expect(screen.getByRole("dialog").getAttribute("aria-label")).toContain("page 2");
});
it("one Next advances from each unfinished morph-only entry, by button, page click or key", () => {
  const slides = ['a', 'b', 'c', 'd'].map((id) => ({ id, elements: [{ ...shape(id), morphId: 'shared' }],
    transition: { preset: 'morph', durationMs: 1000, delayMs: 0 }, animations: [] }));
  const { container } = render(<EditorDisplay pages={slides} onClose={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByRole('dialog').getAttribute('aria-label')).toContain('page 2');
  expect(container.querySelector('.editor-morph-overlay')).not.toBeNull();
  fireEvent.click(container.querySelector('.editor-display-frame'));
  expect(screen.getByRole('dialog').getAttribute('aria-label')).toContain('page 3');
  fireEvent.keyDown(document, { key: 'ArrowRight' });
  expect(screen.getByRole('dialog').getAttribute('aria-label')).toContain('page 4');
  fireEvent.keyDown(document, { key: 'ArrowRight' });
  expect(screen.getByRole('dialog').getAttribute('aria-label')).toContain('page 4');
  expect(container.querySelector('.editor-morph-overlay').style.visibility).toBe('hidden');
});
it("first-slide Morph falls back to Fade and finishes normally", () => {
  const first = { ...pages[0], transition: { preset: "morph", durationMs: 700, delayMs: 0 }, animations: [] };
  const { container } = render(<EditorDisplay pages={[first]} onClose={() => {}} />);
  expect(container.querySelector('.editor-morph-overlay')).toBeNull();
  expect(container.querySelector('.editor-animation-surface').style.opacity).toBe('0');
  fireEvent.keyDown(document, { key: "ArrowRight" });
  expect(container.querySelector('.editor-animation-surface').style.opacity).toBe('1');
});
