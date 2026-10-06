// Static mock data powering the dashboards. In a real deployment this would
// come from the backend API described in the project's ER diagram / schema.

export const MOCK_WAITLIST = [
  { id: 'P-10432', name: 'Arjun Menon', organ: 'Kidney', bloodType: 'O+', urgency: 92.4, status: 'Matched', registered: 'Jan 12, 2026' },
  { id: 'P-10388', name: 'Priya Nair', organ: 'Liver', bloodType: 'B+', urgency: 78.1, status: 'Waiting', registered: 'Jan 10, 2026' },
  { id: 'P-10391', name: 'Rohan Das', organ: 'Heart', bloodType: 'A-', urgency: 74.6, status: 'Waiting', registered: 'Jan 9, 2026' },
  { id: 'P-10402', name: 'Meera Iyer', organ: 'Kidney', bloodType: 'AB+', urgency: 61.2, status: 'Waiting', registered: 'Jan 8, 2026' },
  { id: 'P-10375', name: 'Sanjay Kapoor', organ: 'Lung', bloodType: 'O-', urgency: 58.9, status: 'Waiting', registered: 'Jan 6, 2026' },
];

export const MOCK_MATCH_ALERT = {
  matchId: 'MTC-2291',
  organType: 'Kidney',
  patientName: 'Arjun Menon',
  patientId: 'P-10432',
  bloodType: 'O+',
  urgencyScore: 92.4,
  donorHospital: 'St. Xavier Medical Center',
  recipientHospital: 'City General Hospital',
  compatibility: 96.8,
  viabilitySecondsRemaining: 67 * 60 + 42, // countdown seed, in seconds
};

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'critical', title: 'New Match Alert', subtitle: 'Kidney matched to Arjun Menon (P-10432)', time: '2 minutes ago' },
  { id: 'n2', type: 'success', title: 'Route Confirmed', subtitle: 'Ambulance AMB-114 assigned, ETA 22 min', time: '1 hour ago' },
  { id: 'n3', type: 'info', title: 'Patient Added to Waitlist', subtitle: 'Priya Nair added — Liver, Urgency 78.1', time: '3 hours ago' },
  { id: 'n4', type: 'neutral', title: 'Match Delivered', subtitle: 'Match #MTC-2277 completed successfully', time: 'Yesterday' },
];

export const MOCK_AUDIT_LOG = [
  { event: 'Match Confirmed by Admin', matchId: 'MTC-2291', timestamp: 'Jan 15, 2026 — 14:36:02', hash: '9f8a...c231' },
  { event: 'Route Generated', matchId: 'MTC-2291', timestamp: 'Jan 15, 2026 — 14:36:05', hash: '4b1e...77af' },
  { event: 'Jurisdiction Entry — Sector 12', matchId: 'MTC-2291', timestamp: 'Jan 15, 2026 — 14:41:18', hash: '2d0c...e910' },
  { event: 'Match Delivered', matchId: 'MTC-2277', timestamp: 'Jan 14, 2026 — 09:12:44', hash: '77aa...1b3d' },
];

export const MOCK_NETWORK_STATS = [
  { label: 'Active Matches', value: '7' },
  { label: 'Patients Waiting', value: '142' },
  { label: 'Hospitals Connected', value: '38' },
  { label: 'Avg. Match Time', value: '4.2 min' },
];

export const MOCK_ROUTE = {
  matchId: 'MTC-2291',
  vehicleId: 'AMB-114',
  from: 'St. Xavier Medical Center',
  to: 'City General Hospital',
  nextJurisdiction: 'Sector 12 Traffic Control (in 3 min)',
  distanceRemainingKm: 6.2,
  secondsRemaining: 19 * 60 + 42,
};

export const MOCK_CORRIDOR_ALERT = {
  vehicleId: 'AMB-114',
  matchId: 'MTC-2291',
  minutesOut: 3,
  entryPoint: 'MG Road Junction',
  exitPoint: 'Hospital Ring Road',
  signalCount: 4,
};
