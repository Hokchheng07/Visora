import { Blocks, Box, Image, Layers, LayoutGrid, Sparkles, Timer, Type } from "lucide-react";

export const editorSidebarItems = [
  { id: "templates", label: "Templates", icon: LayoutGrid },
  { id: "elements", label: "Elements", icon: Blocks },
  { id: "text", label: "Text", icon: Type },
  { id: "images", label: "Images", icon: Image },
  { id: "shapes", label: "Shapes", icon: Box },
  { id: "animations", label: "Animate", icon: Sparkles },
  { id: "timer", label: "Timer", icon: Timer },
  { id: "layers", label: "Layers", icon: Layers },
];
