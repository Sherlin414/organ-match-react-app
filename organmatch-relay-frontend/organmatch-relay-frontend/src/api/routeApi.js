import { apiRequest } from './httpClient';

function normalizeRoute(r) {
  if (!r) return null;
  return {
    id: r.id,
    matchId: r.match_code,
    vehicleId: r.vehicle_code,
    from: r.from_hospital,
    to: r.to_hospital,
    distanceRemainingKm: 6.2, // placeholder until a real maps API is integrated
    secondsRemaining: (r.viability_time_limit_minutes || 0) * 60,
    nextJurisdiction: 'Next jurisdiction pending route data',
  };
}

export async function fetchMyActiveRoute() {
  const data = await apiRequest('/routes/mine');
  return normalizeRoute(data.route);
}

export async function confirmDelivery(routeId) {
  return apiRequest(`/routes/${routeId}/confirm-delivery`, { method: 'POST' });
}
