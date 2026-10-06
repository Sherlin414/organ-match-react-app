import { apiRequest } from './httpClient';

export async function registerOrgan({ organType, bloodType, viabilityWindow }) {
  const data = await apiRequest('/organs', {
    method: 'POST',
    body: { organType, bloodType, viabilityWindow: Number(viabilityWindow) },
  });
  return data; // { organ, match } — match will be null if no compatible patient exists yet
}
