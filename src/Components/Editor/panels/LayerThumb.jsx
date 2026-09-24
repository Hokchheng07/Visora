import { Group, Hash, Image, TimerIcon, Type } from "lucide-react";
import { ShapeArtwork } from "../canvas/EditorElement.jsx";

/*
 * The small picture that stands for a layer: its own artwork for a shape, a
 * type icon for everything whose artwork would not read at this size. Shared
 * by the Layers panel and the Animate pane, so one layer looks the same in both.
 */
export default function LayerThumb({ row }) {
  if (row.kind === "group") return <Group size={16} aria-hidden="true" />;
  const { element } = row;
  if (element.type === "text" && element.pageNumber) return <Hash size={16} aria-hidden="true" />;
  if (element.type === "text") return <Type size={16} aria-hidden="true" />;
  if (element.type === "timer") return <TimerIcon size={16} aria-hidden="true" />;
  if (element.type === "image") return <Image size={16} aria-hidden="true" />;
  return <ShapeArtwork element={{ ...element, w: 100, h: 100 * element.h / element.w, effects: [], stroke: null, opacity: 1, fillVisible: true }} fit />;
}
