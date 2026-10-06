import { apiRequest } from './httpClient';

function normalizeNotification(n) {
  const typeToVariant = {
    MatchAlert: 'critical',
    CorridorAlert: 'critical',
    RouteAssigned: 'success',
    Delivery: 'success',
    WaitlistUpdate: 'info',
  };
  return {
    id: n.id,
    type: typeToVariant[n.type] || 'neutral',
    title: n.type?.replace(/([A-Z])/g, ' $1').trim() || 'Notification',
    subtitle: n.message,
    time: new Date(n.timestamp).toLocaleString(),
  };
}

export async function fetchMyNotifications() {
  const data = await apiRequest('/notifications/mine');
  return data.notifications.map(normalizeNotification);
}
