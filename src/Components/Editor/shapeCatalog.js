export const shapeCatalog = [
  { id: "square", label: "Square", category: "Basic", w: 320, h: 320 },
  { id: "circle", label: "Circle", category: "Basic", w: 320, h: 320 },
  { id: "triangle", label: "Triangle", category: "Basic", w: 360, h: 320 },
  { id: "diamond", label: "Diamond", category: "Basic", w: 320, h: 360 },
  { id: "star", label: "Star", category: "Basic", w: 360, h: 360 },
  { id: "pill", label: "Pill", category: "Basic", w: 480, h: 220 },
  { id: "rectangle", label: "Rectangle", category: "Basic", w: 480, h: 280 },
  { id: "rounded-rectangle", label: "Rounded rectangle", category: "Basic", w: 480, h: 280 },
  { id: "pentagon", label: "Pentagon", category: "Polygons", w: 360, h: 360, paths: ["M50 3L98 38 80 96H20L2 38z"] },
  { id: "hexagon", label: "Hexagon", category: "Polygons", w: 400, h: 350, paths: ["M25 4h50l24 46-24 46H25L1 50z"] },
  { id: "parallelogram", label: "Parallelogram", category: "Polygons", w: 440, h: 280, paths: ["M20 5h78L80 95H2z"] },
  { id: "arrow-right", label: "Right arrow", category: "Arrows", w: 520, h: 260, paths: ["M2 32h58V8l38 42-38 42V68H2z"] },
  { id: "chevron-right", label: "Chevron", category: "Arrows", w: 300, h: 360, paths: ["M18 2l48 48-48 48 16-16 32-32-32-32z"] },
  { id: "heart", label: "Heart", category: "Symbols", w: 360, h: 330, paths: ["M50 94C12 69 2 50 7 28 12 6 39 2 50 21 61 2 88 6 93 28c5 22-5 41-43 66z"] },
  { id: "speech-bubble", label: "Speech bubble", category: "Symbols", w: 460, h: 340, paths: ["M5 8h90v65H48L24 96l5-23H5z"] },
  { id: "cross", label: "Cross", category: "Symbols", w: 340, h: 340, paths: ["M36 4h28v32h32v28H64v32H36V64H4V36h32z"] },
  { id: "burst", label: "Burst", category: "Symbols", w: 380, h: 380, paths: ["M50 1l9 23 20-15-3 25 25-3-15 20 23 9-23 9 15 20-25-3 3 25-20-15-9 23-9-23-20 15 3-25-25 3 15-20-23-9 23-9-15-20 25 3-3-25 20 15z"] },
];
export const shapeName = (shape) => shapeCatalog.find((item) => item.id === shape)?.label || "Shape";
export const shapeDefinition = (shape) => shapeCatalog.find((item) => item.id === shape);
