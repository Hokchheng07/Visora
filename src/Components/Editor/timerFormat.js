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
