/*
 * Live text: Current Time and Date. Both are ordinary TEXT elements carrying a
 * `dynamic` mark ("time" or "date") and a `clockFormat`, in the same spirit as
 * the pageNumber flag — the words are generated, not typed. The value is drawn
 * live at render time (see useClockContent in EditorElement), never written back
 * to the document every tick, so a running clock never floods undo or the save.
 *
 * `content` still holds a snapshot taken when the element is inserted, so any
 * surface that draws the element without the ticking hook (the exported JSON, a
 * client that ignores `dynamic`) shows a sensible value instead of nothing.
 */

// Live text: Current Time and Date.
export const CLOCK_KINDS = ["time", "date"];

export const TIME_FORMATS = [
  { id: "24hms", label: "14:32:05" },
  { id: "24hm", label: "14:32" },
  { id: "12hms", label: "2:32:05 PM" },
  { id: "12hm", label: "2:32 PM" },
];

export const DATE_FORMATS = [
  { id: "long", label: "September 23, 2026" },
  { id: "medium", label: "Sep 23, 2026" },
  { id: "numeric", label: "23/09/2026" },
  { id: "weekday", label: "Tuesday, Sep 23, 2026" },
];

export const isClockKind = (kind) => kind === "time" || kind === "date";

const TIME_OPTIONS = {
  "24hms": { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false },
  "24hm": { hour: "2-digit", minute: "2-digit", hour12: false },
  "12hms": { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true },
  "12hm": { hour: "numeric", minute: "2-digit", hour12: true },
};

const DATE_OPTIONS = {
  long: { year: "numeric", month: "long", day: "numeric" },
  medium: { year: "numeric", month: "short", day: "numeric" },
  numeric: { year: "numeric", month: "2-digit", day: "2-digit" },
  weekday: { weekday: "long", year: "numeric", month: "short", day: "numeric" },
};

// The one option map each kind falls back to when a format is missing or stale.
export const defaultClockFormat = (kind) => (kind === "date" ? "long" : "24hms");

const optionsFor = (kind, format) => (kind === "date"
  ? DATE_OPTIONS[format] || DATE_OPTIONS[defaultClockFormat("date")]
  : TIME_OPTIONS[format] || TIME_OPTIONS[defaultClockFormat("time")]);

/* The numeric date reads DD/MM/YYYY, not the US MM/DD — the app's audience is
   Cambodian. Everything else is an en-US month and weekday spelling, fixed so
   the same document reads the same on every machine regardless of its locale. */
export function formatClock(kind, format, date = new Date()) {
  if (!isClockKind(kind)) return "";
  const locale = kind === "date" && format === "numeric" ? "en-GB" : "en-US";
  try {
    return new Intl.DateTimeFormat(locale, optionsFor(kind, format)).format(date);
  } catch {
    return date.toISOString();
  }
}

// How often the value visibly changes, so a clock without seconds and a date do
// not re-render every second for nothing.
export function clockTickMs(kind, format) {
  if (kind === "date") return 30 * 1000;
  return format === "24hms" || format === "12hms" ? 1000 : 15 * 1000;
}
