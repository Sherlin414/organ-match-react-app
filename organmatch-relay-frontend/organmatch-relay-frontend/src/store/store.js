import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

// Simple persistence: whenever the theme slice changes, write it to
// localStorage. This is done outside the reducer (reducers must stay pure —
// no side effects like localStorage writes are allowed inside them).
let previousThemeState = store.getState().theme;
store.subscribe(() => {
  const currentThemeState = store.getState().theme;
  if (currentThemeState !== previousThemeState) {
    previousThemeState = currentThemeState;
    try {
      window.localStorage.setItem('omrs_theme_state', JSON.stringify(currentThemeState));
    } catch (err) {
      console.warn('Could not persist theme state', err);
    }
  }
});
