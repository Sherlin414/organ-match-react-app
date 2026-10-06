import { Organ, Patient, Match, Hospital, User, Notification } from '../models/index.js';
import { writeAuditLog } from './auditLogService.js';
import { emitToUser, emitToRole } from '../realtime/io.js';

const COMPATIBLE_BLOOD_TYPES = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export function isBloodCompatible(donorBloodType, patientBloodType) {
  return COMPATIBLE_BLOOD_TYPES[donorBloodType]?.includes(patientBloodType) ?? false;
}

export function hlaOverlapCount(donorMarkers, patientMarkers) {
  if (!donorMarkers?.length || !patientMarkers?.length) return 0;
  const patientSet = new Set(patientMarkers);
  return donorMarkers.filter((m) => patientSet.has(m)).length;
}

/**
 * Calculates Haversine distance in kilometers between two lat/lng points.
 */
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 10.0; // fallback reasonable local distance
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Fully deterministic multi-parameter compatibility scoring model.
 * Educational & Simulation Prototype — Not a clinical decision-making system.
 */
export function calculateDeterministicCompatibility({
  donorBloodType,
  patientBloodType,
  donorHlaMarkers = [],
  patientHlaMarkers = [],
  urgencyScore = 50,
  registeredAt = new Date(),
  distanceKm = 10,
}) {
  if (!isBloodCompatible(donorBloodType, patientBloodType)) return 0;

  // 1. ABO Compatibility (35 max): Identical gets 35, compatible non-identical gets 25
  const bloodComponent = donorBloodType === patientBloodType ? 35 : 25;

  // 2. HLA Concordance (25 max): (overlap / 6) * 25
  const overlap = hlaOverlapCount(donorHlaMarkers, patientHlaMarkers);
  const hlaComponent = (Math.min(overlap, 6) / 6) * 25;

  // 3. Clinical Urgency (20 max): MELD/urgency scaled 0-100 to 0-20
  const urgencyComponent = (Math.min(Math.max(urgencyScore || 0, 0), 100) / 100) * 20;

  // 4. Waiting List Seniority (10 max): 0.5 points per day waiting up to 10
  const daysWaiting = Math.max(0, (Date.now() - new Date(registeredAt).getTime()) / (1000 * 60 * 60 * 24));
  const waitlistComponent = Math.min(10, daysWaiting * 0.5);

  // 5. Geographic Proximity & Ischemic Feasibility (10 max): Decay by distance
  const proximityComponent = Math.max(0, 10 - distanceKm / 25);

  const total = bloodComponent + hlaComponent + urgencyComponent + waitlistComponent + proximityComponent;
  return Math.min(100, Math.round(total * 10) / 10);
}

export function computeViabilityDecayCost({ viabilityWindowMinutes, estimatedTravelMinutes, urgencyScore }) {
  const remainingAfterTravel = viabilityWindowMinutes - estimatedTravelMinutes;
  if (remainingAfterTravel <= 0) return 100;
  const urgencyFactor = 1 - (urgencyScore || 50) / 200;
  const decay = (estimatedTravelMinutes / viabilityWindowMinutes) * 100 * urgencyFactor;
  return Math.round(Math.max(0, Math.min(100, decay)) * 10) / 10;
}

export async function rankCandidates(organ) {
  const candidates = await Patient.find({
    organ_needed: organ.organ_type,
    waitlist_status: 'Waiting',
  })
    .populate('registered_hospital_id')
    .sort({ urgency_score: -1, registered_at: 1 });

  const donorHospital = await Hospital.findById(organ.donor_hospital_id);

  const scored = candidates
    .map((patient) => {
      const recipientHospital = patient.registered_hospital_id;
      const distanceKm = calculateHaversineDistanceKm(
        donorHospital?.location_lat,
        donorHospital?.location_lng,
        recipientHospital?.location_lat,
        recipientHospital?.location_lng
      );

      const compatibility = calculateDeterministicCompatibility({
        donorBloodType: organ.blood_type,
        patientBloodType: patient.blood_type,
        donorHlaMarkers: organ.hla_markers,
        patientHlaMarkers: patient.hla_markers,
        urgencyScore: patient.urgency_score,
        registeredAt: patient.registered_at,
        distanceKm,
      });

      return {
        patient,
        compatibility,
        distanceKm,
      };
    })
    .filter((c) => c.compatibility > 0)
    .sort((a, b) => {
      if (b.compatibility !== a.compatibility) return b.compatibility - a.compatibility;
      if (b.patient.urgency_score !== a.patient.urgency_score) return b.patient.urgency_score - a.patient.urgency_score;
      return new Date(a.patient.registered_at).getTime() - new Date(b.patient.registered_at).getTime();
    });

  return scored;
}

export async function matchOrganToPatient(organId) {
  const organ = await Organ.findById(organId).populate('donor_hospital_id');
  if (!organ) throw new Error('Organ not found');

  const ranked = await rankCandidates(organ);
  if (ranked.length === 0) {
    await writeAuditLog({
      eventType: 'NoCompatibleMatchFound',
      details: `[Educational Prototype] No compatible waiting patient found for organ ${organ.code} (${organ.organ_type}, ${organ.blood_type}).`,
    });
    return null;
  }

  const best = ranked[0];
  const distanceKm = best.distanceKm || 12;
  // Realistic transit estimation based on 60 km/h emergency speed + 5 min prep
  const estimatedTravelMinutes = Math.max(10, Math.round((distanceKm / 60) * 60 + 5));

  const decayCost = computeViabilityDecayCost({
    viabilityWindowMinutes: organ.viability_window_minutes,
    estimatedTravelMinutes,
    urgencyScore: best.patient.urgency_score,
  });

  const count = await Match.countDocuments();
  const code = `MTC-${1000 + count + 1}`;

  const match = await Match.create({
    code,
    organ_id: organ._id,
    patient_id: best.patient._id,
    compatibility_score: best.compatibility,
    viability_decay_cost: decayCost,
    distance_km: distanceKm,
    status: 'Proposed',
  });

  await Organ.findByIdAndUpdate(organ._id, { status: 'Matched' });
  await Patient.findByIdAndUpdate(best.patient._id, { waitlist_status: 'Matched' });

  await writeAuditLog({
    relatedMatchId: match._id,
    eventType: 'MatchProposed',
    details: `[Simulation Prototype] Match ${match.code} proposed: organ ${organ.code} (${organ.organ_type}) -> patient ${best.patient.code} (${best.patient.name}), deterministic compatibility ${best.compatibility}%, distance ${distanceKm} km.`,
  });

  // Notify Hospital Admins at the recipient hospital
  const recipientHospitalId = best.patient.registered_hospital_id?._id || best.patient.registered_hospital_id;
  const admins = await User.find({
    role: 'HOSPITAL_ADMIN',
    hospital_id: recipientHospitalId,
  });

  for (const admin of admins) {
    const message = `New match alert: ${organ.organ_type} (Compatibility: ${best.compatibility}%) matched to waitlisted patient ${best.patient.name} (${best.patient.code}).`;
    await Notification.create({
      recipient_id: admin._id,
      message,
      type: 'MatchAlert',
      data: { matchId: match._id, matchCode: match.code },
    });
    emitToUser(admin._id.toString(), 'match:proposed', {
      matchId: match._id,
      matchCode: match.code,
      message,
    });
  }

  // Also broadcast to role HOSPITAL_ADMIN so all admins can view pending queue
  emitToRole('HOSPITAL_ADMIN', 'match:updated', { matchId: match._id, matchCode: match.code });

  return match;
}

export async function reMatch(matchId) {
  const oldMatch = await Match.findById(matchId);
  if (!oldMatch) throw new Error('Match not found');

  await Match.findByIdAndUpdate(matchId, { status: 'Rematched' });
  await Patient.findByIdAndUpdate(oldMatch.patient_id, { waitlist_status: 'Waiting' });

  return matchOrganToPatient(oldMatch.organ_id);
}
