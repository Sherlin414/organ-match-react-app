import { useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setTheme as setThemeAction,
  toggleTheme as toggleThemeAction,
  setFontSize as setFontSizeAction,
  setFontStyleId as setFontStyleIdAction,
  setAccentColorId as setAccentColorIdAction,
  resetToDefaults as resetToDefaultsAction,
  FONT_STYLES,
  ACCENT_COLORS,
} from '../store/themeSlice';

const FONT_SIZE_SCALE = { small: '13.5px', medium: '15px', large: '16.5px' };

// Backed by Redux (see src/store/themeSlice.js) instead of React Context.
// Kept the same return shape as the old Context-based version so no
// consuming page had to change when the state management moved to Redux.
export function useTheme() {
  const dispatch = useDispatch();
  const { theme, fontSize, fontStyleId, accentColorId } = useSelector((state) => state.theme);

  const fontStyle = useMemo(
    () => FONT_STYLES.find((f) => f.id === fontStyleId) || FONT_STYLES[0],
    [fontStyleId]
  );
  const accentColor = useMemo(
    () => ACCENT_COLORS.find((c) => c.id === accentColorId) || ACCENT_COLORS[0],
    [accentColorId]
  );

  // Apply theme/font/color to CSS custom properties on <html> whenever they change.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--omrs-font-size-base', FONT_SIZE_SCALE[fontSize] || FONT_SIZE_SCALE.medium);
    root.style.setProperty('--omrs-font-family', fontStyle.family);
    root.style.setProperty('--omrs-accent', accentColor.value);

    try {
      localStorage.setItem('omrs_theme_state', JSON.stringify({ theme, fontSize, fontStyleId, accentColorId }));
    } catch {
      // ignore
    }
  }, [theme, fontSize, fontStyle, accentColor, fontStyleId, accentColorId]);

  const setTheme = useCallback((value) => dispatch(setThemeAction(value)), [dispatch]);
  const toggleTheme = useCallback(() => dispatch(toggleThemeAction()), [dispatch]);
  const setFontSize = useCallback((value) => dispatch(setFontSizeAction(value)), [dispatch]);
  const setFontStyleId = useCallback((value) => dispatch(setFontStyleIdAction(value)), [dispatch]);
  const setAccentColorId = useCallback((value) => dispatch(setAccentColorIdAction(value)), [dispatch]);
  const resetToDefaults = useCallback(() => dispatch(resetToDefaultsAction()), [dispatch]);

  return {
    theme, setTheme, toggleTheme,
    fontSize, setFontSize,
    fontStyleId, setFontStyleId, fontStyle,
    accentColorId, setAccentColorId, accentColor,
    resetToDefaults,
  };
}

export { FONT_STYLES, ACCENT_COLORS };
