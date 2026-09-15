import { createContext, useContext } from 'react';
import { darkAssets } from './darkAssets';

export const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);
export function useThemeAsset() {
  const { resolvedTheme } = useTheme();
  return (src) => resolvedTheme === 'dark' ? darkAssets[src] ?? src : src;
}
