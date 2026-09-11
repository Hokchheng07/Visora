import {
  ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, ClipboardPaste, Copy, CopyPlus,
  MousePointerSquareDashed, Trash2, Type,
} from "lucide-react";
import { AlignCenter, AlignHorizontalSpaceAround } from "lucide-react";

/*
 * Right-click item sets. Disabled rows stay in the list rather than being
 * filtered out, so the menu keeps the same height and the same muscle memory
 * whichever element you opened it on.
 */
export function elementMenuItems({ count, index, last }) {
  const single = count === 1;
  return [
    { id: "duplicate", label: "Duplicate", icon: CopyPlus, shortcut: "⌘D" },
    { id: "copy", label: "Copy", icon: Copy, shortcut: "⌘C" },
    { divider: true },
    { id: "forward", label: "Bring forward", icon: ArrowUp, shortcut: "]", disabled: !single || index >= last },
    { id: "front", label: "Bring to front", icon: ArrowUpToLine, disabled: !single || index >= last },
    { id: "backward", label: "Send backward", icon: ArrowDown, shortcut: "[", disabled: !single || index <= 0 },
    { id: "back", label: "Send to back", icon: ArrowDownToLine, disabled: !single || index <= 0 },
    { divider: true },
    { id: "align-center", label: "Align centres", icon: AlignCenter, disabled: count < 2 },
    { id: "distribute-h", label: "Distribute across", icon: AlignHorizontalSpaceAround, disabled: count < 3 },
    { divider: true },
    { id: "delete", label: count > 1 ? `Delete ${count} items` : "Delete", icon: Trash2, shortcut: "⌫", danger: true },
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
