import { useEffect, useLayoutEffect, useRef, useState } from "react";

/*
 * One menu for every right-click in the editor — pages, elements and bare
 * canvas. The page strip grew this behaviour first (position at the click,
 * flip to stay on screen, close on outside pointerdown / Escape / scroll /
 * resize); generalising it beats writing a second menu that drifts from it.
 *
 * `items` are plain objects so callers stay declarative:
 *   { id, label, icon, shortcut, disabled, danger } | { divider: true }
 */
export default function EditorContextMenu({ x, y, items, label, onAction, onClose, openUpwards = false }) {
  const ref = useRef(null);
  const [position, setPosition] = useState(() => (openUpwards ? { left: x, bottom: 0 } : { left: x, top: y }));

  useLayoutEffect(() => {
    const box = ref.current?.getBoundingClientRect();
    const width = box?.width ?? 0;
    const height = box?.height ?? 0;
    const left = Math.max(8, Math.min(x, window.innerWidth - width - 8));
    if (openUpwards) {
      setPosition({ left, bottom: Math.max(8, window.innerHeight - y) });
      return;
    }
    // Flip above the pointer when there isn't room below it.
    const fitsBelow = y + height + 8 <= window.innerHeight;
    setPosition(fitsBelow
      ? { left, top: y }
      : { left, top: Math.max(8, y - height) });
  }, [x, y, openUpwards, items]);

  useEffect(() => {
    function handlePointerDown(event) { if (!ref.current?.contains(event.target)) onClose(); }
    function handleKeyDown(event) {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); return; }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      // Roving focus, so the menu is usable from Shift+F10 without a mouse.
      event.preventDefault();
      const rows = [...(ref.current?.querySelectorAll("button:not(:disabled)") ?? [])];
      if (!rows.length) return;
      const at = rows.indexOf(document.activeElement);
      const next = event.key === "ArrowDown" ? at + 1 : at - 1;
      rows[(next + rows.length) % rows.length].focus();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  return (
    <div ref={ref} className="editor-context-menu" role="menu" aria-label={label}
      style={openUpwards
        ? { left: `${position.left}px`, bottom: `${position.bottom}px` }
        : { left: `${position.left}px`, top: `${position.top}px` }}>
      {items.map((item, index) => (item.divider ? (
        <hr key={`divider-${index}`} />
      ) : (
        <button key={item.id} type="button" role="menuitem" disabled={item.disabled}
          className={item.danger ? "is-danger" : undefined}
          onClick={() => { onAction(item.id); onClose(); }}>
          {item.icon ? <item.icon size={16} strokeWidth={1.7} aria-hidden="true" /> : <span className="editor-menu-gap" aria-hidden="true" />}
          <span>{item.label}</span>
          {item.shortcut && <kbd>{item.shortcut}</kbd>}
        </button>
      )))}
    </div>
  );
}
