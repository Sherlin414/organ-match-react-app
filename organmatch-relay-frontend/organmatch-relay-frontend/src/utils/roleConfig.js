// Central definition of every actor role in the OrganMatch Relay System.
// Adding a new role only requires an entry here + a dashboard page + a route.

export const ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  DONOR_COORDINATOR: 'DONOR_COORDINATOR',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  AMBULANCE: 'AMBULANCE',
  POLICE: 'POLICE',
};

export const ROLE_LABELS = {
  [ROLES.PATIENT]: 'Patient',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.HOSPITAL_ADMIN]: 'Hospital Admin',
  [ROLES.DONOR_COORDINATOR]: 'Donor Coordinator',
  [ROLES.SYSTEM_ADMIN]: 'System Admin',
  [ROLES.AMBULANCE]: 'Ambulance',
  [ROLES.POLICE]: 'Police',
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.PATIENT]: 'Join the transplant waitlist and track your match status',
  [ROLES.DOCTOR]: 'Register patients and manage the hospital waitlist',
  [ROLES.HOSPITAL_ADMIN]: 'Confirm AI-matched organs and place transplant orders',
  [ROLES.DONOR_COORDINATOR]: 'Register available donor organs',
  [ROLES.SYSTEM_ADMIN]: 'Oversee the hospital network and audit log',
  [ROLES.AMBULANCE]: 'View live corridor routes and confirm deliveries',
  [ROLES.POLICE]: 'Clear traffic signals along active green corridors',
};

// Accent color per role, used for small badges/avatars around the app
export const ROLE_COLORS = {
  [ROLES.PATIENT]: '#6D5DD3',
  [ROLES.DOCTOR]: '#2C6E49',
  [ROLES.HOSPITAL_ADMIN]: '#1F6FEB',
  [ROLES.DONOR_COORDINATOR]: '#C1673A',
  [ROLES.SYSTEM_ADMIN]: '#5A6472',
  [ROLES.AMBULANCE]: '#2C6E49',
  [ROLES.POLICE]: '#8A4B2E',
};

// Where each role lands after login
export const ROLE_DASHBOARD_PATH = {
  [ROLES.PATIENT]: '/patient',
  [ROLES.DOCTOR]: '/doctor',
  [ROLES.HOSPITAL_ADMIN]: '/hospital-admin',
  [ROLES.DONOR_COORDINATOR]: '/donor-coordinator',
  [ROLES.SYSTEM_ADMIN]: '/system-admin',
  [ROLES.AMBULANCE]: '/ambulance',
  [ROLES.POLICE]: '/police',
};

// Default values merged in at registration time for fields the register form
// doesn't collect directly but the dashboards expect to exist (e.g. a brand
// new patient hasn't been matched yet, so their status starts as "Waiting").
export const ROLE_DEFAULT_FIELDS = {
  [ROLES.PATIENT]: { waitlistStatus: 'Waiting' },
};

// Extra registration fields required per role, beyond the universal
// name / email / password / contactNumber fields every actor has.
export const ROLE_REGISTER_FIELDS = {
  [ROLES.PATIENT]: [
    { name: 'organNeeded', label: 'Organ Needed', type: 'select', options: ['Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas'] },
    { name: 'bloodType', label: 'Blood Type', type: 'select', options: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] },
    { name: 'registeredHospital', label: 'Recipient Hospital', type: 'text', placeholder: 'e.g. City General Hospital' },
  ],
  [ROLES.DOCTOR]: [
    { name: 'hospitalName', label: 'Hospital Name', type: 'text', placeholder: 'e.g. City General Hospital' },
    { name: 'licenseNumber', label: 'Medical License Number', type: 'text', placeholder: 'e.g. MED-88213' },
  ],
  [ROLES.HOSPITAL_ADMIN]: [
    { name: 'hospitalName', label: 'Hospital Name', type: 'text', placeholder: 'e.g. City General Hospital' },
  ],
  [ROLES.DONOR_COORDINATOR]: [
    { name: 'hospitalName', label: 'Donor Hospital Name', type: 'text', placeholder: 'e.g. St. Xavier Medical Center' },
  ],
  [ROLES.SYSTEM_ADMIN]: [
    { name: 'organizationName', label: 'Regional Registry / Organization', type: 'text', placeholder: 'e.g. National Organ Registry' },
  ],
  [ROLES.AMBULANCE]: [
    { name: 'licenseId', label: 'Driver License ID', type: 'text', placeholder: 'e.g. DL-44219' },
    { name: 'vehicleId', label: 'Vehicle ID', type: 'text', placeholder: 'e.g. AMB-114' },
  ],
  [ROLES.POLICE]: [
    { name: 'stationName', label: 'Station Name', type: 'text', placeholder: 'e.g. Sector 12 Traffic Control' },
    { name: 'jurisdictionId', label: 'Jurisdiction ID', type: 'text', placeholder: 'e.g. JX-012' },
  ],
};
