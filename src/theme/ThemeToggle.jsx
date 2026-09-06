import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from './useTheme';

export default function ThemeToggle({ mobile = false }) {
  const { resolvedTheme, toggleTheme, busy } = useTheme();
  const dark = resolvedTheme === 'dark';
  return (
    <button type="button" onClick={toggleTheme} aria-disabled={busy}
      className={`theme-toggle ${mobile ? 'theme-toggle-mobile' : ''}`}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} aria-pressed={dark}>
      <span className="theme-toggle-icons" aria-hidden="true">
        <MoonIcon className={dark ? 'theme-icon-hidden' : ''} strokeWidth={1.75} />
        <SunIcon className={dark ? '' : 'theme-icon-hidden'} strokeWidth={1.75} />
      </span>
      {mobile && <span>{dark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
}
