import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ClipboardPaste, Copy, CopyPlus, Plus, Trash2 } from "lucide-react";

const ITEMS = [
  { id: "copy", label: "Copy", icon: Copy },
  { id: "paste", label: "Paste", icon: ClipboardPaste },
  { id: "divider-1", divider: true },
  { id: "duplicate", label: "Duplicate", icon: CopyPlus },
  { id: "delete", label: "Delete page", icon: Trash2 },
  { id: "divider-2", divider: true },
  { id: "add", label: "Add page", icon: Plus },
];

export default function EditorPageMenu({ page, x, y, disabled, onAction, onClose }) {
  const ref = useRef(null);
  // The page strip sits at the bottom, so the menu grows upwards from the click.
  const [position, setPosition] = useState({ left: x, bottom: 0 });

  useLayoutEffect(() => {
    const width = ref.current?.getBoundingClientRect().width ?? 0;
    setPosition({
      left: Math.max(8, Math.min(x, window.innerWidth - width - 8)),
      bottom: Math.max(8, window.innerHeight - y),
    });
  }, [x, y]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!ref.current?.contains(event.target)) onClose();
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="editor-page-menu"
      style={{ left: `${position.left}px`, bottom: `${position.bottom}px` }}
      role="menu"
      aria-label={`Page ${page} options`}
    >
      {ITEMS.map(({ id, label, icon: Icon, divider }) => (divider ? (
        <hr key={id} />
      ) : (
        <button
          key={id}
          type="button"
          role="menuitem"
          disabled={disabled[id]}
          onClick={() => { onAction(id); onClose(); }}
        >
          <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
          <span>{label}</span>
        </button>
      )))}
    </div>
  );
}
