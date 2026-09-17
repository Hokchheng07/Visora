import { useEffect, useState } from "react";

// Tracks a CSS media query. Starts from the real answer so the first render
// already has the right layout, instead of flashing the wrong one.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const list = window.matchMedia?.(query);
    if (!list) return undefined;
    const sync = () => setMatches(list.matches);
    sync();
    list.addEventListener("change", sync);
    return () => list.removeEventListener("change", sync);
  }, [query]);
  return matches;
}
