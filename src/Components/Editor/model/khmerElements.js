/*
 * The built-in Khmer element library (requirement #3).
 *
 * Adding an element is a file drop: put an SVG or PNG in
 * src/assets/<KhmerElements|Stickers>/<section>/<name>.svg and it appears in
 * the Elements panel under that section, no code change. The file name becomes the id and,
 * humanised, the label — so keep names short, lowercase and hyphenated
 * ("top-left.svg" → "Top left").
 *
 * A section is either single-colour (traced ornaments, drawn as their colour
 * through the shape, so the colour is a setting) or full-colour artwork, which
 * is drawn as it is: `recolour: false`.
 *
 * A new section only needs a row in SECTIONS below: its folder name, the
 * heading to show, which panel (group) it belongs to, the gold it starts in,
 * and whether its elements are wide enough to want a full row in the panel.
 *
 * Sections are gathered into groups, which is what the Elements panel shows
 * first: one card per group, opening onto that group's sections. Keeping the
 * traced Khmer ornaments apart from full-colour artwork is the point.
 *
 * Elements are placed as image elements whose src is "library:<section>/<id>".
 * Vite renames bundled files on every build, so a saved or exported design
 * keeps that stable name and the file is looked up here when it is drawn.
 */
export { LIBRARY_PREFIX } from "./libraryRef.js";
import { LIBRARY_PREFIX } from "./libraryRef.js";

// The gold an element starts in when its section does not say otherwise.
export const KHMER_GOLD = "#AF7A23";

const GROUPS = [
  { id: "khmer", label: "Khmer elements", blurb: "Traced ornaments you can recolour" },
  { id: "graphics", label: "Graphics", blurb: "Full-colour artwork", thumbnail: "graphics/khmer-lotus-tray" },
  { id: "stickers", label: "Stickers", blurb: "Doodles and shapes" },
];

const SECTIONS = [
  { id: "corners", label: "Corners", group: "khmer" },
  { id: "naga", label: "Naga borders", group: "khmer", color: "#E0B43A" },
  { id: "dividers", label: "Dividers", group: "khmer", color: "#D6AA35", wide: true },
  { id: "figures", label: "Figures", group: "khmer" },
  { id: "emblems", label: "Emblems", group: "khmer" },
  { id: "graphics", label: "Graphics", group: "graphics", recolour: false },
  { id: "doodles", label: "Doodles", group: "stickers", recolour: false },
];

/* Every SVG under the library folder, as a URL. `eager` keeps this a plain
   lookup instead of a promise per element. */
const FILES = import.meta.glob("../../../assets/{KhmerElements,Stickers}/*/*.{svg,png}", { eager: true, query: "?url", import: "default" });

const titleCase = (name) => name.replace(/-/g, " ").replace(/^./, (letter) => letter.toUpperCase());

function read() {
  const items = [];
  for (const [path, src] of Object.entries(FILES)) {
    const [, section, file] = path.match(/assets\/[^/]+\/([^/]+)\/([^/]+)\.(?:svg|png)$/) || [];
    const entry = SECTIONS.find((row) => row.id === section);
    if (!entry) continue; // a folder with no section stays out of the panel
    items.push({
      id: `${section}/${file}`, section, group: entry.group, name: titleCase(file), label: `${entry.label}: ${titleCase(file)}`,
      src, color: entry.color || KHMER_GOLD, wide: !!entry.wide, recolour: entry.recolour !== false,
    });
  }
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export const KHMER_ELEMENTS = read();

/* The sections of one group (or of every group, with no `group`), in SECTIONS
   order, each with its elements. A section with no files yet is left out
   rather than shown empty. */
export const khmerSections = (items = KHMER_ELEMENTS, group = null) => SECTIONS
  .filter((section) => !group || section.group === group)
  .map((section) => ({ ...section, items: items.filter((item) => item.section === section.id) }))
  .filter((section) => section.items.length);

/* The panel's front page: one card per group, with a few of its elements as
   the card's picture. */
export const khmerGroups = (items = KHMER_ELEMENTS) => GROUPS
  .map((group) => {
    const own = items.filter((item) => item.group === group.id);
    // One element per section, so the card shows the group's range.
    const perSection = khmerSections(own, group.id).map((section) => section.items[0]);
    const featured = own.find((item) => item.id === group.thumbnail);
    return { ...group, count: own.length, preview: featured ? [featured] : perSection.slice(0, 4) };
  })
  .filter((group) => group.count);

/* Designs saved before the library was split into sections. Old documents keep
   opening; new ones are written with the section in the name. */
const LEGACY_IDS = {
  "khmer-corner-top-left": "corners/top-left",
  "khmer-corner-top-right": "corners/top-right",
  "khmer-corner-bottom-left": "corners/bottom-left",
  "khmer-corner-bottom-right": "corners/bottom-right",
  "khmer-divider-flame": "dividers/flame",
  "khmer-divider-lotus": "dividers/lotus",
  "khmer-divider-sun-flower": "dividers/sun-flower",
  "khmer-naga-left": "naga/left",
  "khmer-naga-right": "naga/right",
};

const BY_ID = new Map(KHMER_ELEMENTS.map((item) => [item.id, item]));

export const librarySrc = (id) => `${LIBRARY_PREFIX}${id}`;

/* The library element a src names, or null when src is an uploaded file name,
   a link, or an element that no longer ships. */
export function libraryElement(src) {
  if (typeof src !== "string" || !src.startsWith(LIBRARY_PREFIX)) return null;
  const id = src.slice(LIBRARY_PREFIX.length);
  return BY_ID.get(id) || BY_ID.get(LEGACY_IDS[id]) || null;
}

export const resolveLibrarySrc = (src) => libraryElement(src)?.src || null;
