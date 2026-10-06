import { useTheme } from '../../hooks/useTheme';

// useTheme() contains the useEffect that writes theme/font/color onto
// <html> as CSS custom properties. That effect needs to run on every page,
// not just when Settings.jsx happens to be mounted — this component's only
// job is to stay mounted for the lifetime of the app so that effect always
// runs, even on pages that never call useTheme() themselves.
export function ThemeEffectsBridge() {
  useTheme();
  return null;
}
