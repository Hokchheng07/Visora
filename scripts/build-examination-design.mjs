import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

// Turns the Figma artwork into ordinary Visora IMAGE/TEXT/SHAPE/TIMER layers.
// The source pictures are embedded so the imported design works offline and
// keeps the timer editable instead of flattening the frame to a screenshot.
const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Pass an exported Visora JSON file as the first argument.");

const assets = resolve("src/assets/pages/editor/examination");
const output = resolve("designs");
const scale = 2.25;
const offsetX = (1920 - 717 * scale) / 2;
const r = (value) => Math.round(value * 100) / 100;
const p = (x, y) => ({ x: r(offsetX + x * scale), y: r(y * scale) });
const size = (w, h) => ({ width: r(w * scale), height: r(h * scale) });
let layers = [];

function add(component) {
  layers.push({
    uuid: `exam-${String(layers.length + 1).padStart(2, "0")}`,
    layerIndex: layers.length,
    rotation: 0,
    locked: false,
    visible: true,
    ...component,
  });
}

function asset(name) {
  const mime = name.endsWith(".svg") ? "image/svg+xml" : "image/png";
  return `data:${mime};base64,${readFileSync(resolve(assets, name)).toString("base64")}`;
}

function image(name, x, y, w, h, options = {}) {
  add({
    type: "IMAGE",
    name: options.name || name,
    image: { fileName: asset(name) },
    position: p(x, y),
    size: size(w, h),
    rotation: options.rotation || 0,
    flipY: options.flipY === true,
    lockAspect: options.lockAspect !== false,
    styles: {
      opacity: 1,
      ...(options.crop ? { crop: { x: options.crop.x ?? 0.5, y: options.crop.y ?? 0.5, zoom: options.crop.zoom } } : {}),
    },
  });
}

function shape(name, x, y, w, h, fill, options = {}) {
  add({
    type: "SHAPE",
    shape: options.radius ? "rounded-rectangle" : "rectangle",
    name,
    position: p(x, y),
    size: size(w, h),
    styles: {
      fill,
      opacity: 1,
      stroke: options.stroke || "transparent",
      strokeWidth: options.stroke ? r((options.strokeWidth || 1) * scale) : 0,
      ...(options.radius ? { cornerRadius: r(options.radius * scale) } : {}),
    },
  });
}

function text(name, content, x, y, w, h, fontSize, color, options = {}) {
  add({
    type: "TEXT",
    name,
    content,
    position: p(x, y),
    size: size(w, h),
    rotation: options.rotation || 0,
    styles: {
      fontFamily: options.font || "Inter",
      fontSize: r(fontSize * scale),
      fontWeight: options.weight || 400,
      fontStyle: "normal",
      textAlign: options.align || "center",
      color,
      lineHeight: 1,
      letterSpacing: options.spacing || 0,
      opacity: 1,
    },
  });
}

// Back of the composition. The original is 717×470; its artwork is scaled
// uniformly into the editor's 1920×1080 16:9 stage, with a slim white gutter.
shape("Purple footer extension", -offsetX / scale, 460, 1920 / scale, 20, "#816DCD");
image("bottom-wave.svg", 0, 386, 717, 84, { name: "Purple wave", flipY: true });

// Figma's six placed illustrations, kept as individual editor image layers.
image("image31.png", 32, 3, 76, 76, { name: "Paper plane" });
image("image26.png", 22, 126, 118, 104, { name: "Dotted arrow", rotation: 172, crop: { zoom: 1.3 } });
image("image132.png", 199, 97, 89, 78, { name: "Encouraging sheep", crop: { zoom: 1.1 } });
image("image130.png", 6, 246, 153, 153, { name: "Exam checklist" });
image("image131.png", 564, 160, 142, 142, { name: "Alarm clock", rotation: 20, crop: { zoom: 1.08 } });
image("image129.png", 575, 329, 118, 90, { name: "Study books", crop: { zoom: 1.4 } });

// Small vector details are imported intact from the Figma layers.
image("vector3.svg", 602, 36, 28, 25, { name: "Red star" });
image("vector4.svg", 660, 145, 14, 12, { name: "Yellow star" });
image("vector5.svg", 143, 214, 14, 12, { name: "Green star" });
image("vector1.svg", 54, 247, 14, 13, { name: "Purple star" });
image("vector2.svg", 48, 387, 23, 22, { name: "Orange star" });
image("vector0.svg", 594, 286, 14, 13, { name: "Sage star" });
image("vector6.svg", 626, 118, 16, 25, { name: "Teal balloon" });
image("group102.svg", 578, 154, 38, 41, { name: "Golden accent right" });
image("group103.svg", 148, 281, 32, 32, { name: "Golden accent left" });

// Native editor text, using a bundled hand-lettered font instead of a picture.
const letters = [
  ["E", 126, 35, 45, -9.6, "#816DCD"],
  ["X", 168, 29, 48, -7.7, "#5B3BBF"],
  ["A", 215, 24, 46, -5.7, "#816DCD"],
  ["M", 264, 20, 52, -3.5, "#5B3BBF"],
  ["I", 320, 19, 26, -1.6, "#816DCD"],
  ["N", 350, 19, 43, 0, "#0B0B0B"],
  ["A", 397, 19, 43, 2.1, "#0B0B0B"],
  ["T", 443, 22, 40, 4.0, "#0B0B0B"],
  ["I", 483, 26, 30, 5.5, "#0B0B0B"],
  ["O", 511, 29, 53, 7.3, "#0B0B0B"],
  ["N", 561, 36, 52, 9.4, "#0B0B0B"],
];
letters.forEach(([letter, x, y, w, rotation, color], index) =>
  text(`Heading ${index + 1}: ${letter}`, letter, x, y, w, 80, 75, color, { font: "Caveat Brush", rotation }));

// The background frame and label remain editable native shapes and text.
shape("Timer card", 203, 171, 356, 132, "#FFFFFF", { radius: 19, stroke: "#B294F0", strokeWidth: 2 });
shape("Time remaining tag", 316, 167, 147, 23, "#816DCD", { radius: 10 });
text("Time remaining label", "TIME REMAINING", 322, 167, 135, 22, 15, "#FFFFFF", { font: "Inter", weight: 600 });
text("Hours label", "Hours", 250, 279, 48, 17, 13, "#111111", { font: "Inter" });
text("Minutes label", "Minutes", 338, 279, 60, 17, 13, "#111111", { font: "Inter" });
text("Seconds label", "Seconds", 444, 279, 58, 17, 13, "#111111", { font: "Inter" });
text("First separator", ":", 309, 279, 18, 17, 13, "#111111", { font: "Inter" });
text("Second separator", ":", 413, 279, 18, 17, 13, "#111111", { font: "Inter" });

// A live Visora countdown: the first control turns from Start into Stop while
// running, matching the editor's actual behavior instead of adding dead art.
add({
  type: "COUNTDOWN_TIMER",
  name: "90-minute exam countdown",
  position: p(203, 171),
  size: size(356, 132),
  timer: {
    mode: "COUNTDOWN",
    layout: "exam",
    durationMs: 90 * 60 * 1000,
    format: "HH:MM:SS",
    onComplete: { sound: "chime", message: "Time is up!" },
    controls: { startStop: true, pauseResume: true, reset: true },
    buttonColors: { start: "#6AAF53", pause: "#FDD051", stop: "#FC4646", reset: "#A9A9AF" },
  },
  styles: { color: "#0B0B0B", fontFamily: "Inter", fontSize: r(72 * scale), opacity: 1 },
});

const examinationPage = {
  uuid: "page-examination-figma-1672-100206",
  name: "Examination countdown",
  pageNumber: 1,
  background: { type: "COLOR", value: "#FFFFFF" },
  animations: [],
  components: layers,
};

const existing = JSON.parse(readFileSync(resolve(sourcePath), "utf8"));
if (!Array.isArray(existing.pages) || !existing.pages.length) throw new Error("The source is not a Visora design.");
if (existing.pages.some((page) => page.uuid === examinationPage.uuid)) throw new Error("The examination page is already present.");
const standalone = { ...existing, uuid: "examination-figma-1672-100206", name: "Examination countdown", pages: [examinationPage] };
const withExisting = { ...existing, pages: [...existing.pages, { ...examinationPage, pageNumber: existing.pages.length + 1 }] };
mkdirSync(output, { recursive: true });
writeFileSync(resolve(output, "examination-countdown.json"), JSON.stringify(standalone, null, 2));
writeFileSync(resolve(output, "existing-with-examination.json"), JSON.stringify(withExisting, null, 2));
console.log(`Created ${layers.length} native editor layers; kept ${existing.pages.length} existing page(s) in the combined design.`);
