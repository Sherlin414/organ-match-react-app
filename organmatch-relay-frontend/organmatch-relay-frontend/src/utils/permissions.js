import { ROLES } from './roleConfig';

// Fields every role is allowed to edit on their OWN profile.
// This is what enforces: "a patient can only edit their own settings,
// never another actor's page or their own clinical fields."
//
// Clinical / system-of-record fields (organNeeded, urgencyScore, waitlistStatus,
// vehicle assignment, jurisdiction boundaries, etc.) are intentionally left OUT
// of the patient's editable list, because in the real system those are only
// ever written by a Doctor or by the MatchEngine — never by the patient directly.

export const EDITABLE_FIELDS_BY_ROLE = {
  [ROLES.PATIENT]: ['name', 'contactNumber', 'password'],
  [ROLES.DOCTOR]: ['name', 'contactNumber', 'password', 'hospitalName', 'licenseNumber'],
  [ROLES.HOSPITAL_ADMIN]: ['name', 'contactNumber', 'password', 'hospitalName'],
  [ROLES.DONOR_COORDINATOR]: ['name', 'contactNumber', 'password', 'hospitalName'],
  [ROLES.SYSTEM_ADMIN]: ['name', 'contactNumber', 'password', 'organizationName'],
  [ROLES.AMBULANCE]: ['name', 'contactNumber', 'password', 'vehicleId'],
  [ROLES.POLICE]: ['name', 'contactNumber', 'password', 'stationName'],
};

// Fields shown on a profile but explicitly read-only (with an explanation),
// rather than just hidden — so the person understands WHY they can't edit it.
export const READONLY_FIELD_REASONS = {
  organNeeded: 'Only your doctor can update the organ type on your waitlist record.',
  bloodType: 'Blood type is locked after registration for medical safety.',
  urgencyScore: 'Urgency score is calculated by your care team, not self-reported.',
  waitlistStatus: 'Waitlist status is updated automatically by the matching engine.',
  registeredHospital: 'Contact your hospital directly to change your registered hospital.',
};

export function isFieldEditable(role, fieldName) {
  return EDITABLE_FIELDS_BY_ROLE[role]?.includes(fieldName) ?? false;
}

export function getReadonlyReason(fieldName) {
  return READONLY_FIELD_REASONS[fieldName] || 'This field cannot be edited from your account.';
}
