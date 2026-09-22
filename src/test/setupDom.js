/* jsdom ships no ResizeObserver, and Headless UI's menus measure their anchor
   with one. Without this the popups throw on close and take the rest of the
   test file with them. */
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
