import { apiRequest } from './httpClient';

function normalizeAlert(a) {
  return {
    id: a.id,
    vehicleId: a.vehicle_code,
    matchId: a.match_code,
    entryPoint: 'Route entry point',
    exitPoint: 'Route exit point',
    signalCount: 4,
    minutesOut: 3,
  };
}

export async function fetchMyCorridorAlerts() {
  const data = await apiRequest('/jurisdictions/alerts/mine');
  return data.alerts.map(normalizeAlert);
}

export async function clearSignals(alertId) {
  return apiRequest(`/jurisdictions/alerts/${alertId}/clear`, { method: 'POST' });
}

export async function flagCongestion(alertId, description) {
  return apiRequest(`/jurisdictions/alerts/${alertId}/flag-congestion`, {
    method: 'POST',
    body: { description },
  });
}
