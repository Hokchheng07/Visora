import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { darkAssets } from './darkAssets';

import { ThemeContext } from './useTheme';
const KEY = 'visora-theme';
const systemTheme = () => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
function storedPreference() {
  try { const value = localStorage.getItem(KEY); return ['light', 'dark'].includes(value) ? value : 'system'; }
  catch { return 'system'; }
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(storedPreference);
  const [resolvedTheme, setResolvedTheme] = useState(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const transitionRef = useRef(null);

  function apply(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    setResolvedTheme(theme);
  }

  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)');
    const update = () => { if (preference === 'system') apply(systemTheme()); };
    query.addEventListener('change', update);
    const sync = (event) => {
      if (event.key !== KEY && event.key !== null) return;
      transitionRef.current?.skipTransition();
      const next = storedPreference();
      setPreference(next);
      apply(next === 'system' ? systemTheme() : next);
    };
    window.addEventListener('storage', sync);
    update();
    // Warm the small decorative variants before the first snapshot.
    Object.values(darkAssets).forEach((src) => { const image = new Image(); image.src = src; });
    return () => { query.removeEventListener('change', update); window.removeEventListener('storage', sync); };
  }, [preference]);

  async function toggleTheme(event) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    const commit = () => {
      try { localStorage.setItem(KEY, next); } catch { /* Theme still works without storage. */ }
      flushSync(() => { setPreference(next); apply(next); });
    };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || event?.detail === 0;
    let ruler;
    let committed = false;
    try {
      if (!document.startViewTransition) { commit(); return; }
      const width = innerWidth;
      const height = innerHeight;
      const distance = (width + height) / (2 * Math.SQRT2) + 80;
      document.documentElement.dataset.themeTransition = reduce ? 'fade' : 'ruler';
      const transition = document.startViewTransition(() => {
        commit();
        committed = true;
        if (!reduce) {
          ruler = document.createElement('div');
          ruler.className = `theme-ruler theme-ruler-${next}`;
          ruler.setAttribute('aria-hidden', 'true');
          ruler.style.width = `${Math.hypot(width, height) * 2 + 200}px`;
          ruler.innerHTML = '<span>VISORA · DESIGN YOUR WORLD · 45°</span>';
          document.body.append(ruler);
        }
      });
      transitionRef.current = transition;
      await transition.ready;
      if (!reduce) {
        const start = (width - height) / 2 + Math.SQRT2 * distance;
        const end = (width - height) / 2 - Math.SQRT2 * distance;
        // Percentages keep WebKit's high-DPI transition snapshots in CSS space.
        const polygon = (k) => `polygon(${k / width * 100}% 0%, 100% 0%, 100% 100%, ${(height + k) / width * 100}% 100%)`;
        const timing = { duration: 650, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'both' };
        await Promise.all([
          document.documentElement.animate({ clipPath: [polygon(start), polygon(end)] }, { ...timing, pseudoElement: '::view-transition-new(root)' }).finished,
          document.documentElement.animate({ transform: [`translateY(${-distance}px)`, `translateY(${distance}px)`] }, { ...timing, pseudoElement: '::view-transition-new(theme-ruler)' }).finished,
        ]);
      }
      await transition.finished;
    } catch {
      transitionRef.current?.skipTransition();
      if (!committed) commit();
    } finally {
      ruler?.remove();
      delete document.documentElement.dataset.themeTransition;
      transitionRef.current = null;
      running.current = false;
      setBusy(false);
    }
  }

  return <ThemeContext.Provider value={{ preference, resolvedTheme, toggleTheme, busy }}>{children}</ThemeContext.Provider>;
}
