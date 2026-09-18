/*
 * The Animate panel's hover previews: a small ball acts each preset out, with
 * squash-and-stretch and a floor shadow, the way a classic bouncing-ball study
 * reads motion. Kept out of the real playback so a preview never has to match
 * the element renderer — it only has to read clearly at thumbnail size.
 *
 * Each step is { ball, shadow } where both are Anime.js keyframe params.
 * Transforms are listed per keyframe so squash and stretch land on the frame
 * where the ball actually touches down.
 */

const LAND_SQUASH = { scaleX: 1.22, scaleY: 0.78 };
const REST = { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, opacity: 1 };

const settle = (duration = 260) => ({ ...REST, duration, ease: "outElastic(1, .55)" });

function entrance(id) {
  switch (id) {
    case "fade":
      // Fades in from the middle: grows out of a point while it appears.
      return {
        ball: [
          { opacity: 0, scaleX: 0.35, scaleY: 0.35, translateY: -8, duration: 0 },
          { opacity: 1, scaleX: 1.06, scaleY: 1.06, translateY: 0, duration: 360, ease: "outCubic" },
          settle(220),
        ],
        shadow: [
          { opacity: 0, scaleX: 0.3, duration: 0 },
          { opacity: 1, scaleX: 1, duration: 420, ease: "outCubic" },
        ],
      };
    case "rise":
      // Launches from below, stretches on the way up, drops back and squashes.
      return {
        ball: [
          { opacity: 0, translateY: 30, scaleX: 0.9, scaleY: 1.1, duration: 0 },
          { opacity: 1, translateY: -18, scaleX: 0.86, scaleY: 1.18, duration: 260, ease: "outQuad" },
          { translateY: -22, scaleX: 1, scaleY: 1, duration: 110, ease: "outSine" },
          { translateY: 0, scaleX: 0.9, scaleY: 1.12, duration: 170, ease: "inQuad" },
          { translateY: 3, ...LAND_SQUASH, duration: 70, ease: "outQuad" },
          settle(),
        ],
        shadow: [
          { opacity: 0, scaleX: 0.4, duration: 0 },
          { opacity: 0.45, scaleX: 0.55, duration: 370, ease: "outQuad" },
          { opacity: 1, scaleX: 1.2, duration: 240, ease: "inQuad" },
          { scaleX: 1, duration: 260, ease: "outElastic(1, .55)" },
        ],
      };
    case "slide-left":
      // Zips in from the left, stretched by its speed, and squashes to a stop.
      return {
        ball: [
          { opacity: 0, translateX: -52, scaleX: 1, scaleY: 1, duration: 0 },
          { opacity: 1, translateX: -18, scaleX: 1.2, scaleY: 0.86, duration: 260, ease: "outQuad" },
          { translateX: 4, scaleX: 0.84, scaleY: 1.14, duration: 180, ease: "outQuad" },
          settle(300),
        ],
        shadow: [
          { opacity: 0, translateX: -52, duration: 0 },
          { opacity: 1, translateX: 4, duration: 440, ease: "outQuad" },
          { translateX: 0, duration: 300, ease: "outElastic(1, .55)" },
        ],
      };
    case "pop":
      // Bursts out of nothing, overshoots and wobbles back to round.
      return {
        ball: [
          { opacity: 0, scaleX: 0, scaleY: 0, duration: 0 },
          { opacity: 1, scaleX: 1.3, scaleY: 1.3, duration: 220, ease: "outBack(2)" },
          { scaleX: 0.86, scaleY: 1.12, duration: 120, ease: "inOutSine" },
          settle(320),
        ],
        shadow: [
          { opacity: 0, scaleX: 0, duration: 0 },
          { opacity: 1, scaleX: 1.25, duration: 220, ease: "outBack(2)" },
          { scaleX: 1, duration: 320, ease: "outElastic(1, .55)" },
        ],
      };
    case "pulse":
      // Two small hops in place, like a heartbeat.
      return {
        ball: [
          { translateY: -10, scaleX: 0.92, scaleY: 1.1, duration: 150, ease: "outQuad" },
          { translateY: 0, ...LAND_SQUASH, duration: 120, ease: "inQuad" },
          { translateY: -6, scaleX: 0.95, scaleY: 1.06, duration: 130, ease: "outQuad" },
          { translateY: 0, scaleX: 1.12, scaleY: 0.88, duration: 110, ease: "inQuad" },
          settle(),
        ],
        shadow: [
          { scaleX: 0.7, opacity: 0.6, duration: 150, ease: "outQuad" },
          { scaleX: 1.15, opacity: 1, duration: 120, ease: "inQuad" },
          { scaleX: 0.8, opacity: 0.7, duration: 130, ease: "outQuad" },
          { scaleX: 1, opacity: 1, duration: 370, ease: "outElastic(1, .55)" },
        ],
      };
    case "morph":
      // Travels across while its shape and colour turn into the next page's.
      return {
        ball: [
          { translateX: -26, borderRadius: "50%", backgroundColor: "#705AE0", duration: 0 },
          { translateX: 4, borderRadius: "22%", backgroundColor: "#D7AC57", scaleX: 1.14, scaleY: 0.9, duration: 480, ease: "inOutCubic" },
          { translateX: 24, scaleX: 1, scaleY: 1, duration: 260, ease: "outElastic(1, .6)" },
        ],
        shadow: [
          { translateX: -26, duration: 0 },
          { translateX: 24, duration: 740, ease: "inOutCubic" },
        ],
      };
    default:
      return null;
  }
}

/* Exit presets leave the way their entrance arrived: fade shrinks to the
   middle, rise hops up and sinks away, slide zips off to the left, pop
   swells and vanishes. */
function exit(id) {
  switch (id) {
    case "fade":
      return {
        ball: [{ scaleX: 1.06, scaleY: 1.06, duration: 120, ease: "outQuad" }, { opacity: 0, scaleX: 0.35, scaleY: 0.35, duration: 320, ease: "inCubic" }],
        shadow: [{ opacity: 0, scaleX: 0.3, duration: 440, ease: "inCubic" }],
      };
    case "rise":
      return {
        ball: [
          { ...LAND_SQUASH, translateY: 3, duration: 110, ease: "outQuad" },
          { translateY: -14, scaleX: 0.88, scaleY: 1.14, duration: 180, ease: "outQuad" },
          { opacity: 0, translateY: 32, scaleX: 0.9, scaleY: 1.12, duration: 260, ease: "inQuad" },
        ],
        shadow: [{ scaleX: 1.2, duration: 110 }, { scaleX: 0.6, opacity: 0.5, duration: 180 }, { opacity: 0, scaleX: 0.3, duration: 260 }],
      };
    case "slide-left":
      return {
        ball: [
          { scaleX: 0.86, scaleY: 1.12, translateX: 6, duration: 120, ease: "outQuad" },
          { opacity: 0, translateX: -52, scaleX: 1.2, scaleY: 0.86, duration: 360, ease: "inQuad" },
        ],
        shadow: [{ translateX: 6, duration: 120 }, { opacity: 0, translateX: -52, duration: 360, ease: "inQuad" }],
      };
    case "pop":
      return {
        ball: [{ scaleX: 1.3, scaleY: 1.3, duration: 160, ease: "outQuad" }, { opacity: 0, scaleX: 0, scaleY: 0, duration: 200, ease: "inBack(2)" }],
        shadow: [{ scaleX: 1.25, duration: 160 }, { opacity: 0, scaleX: 0, duration: 200, ease: "inBack(2)" }],
      };
    default:
      return entrance(id);
  }
}

export function ballDemo(presetId, kind = "entrance", reducedMotion = false) {
  if (!presetId || presetId === "none") return null;
  // Reduced motion: no travel or squash, just a gentle fade that still shows the choice.
  if (reducedMotion) {
    const fade = kind === "exit" ? [1, 0] : [0, 1];
    return { ball: [{ opacity: fade[0], duration: 0 }, { opacity: fade[1], duration: 240, ease: "linear" }], shadow: [{ opacity: fade[0], duration: 0 }, { opacity: fade[1], duration: 240, ease: "linear" }] };
  }
  return kind === "exit" ? exit(presetId) : entrance(presetId);
}
