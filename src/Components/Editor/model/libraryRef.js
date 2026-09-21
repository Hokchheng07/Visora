/*
 * How an element points at a built-in library picture.
 *
 * This is its own file so that code which only needs to recognise a library
 * reference — export, tests — does not have to pull in the library itself,
 * which reads every bundled asset at import.
 */
export const LIBRARY_PREFIX = "library:";

/** True for a built-in library picture, as opposed to an uploaded photo. */
export const isLibrarySrc = (src) => typeof src === "string" && src.startsWith(LIBRARY_PREFIX);
