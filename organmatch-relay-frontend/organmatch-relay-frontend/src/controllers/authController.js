// Controller layer (MVC mapping — see README "Architecture" section):
//   Model      -> src/contexts, src/store, src/api  (state + business logic)
//   View       -> src/pages, src/components          (rendering only)
//   Controller -> src/controllers                    (this file)
//
// These functions take the Model's actions (login/register, already bound
// via useAuth()) plus whatever the View needs to react (setError, navigate)
// and decide WHAT HAPPENS next. The View stays "dumb" — it just calls the
// controller and renders whatever state comes back.

import { ROLE_DASHBOARD_PATH } from '../utils/roleConfig';

export async function handleLoginSubmit({ email, password, login, navigate, setError }) {
  setError('');
  const result = await login(email, password);
  if (!result.success) {
    setError(result.error);
    return false;
  }
  navigate(ROLE_DASHBOARD_PATH[result.user.role] || '/');
  return true;
}

export async function handleGoogleLoginSubmit({ googleProfile, loginWithGoogle, navigate, setError }) {
  if (setError) setError('');
  const result = await loginWithGoogle(googleProfile);
  if (!result.success) {
    if (setError) setError(result.error || 'Google sign-in could not be completed.');
    return false;
  }
  navigate(ROLE_DASHBOARD_PATH[result.user.role] || '/');
  return true;
}

export async function handleRegisterSubmit({ role, fields, formData, register, navigate, setError }) {
  setError('');
  for (const field of fields) {
    if (!formData[field.name]) {
      setError(`Please fill in "${field.label}".`);
      return false;
    }
  }
  const result = await register(role, formData);
  if (!result.success) {
    setError(result.error);
    return false;
  }
  navigate(ROLE_DASHBOARD_PATH[role] || '/');
  return true;
}

export async function handleProfileSave({ allFields, role, formData, updateProfile, isFieldEditable, setSaved }) {
  const updates = {};
  for (const field of allFields) {
    if (isFieldEditable(role, field)) {
      updates[field] = formData[field];
    }
  }
  if (formData.password) {
    updates.password = formData.password;
  }
  const result = await updateProfile(updates);
  if (result.success) {
    setSaved(true);
  }
  return result;
}
