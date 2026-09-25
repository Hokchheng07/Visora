import { createNextState, nanoid } from "@reduxjs/toolkit";
import { normalizeGroups } from "./layerModel.js";
import { DEFAULT_PAGE, normalizePageSize } from "./pageSize.js";
import { removeAnimationRows, repairTimeline } from "../animation/animationTimeline.js";

/*
 * Page numbers: one switch for the whole design, like Google Slides' "Slide
 * numbers", but each number is a real text layer on its page, so it can be
 * moved anywhere and styled with the normal text tools.
 *
 * The rule that makes it feel like ONE component: every page-number layer
 * shares the same position and style. Change one (drag it, make it bold,
 * recolour it) and syncPageNumbers copies that to all the others after the
 * action. Only the digits differ: each shows its own page's position, so the
 * numbers fix themselves when pages are added, deleted or reordered.
 *
 * The digits are written into `content`, so every surface (canvas, page
 * strip, display mode, the exported JSON) draws them with no special code.
 */

export const PAGE_NUMBER_POSITIONS = ["bottom-left", "bottom-center", "bottom-right"];
export const DEFAULT_PAGE_NUMBERS = { enabled: false, position: "bottom-right", skipFirst: false };

// What all page-number layers have in common. Everything else (id, digits,
// group) belongs to the layer on its own page.
export const PAGE_NUMBER_SHARED = ["x", "y", "w", "h", "rotation", "fill", "opacity", "fontFamily", "fontSize", "fontWeight",
  "fontStyle", "textAlign", "lineHeight", "letterSpacing", "textDecoration", "effects", "locked", "visible", "name"];

const MARGIN_X = 46, MARGIN_Y = 36;

export function normalizePageNumbers(value) {
  const settings = value && typeof value === "object" ? value : {};
  return {
    enabled: settings.enabled === true,
    position: PAGE_NUMBER_POSITIONS.includes(settings.position) ? settings.position : DEFAULT_PAGE_NUMBERS.position,
    skipFirst: settings.skipFirst === true,
  };
}

export const isPageNumber = (element) => element?.type === "text" && element.pageNumber === true;

// The digits for the page at `index` (0-based).
export const pageNumberText = (index) => String(index + 1);

// Dark digits on a light page, light digits on a dark one.
export function pageNumberColor(background) {
  const hex = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(String(background?.value || "").trim())?.[1];
  if (!hex) return "#29243a";
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#29243a" : "#ffffff";
}

// Where a corner preset puts the box, and how the digits line up inside it.
export function pageNumberPlacement(position, w, h, page = DEFAULT_PAGE) {
  const y = page.height - MARGIN_Y - h;
  if (position === "bottom-left") return { x: MARGIN_X, y, textAlign: "left" };
  if (position === "bottom-center") return { x: (page.width - w) / 2, y, textAlign: "center" };
  return { x: page.width - MARGIN_X - w, y, textAlign: "right" };
}

// The first page-number layer ever made, before anyone has styled it.
export function defaultPageNumberStyle(settings, pages, page = DEFAULT_PAGE) {
  const w = 200, h = 80;
  return {
    w, h, ...pageNumberPlacement(normalizePageNumbers(settings).position, w, h, page), rotation: 0,
    fill: pageNumberColor(pages?.[0]?.background), opacity: 1, fontFamily: "Poppins", fontSize: 44, fontWeight: 600,
    fontStyle: "normal", lineHeight: 1.2, letterSpacing: 0, textDecoration: "none", effects: [],
    locked: false, visible: true,
  };
}

// A plain copy. Works on Immer drafts too, which structuredClone refuses.
const copy = (value) => (value === undefined ? value : JSON.parse(JSON.stringify(value)));

function sharedOf(element) {
  return Object.fromEntries(PAGE_NUMBER_SHARED.filter((key) => element[key] !== undefined).map((key) => [key, element[key]]));
}
const sameShared = (a, b) => JSON.stringify(sharedOf(a)) === JSON.stringify(sharedOf(b));

function removeLayers(page, ids) {
  if (!ids.size) return;
  const rows = new Set((page.animations || []).filter((row) => ids.has(row.elementId)).map((row) => row.id));
  if (rows.size) page.animations = removeAnimationRows(page, rows);
  page.elements = page.elements.filter((element) => !ids.has(element.id));
  const tidy = normalizeGroups({ ...page, groups: page.groups || [] });
  page.groups = tidy.groups; page.elements = tidy.elements;
  if (rows.size) page.animations = repairTimeline(page);
}

/*
 * Runs after every editor action (see the reducer in editorSlice.js) and puts
 * the page-number layers back in line with the switch:
 *   switch off            → no page-number layers anywhere
 *   switch on             → exactly one per page (none on page 1 if skipFirst),
 *                           all styled like the one that was just changed
 *   one deleted by hand   → the switch turns off (deleting it means "no numbers")
 *   a pasted copy         → becomes plain text, so a page never has two
 */
export function syncPageNumbers(prev, next, action, deletedType) {
  if (!next?.pages) return next;
  if (next === prev && !String(action?.type).startsWith("@@")) return next;

  return createNextState(next, (draft) => {
    const settings = normalizePageNumbers(draft.pageNumbers);
    const prevLayers = new Map();
    (prev?.pages || []).forEach((page) => page.elements.forEach((element) => { if (isPageNumber(element)) prevLayers.set(element.id, element); }));

    // One deleted by hand: take the whole component away.
    const stillThere = new Set(draft.pages.flatMap((page) => page.elements.map((element) => element.id)));
    if (settings.enabled && action?.type === deletedType && [...prevLayers.keys()].some((id) => !stillThere.has(id))) {
      settings.enabled = false;
      draft.pageNumbers = settings;
    }

    // At most one per page; extra copies (a paste) become ordinary text.
    draft.pages.forEach((page) => {
      const found = page.elements.filter(isPageNumber);
      const keep = found.find((element) => prevLayers.has(element.id)) || found[0];
      found.forEach((element) => { if (element !== keep) { delete element.pageNumber; } });
    });

    const layers = draft.pages.map((page) => page.elements.find(isPageNumber) || null);

    if (!settings.enabled) {
      draft.pages.forEach((page, index) => { if (layers[index]) removeLayers(page, new Set([layers[index].id])); });
    } else {
      // The look to copy: the layer that just changed, else any existing one, else the default.
      const changed = layers.find((layer) => layer && prevLayers.has(layer.id) && !sameShared(layer, prevLayers.get(layer.id)));
      const template = sharedOf(changed || layers.find(Boolean) || defaultPageNumberStyle(settings, draft.pages, normalizePageSize(draft.canvas)));

      draft.pages.forEach((page, index) => {
        const wanted = !(settings.skipFirst && index === 0);
        const layer = layers[index];
        if (!wanted) { if (layer) removeLayers(page, new Set([layer.id])); return; }
        if (!layer) {
          page.elements.push({ id: nanoid(), type: "text", pageNumber: true, ...copy(template), content: pageNumberText(index) });
          return;
        }
        // Key by key, so a layer that already matches is left untouched (and unchanged state stays the same object).
        Object.entries(template).forEach(([key, value]) => { if (JSON.stringify(layer[key]) !== JSON.stringify(value)) layer[key] = copy(value); });
        if (layer.content !== pageNumberText(index)) layer.content = pageNumberText(index);
      });
    }

    // Nothing may stay selected that is no longer on the page.
    const onPage = new Set((draft.pages[draft.currentPage]?.elements || []).map((element) => element.id));
    if (draft.selectedIds?.some((id) => !onPage.has(id))) {
      draft.selectedIds = draft.selectedIds.filter((id) => onPage.has(id));
      draft.selectedId = draft.selectedIds.at(-1) || null;
    }
  });
}
