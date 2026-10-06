import { createContext, useCallback, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { loginRequest, loginWithGoogleRequest, registerRequest, updateProfileRequest, clearToken } from '../api/authApi';
import { isFieldEditable } from '../utils/permissions';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useLocalStorage('omrs_currentUser', null);
  const [isLoading, setIsLoading] = useState(false);

  // async/await against the mock/real API layer (src/api/authApi.js).
  const login = useCallback(
    async (email, password) => {
      setIsLoading(true);
      try {
        const user = await loginRequest(email, password);
        setCurrentUser(user);
        return { success: true, user };
      } catch (err) {
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentUser]
  );

  const loginWithGoogle = useCallback(
    async (googleProfile) => {
      setIsLoading(true);
      try {
        const user = await loginWithGoogleRequest(googleProfile);
        setCurrentUser(user);
        return { success: true, user };
      } catch (err) {
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentUser]
  );

  const register = useCallback(
    async (role, formData) => {
      setIsLoading(true);
      try {
        const user = await registerRequest(role, formData);
        setCurrentUser(user);
        return { success: true, user };
      } catch (err) {
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentUser]
  );

  const updateProfile = useCallback(
    async (updates) => {
      if (!currentUser) return { success: false, error: 'Not logged in.' };

      // Field-level permission check still happens client-side before the
      // "request" is even made — the API layer is trusted here since it's
      // local, but a real backend should also re-validate this server-side.
      const sanitized = {};
      for (const [key, value] of Object.entries(updates)) {
        if (isFieldEditable(currentUser.role, key)) {
          sanitized[key] = value;
        }
      }

      setIsLoading(true);
      try {
        const updatedUser = await updateProfileRequest(currentUser.id, sanitized);
        setCurrentUser(updatedUser);
        return { success: true, user: updatedUser };
      } catch (err) {
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, setCurrentUser]
  );

  const logout = useCallback(() => {
    clearToken();
    setCurrentUser(null);
  }, [setCurrentUser]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: !!currentUser,
      isLoading,
      login,
      loginWithGoogle,
      logout,
      register,
      updateProfile,
    }),
    [currentUser, isLoading, login, loginWithGoogle, logout, register, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
