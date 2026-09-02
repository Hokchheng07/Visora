// Shared Motion (motion/react) animation presets.
// Keep durations/easing consistent across sections so entrance + AOS-style
// scroll reveals feel like one system rather than per-section one-offs.

export const EASE = [0.22, 1, 0.36, 1];

// Pass to `viewport` on any motion element that should reveal once,
// slightly before it's fully in view.
export const viewportOnce = { once: true, amount: 0.25 };

export const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

export const popIn = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

// Container that staggers its motion children. Use with `variants` on a
// parent (initial="hidden" animate/whileInView="show") and `variants={fadeInUp}`
// (etc.) on each child — no per-child delay math needed.
export const staggerContainer = (staggerChildren = 0.12, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});
