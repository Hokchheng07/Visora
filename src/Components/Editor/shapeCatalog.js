export const shapeCatalog = [
  { id: "square", label: "Square", w: 320, h: 320 },
  { id: "circle", label: "Circle", w: 320, h: 320 },
  { id: "triangle", label: "Triangle", w: 360, h: 320 },
  { id: "diamond", label: "Diamond", w: 320, h: 360 },
  { id: "star", label: "Star", w: 360, h: 360 },
  { id: "pill", label: "Pill", w: 480, h: 220 },
];
export const shapeName = (shape) => shapeCatalog.find((item) => item.id === shape)?.label || "Shape";
