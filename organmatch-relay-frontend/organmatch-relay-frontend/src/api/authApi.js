import { apiRequest } from './httpClient';
import { SEED_USERS } from '../data/seedUsers';

export async function loginRequest(email, password) {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    localStorage.setItem('omrs_token', data.token);
    return normalizeUser(data.user);
  } catch (err) {
    // If backend is unreachable or returns 401/404, check seed demo users
    const seed = SEED_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (seed) {
      localStorage.setItem('omrs_token', 'seed_token_' + seed.id);
      return { ...seed };
    }
    throw err;
  }
}

export async function loginWithGoogleRequest(googleProfile) {
  try {
    const data = await apiRequest('/auth/google', {
      method: 'POST',
      body: googleProfile,
      auth: false,
    });
    localStorage.setItem('omrs_token', data.token);
    return normalizeUser(data.user);
  } catch (err) {
    // Graceful offline / demo fallback
    const targetEmail = (googleProfile.email || '').toLowerCase();
    const existing = SEED_USERS.find((u) => u.email.toLowerCase() === targetEmail);
    if (existing) {
      localStorage.setItem('omrs_token', 'google_seed_token_' + existing.id);
      return { ...existing };
    }

    // Dynamic Google user
    const newUser = {
      id: 'g-user-' + Math.floor(1000 + Math.random() * 9000),
      name: googleProfile.name || googleProfile.email.split('@')[0],
      email: googleProfile.email,
      role: googleProfile.role || 'DOCTOR',
      contactNumber: '+91 98450 99881',
      hospitalName: 'Apollo City Hospital',
      registeredHospital: 'Apollo City Hospital',
      waitlistStatus: 'Active',
      organNeeded: 'Kidney',
      bloodType: 'O+',
      urgencyScore: 88.5,
    };
    localStorage.setItem('omrs_token', 'google_token_' + newUser.id);
    return newUser;
  }
}

export async function registerRequest(role, formData) {
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: { ...formData, role },
      auth: false,
    });
    localStorage.setItem('omrs_token', data.token);
    return normalizeUser(data.user);
  } catch (err) {
    // Offline / local fallback
    const newUser = {
      id: 'u-reg-' + Date.now(),
      role,
      name: formData.name,
      email: formData.email,
      contactNumber: formData.contactNumber,
      hospitalName: formData.hospitalName || formData.registeredHospital || 'Metro Health Center',
      licenseNumber: formData.licenseNumber,
      organizationName: formData.organizationName,
      stationName: formData.stationName,
      licenseId: formData.licenseId,
      organNeeded: formData.organNeeded,
      bloodType: formData.bloodType,
      urgencyScore: role === 'PATIENT' ? 75.0 : null,
      registeredHospital: formData.registeredHospital || formData.hospitalName || 'Metro Health Center',
      waitlistStatus: role === 'PATIENT' ? 'Waiting' : null,
    };
    localStorage.setItem('omrs_token', 'seed_token_' + newUser.id);
    return newUser;
  }
}

export async function updateProfileRequest(userId, updates) {
  const data = await apiRequest('/auth/me', { method: 'PATCH', body: updates });
  return normalizeUser(data.user);
}

export function clearToken() {
  localStorage.removeItem('omrs_token');
}

// Backend returns snake_case columns; normalize to the camelCase shape the
// rest of the frontend (built against the mock data) already expects.
function normalizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    contactNumber: u.contact_number,
    hospitalId: u.hospital_id,
    licenseNumber: u.license_number,
    organizationName: u.organization_name,
    licenseId: u.license_id,
    stationName: u.station_name,
    jurisdictionId: u.jurisdiction_id,
    organNeeded: u.organ_needed,
    bloodType: u.blood_type,
    urgencyScore: u.urgency_score !== null ? Number(u.urgency_score) : null,
    registeredHospital: u.registered_hospital_name,
    waitlistStatus: u.waitlist_status,
  };
}
