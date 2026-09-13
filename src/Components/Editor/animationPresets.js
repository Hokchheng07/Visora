export const animationPresets = [
  { id: "none", label: "No animation" },
  { id: "fade", label: "Fade in" },
  { id: "rise", label: "Rise in" },
  { id: "slide-left", label: "Slide from left" },
  { id: "pop", label: "Pop in" },
  { id: "pulse", label: "Gentle pulse" },
];

const EASE_OUT = "cubicBezier(0.23, 1, 0.32, 1)";
const EASE_IN_OUT = "cubicBezier(0.77, 0, 0.175, 1)";

export function compileAnimation(animation, reducedMotion = false) {
  const preset = animation?.preset || "none";
  const duration = animation?.duration || 520;
  const delay = animation?.delay || 0;
  if (preset === "none") return null;
  if (reducedMotion) return { opacity: [0, 1], duration: 200, delay, ease: EASE_OUT };
  if (preset === "fade") return { opacity: [0, 1], duration, delay, ease: EASE_OUT };
  if (preset === "rise") return { opacity: [0, 1], translateY: [32, 0], duration, delay, ease: EASE_OUT };
  if (preset === "slide-left") return { opacity: [0, 1], translateX: [-48, 0], duration, delay, ease: EASE_OUT };
  if (preset === "pop") return { opacity: [0, 1], scale: [.95, 1], duration: Math.min(duration, 420), delay, ease: EASE_OUT };
  if (preset === "pulse") return { scale: [1, 1.035], alternate: true, loop: true, duration: 1400, delay, ease: EASE_IN_OUT };
  return null;
}
