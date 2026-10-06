import { apiRequest } from './httpClient';

function normalizeMatch(m) {
  return {
    matchId: m.code,
    id: m.id,
    organType: m.organ_type,
    patientName: m.patient_name,
    patientId: m.patient_code,
    bloodType: m.patient_blood_type,
    urgencyScore: m.urgency_score !== null ? Number(m.urgency_score) : null,
    donorHospital: m.donor_hospital_name,
    recipientHospital: m.recipient_hospital_name,
    compatibility: m.compatibility_score !== null ? Number(m.compatibility_score) : null,
    // Viability remaining = organ's window minus time already elapsed since ischemic clock started
    viabilitySecondsRemaining: Math.max(
      0,
      m.viability_window_minutes * 60 - Math.floor((Date.now() - new Date(m.ischemic_clock_start).getTime()) / 1000)
    ),
  };
}

export async function fetchPendingMatches() {
  const data = await apiRequest('/matches/pending');
  return data.matches.map(normalizeMatch);
}

export async function confirmMatch(matchId) {
  return apiRequest(`/matches/${matchId}/confirm`, { method: 'POST' });
}

export async function rejectMatch(matchId, reason) {
  return apiRequest(`/matches/${matchId}/reject`, { method: 'POST', body: { reason } });
}
