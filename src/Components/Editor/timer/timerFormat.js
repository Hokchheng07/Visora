/* Shared by TimerArtwork (drawing) and DisplayTimer (running).
   Kept out of the component file so fast refresh stays intact. */

export function formatDuration(ms, format = "HH:MM:SS") {
  const total = Math.max(0, Math.round(ms / 1000));
  const seconds = String(total % 60).padStart(2, "0");
  if (format === "MM:SS") return `${String(Math.floor(total / 60)).padStart(2, "0")}:${seconds}`;
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

const pad = (value) => String(value).padStart(2, "0");

/* Always HH:MM:SS. Truncate elapsed time so a second is shown only after
   it has actually elapsed; countdown formatting keeps its own rounding. */
export function formatElapsed(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
}

/* A stopwatch's first button is Start whenever it is not counting (at zero or
   stopped part-way) and Stop while it is. Unlike the countdown's, Stop freezes
   the clock; it never leaves the presentation. */
export const stopwatchRole = (status) => (status === "running" ? "stop" : "start");

/* Three positions, not four. The first one is a single control that changes
   identity once the countdown begins — Start before, Stop after — so there is
   never a separate Stop sitting idle beside a Start that does nothing.
   Resuming lives on position two, which is why Start no longer has to double
   as Resume the way the earlier four-button layout required. */
export const TIMER_CONTROL_IDS = ["startStop", "pauseResume", "reset"];

export function controlState(status) {
  return {
    // Always live: Start when ready, Stop from the moment it runs.
    startStop: true,
    // Only meaningful while there is a countdown to interrupt or continue.
    pauseResume: status === "running" || status === "paused",
    // Always live, so a finished or half-run timer can be put back without
    // leaving the presentation.
    reset: true,
  };
}

/* What position one is at this moment. "stop" leaves the presentation; "start"
   begins the countdown. */
export function startStopRole(status) {
  return status === "ready" ? "start" : "stop";
}
