import { apiRequest } from './httpClient';

export async function fetchNetworkStats() {
  const data = await apiRequest('/stats/network');
  return data.stats;
}

export async function fetchAuditLog() {
  const data = await apiRequest('/stats/audit-log');
  return {
    chainValid: data.chainValid,
    entries: data.entries.map((e) => ({
      event: e.event_type,
      matchId: e.match_code || '—',
      timestamp: new Date(e.timestamp).toLocaleString(),
      hash: `${e.current_hash.slice(0, 4)}...${e.current_hash.slice(-4)}`,
    })),
  };
}
