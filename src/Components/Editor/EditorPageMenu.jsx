import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ClipboardPaste, Copy, CopyPlus, Pencil, Plus, Trash2 } from "lucide-react";
import RenameField from "./RenameField.jsx";

const ITEMS = [
  { id: "rename", label: "Rename", icon: Pencil },
  { id: "divider-0", divider: true },
  { id: "copy", label: "Copy", icon: Copy },
  { id: "paste", label: "Paste", icon: ClipboardPaste },
  { id: "divider-1", divider: true },
  { id: "duplicate", label: "Duplicate", icon: CopyPlus },
  { id: "delete", label: "Delete page", icon: Trash2 },
  { id: "divider-2", divider: true },
  { id: "add", label: "Add page", icon: Plus },
];

export default function EditorPageMenu({ page, name, x, y, disabled, onAction, onRename, onClose }) {
  const ref = useRef(null);
  // Rename turns the menu into a name field in the same spot.
  const [renaming, setRenaming] = useState(false);
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
      // While renaming, a click elsewhere blurs the field, which saves and closes.
      if (!renaming && !ref.current?.contains(event.target)) onClose();
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
  }, [onClose, renaming]);

  return (
    <div
      ref={ref}
      className="editor-page-menu"
      style={{ left: `${position.left}px`, bottom: `${position.bottom}px` }}
      role={renaming ? "dialog" : "menu"}
      aria-label={renaming ? `Rename page ${page}` : `Page ${page} options`}
    >
      {renaming ? (
        <RenameField value={name} label="Page name" className="is-menu"
          onCommit={(next) => { onRename(next); onClose(); }} onCancel={onClose} />
      ) : ITEMS.map(({ id, label, icon: Icon, divider }) => (divider ? (
        <hr key={id} />
      ) : (
        <button
          key={id}
          type="button"
          role="menuitem"
          disabled={disabled[id]}
          onClick={() => { if (id === "rename") { setRenaming(true); return; } onAction(id); onClose(); }}
        >
          <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
          <span>{label}</span>
        </button>
      )))}
    </div>
  );
}
