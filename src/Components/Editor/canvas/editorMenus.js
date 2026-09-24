import {
  ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, ClipboardPaste, Copy, CopyPlus,
  MousePointerSquareDashed, Trash2, Type, Group, Ungroup, FileOutput,
} from "lucide-react";
import { AlignCenter, AlignHorizontalSpaceAround } from "lucide-react";

/*
 * Right-click item sets. Disabled rows stay in the list rather than being
 * filtered out, so the menu keeps the same height and the same muscle memory
 * whichever element you opened it on.
 */
/* A selection holding a locked layer can still be copied and duplicated, but
   nothing that moves, reorders or deletes it — for the whole selection, never
   only its unlocked part. */
export function elementMenuItems({ count, locked = false, canForward, canBackward, canGroup = false, canUngroup = false, pages = [], currentPage = 0 }) {
  return [
    { id: "duplicate", label: "Duplicate", icon: CopyPlus, shortcut: "⌘D" },
    { id: "copy", label: "Copy", icon: Copy, shortcut: "⌘C" },
    { divider: true },
    { id: "group", label: "Group selection", icon: Group, shortcut: "⌘G", disabled: locked || !canGroup },
    { id: "ungroup", label: "Ungroup", icon: Ungroup, shortcut: "⇧⌘G", disabled: locked || !canUngroup },
    { divider: true },
    { id: "forward", label: "Bring forward", icon: ArrowUp, shortcut: "]", disabled: locked || !canForward },
    { id: "front", label: "Bring to front", icon: ArrowUpToLine, shortcut: "⌘]", disabled: locked || !canForward },
    { id: "backward", label: "Send backward", icon: ArrowDown, shortcut: "[", disabled: locked || !canBackward },
    { id: "back", label: "Send to back", icon: ArrowDownToLine, shortcut: "⌘[", disabled: locked || !canBackward },
    { divider: true },
    { id: "align-center", label: "Align centres", icon: AlignCenter, disabled: locked || count < 2 },
    { id: "distribute-h", label: "Distribute across", icon: AlignHorizontalSpaceAround, disabled: locked || count < 3 },
    // One row per page, rather than a submenu: the whole list stays reachable by arrow keys.
    ...(pages.length > 1 ? [
      { divider: true },
      { heading: "Move to page", icon: FileOutput },
      ...pages.map((label, index) => ({ id: `move-to-page:${index}`, label: `${index + 1} · ${label}`, disabled: locked || index === currentPage })),
    ] : []),
    { divider: true },
    { id: "delete", label: count > 1 ? `Delete ${count} items` : "Delete", icon: Trash2, shortcut: "⌫", danger: true, disabled: locked },
  ];
}

export function canvasMenuItems({ canPaste, hasElements }) {
  return [
    { id: "paste", label: "Paste", icon: ClipboardPaste, shortcut: "⌘V", disabled: !canPaste },
    { id: "select-all", label: "Select all", icon: MousePointerSquareDashed, shortcut: "⌘A", disabled: !hasElements },
    { divider: true },
    { id: "add-title", label: "Add a title", icon: Type },
  ];
}
