import { createSlice } from '@reduxjs/toolkit';

export const FONT_STYLES = [
  { id: 'times', label: 'Times New Roman (Default)', family: "'Times New Roman', Times, Baskerville, serif" },
  { id: 'inter', label: 'Inter', family: "'Inter', system-ui, sans-serif" },
  { id: 'sora', label: 'Sora', family: "'Sora', system-ui, sans-serif" },
  { id: 'poppins', label: 'Poppins', family: "'Poppins', system-ui, sans-serif" },
  { id: 'system', label: 'System Default', family: 'system-ui, -apple-system, sans-serif' },
];

export const ACCENT_COLORS = [
  { id: 'gold', label: 'Imperial Gold', value: '#D4AF37' },
  { id: 'crimson', label: 'Emergency Crimson Red', value: '#DC2626' },
  { id: 'ruby', label: 'Ruby Velvet', value: '#B91C1C' },
  { id: 'teal', label: 'Clinical Emerald', value: '#10B981' },
  { id: 'blue', label: 'Ocean Blue', value: '#1F6FEB' },
];

const DEFAULTS = {
  theme: 'glass',
  fontSize: 'medium',
  fontStyleId: 'times',
  accentColorId: 'gold',
};

// Read any previously saved settings synchronously so the very first render
// already has the right theme (avoids a flash of default styling).
function loadInitialState() {
  try {
    const saved = window.localStorage.getItem('omrs_theme_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure times new roman is preferred if previously default 'inter' was set
      return { ...DEFAULTS, ...parsed };
    }
    return DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: loadInitialState(),
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setFontSize(state, action) {
      state.fontSize = action.payload;
    },
    setFontStyleId(state, action) {
      state.fontStyleId = action.payload;
    },
    setAccentColorId(state, action) {
      state.accentColorId = action.payload;
    },
    resetToDefaults() {
      return DEFAULTS;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setFontSize,
  setFontStyleId,
  setAccentColorId,
  resetToDefaults,
} = themeSlice.actions;

export default themeSlice.reducer;
