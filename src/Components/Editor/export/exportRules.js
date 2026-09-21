import { isLibrarySrc } from "../model/libraryRef.js";

/*
 * What each export format is allowed to carry.
 *
 * PDF and Adobe Illustrator produce a still picture. A timer's whole value is
 * that it runs in front of an audience, so a still copy of one is a screenshot
 * of a stopped clock — worse than no file, because it looks like it worked.
 * A backdrop holding a timer is therefore JSON-only, JSON being the format
 * that keeps the timer as a timer.
 *
 * Animations are not a constraint in the same way: they are simply dropped,
 * because a still page has no frames to play them in and the authored first
 * state is what a printed backdrop should show.
 */

// Formats that flatten a page to a picture, and so cannot hold a live element.
export const STILL_FORMATS = ["pdf", "ai"];

export const TIMER_BLOCK_REASON = "Not available for a backdrop with a timer — export as JSON instead";

/** True when any page holds a timer. */
export function hasTimer(editor) {
  return (editor?.pages || []).some((page) => (page?.elements || []).some((element) => element?.type === "timer"));
}

/** Why `format` cannot be exported right now, or null when it can. */
export function exportBlockedReason(format, editor) {
  return STILL_FORMATS.includes(format) && hasTimer(editor) ? TIMER_BLOCK_REASON : null;
}

/*
 * Which picture format a page is drawn into.
 *
 * A backdrop is usually flat: one background colour, text, and traced
 * ornaments. PNG keeps those exact and compresses them to almost nothing,
 * while JPEG would soften every letter edge and ring around the flat colour.
 *
 * A page carrying an uploaded photo is the opposite case. The same page as
 * PNG runs to about 18 MB at export resolution and as JPEG to about 4 MB, for
 * a difference nobody can see in a photograph — and a twenty-page deck of
 * them is the difference between a file that can be sent and one that cannot.
 *
 * Library artwork does not count as a photo: it is traced line art, which is
 * exactly what JPEG is worst at.
 */
export const JPEG_QUALITY = 0.92;

export const isPhoto = (element) => element?.type === "image" && !isLibrarySrc(element.src);

export const pageImageFormat = (page) => ((page?.elements || []).some(isPhoto) ? "JPEG" : "PNG");
