import { useEffect, useRef, useState } from "react";

/*
 * Cosmic dust: drifting specks with short trails that swirl around the pointer.
 * Ported from the Lightswind component of the same name (TypeScript, Tailwind
 * classes) to plain JSX and this project's own colours. It replaced the static
 * speckle texture (.bg-sparkle) that used to tile these same surfaces.
 *
 * Same behaviour as the original — rise, drift, mouse gravity and vortex, trail
 * history, idle orbit when the pointer has not moved, per-theme palette — with
 * five things the original leaves out and that a dozen of these on one page
 * need: device-pixel scaling, a ResizeObserver so it follows its section rather
 * than only the window, pausing while off screen, a still field under
 * prefers-reduced-motion, and a canvas no taller than the window.
 *
 * That last one is why the canvas slides: a section can be 6,000px tall, and
 * clearing a backing store that size every frame costs more than everything
 * else here put together. The canvas is one window tall and is moved down its
 * section as the page scrolls, so the dust is always where the reader is
 * looking and the cost never grows with the section.
 */

/* Inherited from the speckle tiles this replaced, so the pages kept the colours
   people already knew them by: brand violet and gold in the light theme, sky
   blue and magenta in the dark one. */
const PALETTES = {
  light: ["rgba(104, 84, 218,", "rgba(255, 194, 28,", "rgba(178, 148, 240,", "rgba(112, 90, 224,"],
  dark: ["rgba(114, 191, 241,", "rgba(218, 78, 201,", "rgba(227, 93, 203,", "rgba(255, 194, 28,"],
};

const TRAIL_LENGTH = 6;
const INFLUENCE_RADIUS = 180;
/* Drag alone left nothing to keep a speck moving: it rose for about a second,
   the 0.96 damping ate the last of its velocity, and it sat there. Two hundred
   stalled specks read as clumps rather than dust, so a steady lift replaces the
   velocity drag takes — terminal speed is LIFT / (1 - 0.96). The pointer's pull
   and swirl are softened to match, or the field collects around the cursor
   faster than the lift can carry it away. */
const LIFT = 0.05;
const PULL = 0.03;
const SWIRL = 0.14;
/* The count a field this size gets. Below it a wide window looks empty; above
   it a phone looks like static. */
const REFERENCE_AREA = 1440 * 900;

export default function CosmicDust({
  particleCount = 120,
  speedMultiplier = 1,
  particleSize = 1.5,
  theme = "system",
  className = "",
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, hasMoved: false });
  const [isDarkMode, setIsDarkMode] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

  /* The theme lives as a class on <html>, so following it is a class watch
     rather than a prop — this works with or without the theme provider. */
  useEffect(() => {
    const checkTheme = () => setIsDarkMode(theme === "system" ? document.documentElement.classList.contains("dark") : theme === "dark");
    checkTheme();
    if (theme !== "system") return undefined;
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours = isDarkMode ? PALETTES.dark : PALETTES.light;
    const field = canvas.parentElement;
    let width = 0, height = 0, animationId = 0, visible = true;

    // Keeps the window-tall canvas over the part of the section on screen.
    function follow() {
      if (!field) return;
      const rect = field.getBoundingClientRect();
      const shift = Math.min(Math.max(0, -rect.top), Math.max(0, rect.height - height));
      canvas.style.transform = `translate3d(0, ${Math.round(shift)}px, 0)`;
    }

    /* Backing store in device pixels, drawing in CSS pixels: without this the
       one-pixel specks and their trails are soft on any retina screen. */
    function measure() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    measure();
    mouseRef.current.targetX = width / 2;
    mouseRef.current.targetY = height / 2;

    /* `spread` places a particle anywhere in the field, for the first fill;
       without it a particle enters from just below the bottom edge. */
    const createParticle = (spread = false) => ({
      x: Math.random() * width,
      y: spread ? Math.random() * height : height + 10,
      vx: (Math.random() - 0.5) * 1.2 * speedMultiplier,
      vy: (-Math.random() - 0.2) * 1.5 * speedMultiplier,
      size: (Math.random() * 0.8 + 0.6) * particleSize,
      color: colours[Math.floor(Math.random() * colours.length)],
      opacity: Math.random() * 0.4 + 0.4,
      history: [],
    });

    // Density, not a fixed number: the same count over a 4K window is a handful
    // of specks, and over a phone it is a swarm.
    const density = Math.min(Math.max((width * height) / REFERENCE_AREA, 0.6), 2.2);
    const count = Math.max(12, Math.round(particleCount * density));
    let particles = Array.from({ length: count }, () => createParticle(true));

    function draw(p) {
      if (p.history.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.history[0].x, p.history[0].y);
        for (let i = 1; i < p.history.length; i += 1) ctx.lineTo(p.history[i].x, p.history[i].y);
        ctx.strokeStyle = `${p.color}${p.opacity * 0.35})`;
        ctx.lineWidth = p.size * 0.6;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      if (isDarkMode) {
        ctx.shadowBlur = 5;
        ctx.shadowColor = `${p.color}0.8)`;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = `${p.color}${p.opacity})`;
      ctx.fill();
      // Reset immediately: a live shadow makes every later fill cost more.
      ctx.shadowBlur = 0;
    }

    /* Reduced motion keeps the picture and drops the movement: the dust is
       painted once, and nothing is scheduled after that. */
    if (reduced) {
      const paint = () => { measure(); follow(); ctx.clearRect(0, 0, width, height); particles.forEach(draw); };
      paint();
      const observer = new ResizeObserver(paint);
      observer.observe(canvas);
      // Only the canvas moves on scroll; the dust on it is left where it was.
      window.addEventListener("scroll", follow, { passive: true });
      return () => { observer.disconnect(); window.removeEventListener("scroll", follow); };
    }

    function handleMouseMove(event) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = event.clientX - rect.left;
      mouseRef.current.targetY = event.clientY - rect.top;
      mouseRef.current.hasMoved = true;
    }
    window.addEventListener("mousemove", handleMouseMove);

    const resizeObserver = new ResizeObserver(() => { measure(); follow(); });
    resizeObserver.observe(canvas);

    /* A page carries several of these fields. Only the ones on screen are
       worth drawing, so the rest stop at the clear (see animate) until they
       scroll back into view. */
    const seenObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "120px" });
    seenObserver.observe(canvas);

    function animate(time) {
      animationId = requestAnimationFrame(animate);
      if (!width || !height) return;
      /* Before the visibility check, never after it: the canvas is only ever
         on screen because this keeps it there. Checking first would let it
         scroll away, stop itself, and then have nothing left to bring it
         back. Off screen it still costs one rect read a frame. */
      follow();
      if (!visible) return;
      ctx.clearRect(0, 0, width, height);

      // Nobody has moved the pointer yet: the field circles the middle slowly.
      if (!mouseRef.current.hasMoved) {
        const radius = Math.min(width, height) * 0.15;
        mouseRef.current.targetX = width / 2 + Math.cos(time * 0.001) * radius;
        mouseRef.current.targetY = height / 2 + Math.sin(time * 0.001) * radius;
      }
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
      const mX = mouseRef.current.x, mY = mouseRef.current.y;

      particles.forEach((p, index) => {
        p.vx += Math.sin(time * 0.002 + index) * 0.02 * speedMultiplier;

        const dx = mX - p.x, dy = mY - p.y;
        const dist = Math.hypot(dx, dy);
        // A particle sitting exactly under the pointer has no direction to be
        // pushed in, and dividing by that zero would take it off the canvas.
        if (dist < INFLUENCE_RADIUS && dist > 0.001) {
          const force = (1 - dist / INFLUENCE_RADIUS) * 0.8 * speedMultiplier;
          p.vx += (dx / dist) * force * PULL;
          p.vy += (dy / dist) * force * PULL;
          // And a tangent to that pull, which is what makes it a vortex.
          p.vx += (-dy / dist) * force * SWIRL;
          p.vy += (dx / dist) * force * SWIRL;
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        // Applied after the drag, so it is what the speck keeps.
        p.vy -= LIFT * speedMultiplier;
        p.x += p.vx;
        p.y += p.vy;

        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > TRAIL_LENGTH) p.history.shift();

        if (p.y < -10 || p.y > height + 60 || p.x < -10 || p.x > width + 10) {
          particles[index] = createParticle(false);
          return;
        }
        draw(p);
      });
    }

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      seenObserver.disconnect();
    };
  }, [particleCount, speedMultiplier, particleSize, isDarkMode]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`cosmic-dust ${className}`} />;
}
