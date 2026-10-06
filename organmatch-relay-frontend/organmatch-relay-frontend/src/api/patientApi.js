import { apiRequest } from './httpClient';

function normalizePatient(p) {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    organ: p.organ_needed,
    bloodType: p.blood_type,
    urgency: p.urgency_score !== null ? Number(p.urgency_score) : null,
    status: p.waitlist_status,
    registered: new Date(p.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
}

export async function fetchWaitlist() {
  const data = await apiRequest('/patients');
  return data.patients.map(normalizePatient);
}

export async function registerPatient({ name, organNeeded, bloodType, urgencyScore }) {
  const data = await apiRequest('/patients', {
    method: 'POST',
    body: { name, organNeeded, bloodType, urgencyScore },
  });
  return normalizePatient(data.patient);
}
