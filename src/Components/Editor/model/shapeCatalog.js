export const shapeCatalog = [
  { id: "square", label: "Square", category: "Basic", w: 320, h: 320 },
  { id: "circle", label: "Circle", category: "Basic", w: 320, h: 320 },
  { id: "triangle", label: "Triangle", category: "Basic", w: 360, h: 320 },
  { id: "diamond", label: "Diamond", category: "Basic", w: 320, h: 360 },
  { id: "star", label: "Star", category: "Basic", w: 360, h: 360 },
  { id: "pill", label: "Pill", category: "Basic", w: 480, h: 220 },
  { id: "rectangle", label: "Rectangle", category: "Basic", w: 480, h: 280 },
  { id: "rounded-rectangle", label: "Rounded rectangle", category: "Basic", w: 480, h: 280 },
  { id: "pentagon", label: "Pentagon", category: "Polygons", w: 360, h: 360 },
  { id: "hexagon", label: "Hexagon", category: "Polygons", w: 400, h: 350 },
  { id: "parallelogram", label: "Parallelogram", category: "Polygons", w: 440, h: 280 },
  { id: "arrow-right", label: "Right arrow", category: "Arrows", w: 520, h: 260 },
  { id: "chevron-right", label: "Chevron", category: "Arrows", w: 300, h: 360 },
  { id: "heart", label: "Heart", category: "Symbols", w: 360, h: 330 },
  { id: "speech-bubble", label: "Speech bubble", category: "Symbols", w: 460, h: 340 },
  { id: "cross", label: "Cross", category: "Symbols", w: 340, h: 340 },
  { id: "burst", label: "Burst", category: "Symbols", w: 380, h: 380 },
];
export const shapeName = (shape) => shapeCatalog.find((item) => item.id === shape)?.label || "Shape";
export const shapeDefinition = (shape) => shapeCatalog.find((item) => item.id === shape);
