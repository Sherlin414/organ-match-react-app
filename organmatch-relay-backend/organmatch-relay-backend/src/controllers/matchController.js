import { Match, Organ, Patient, User, Hospital } from '../models/index.js';
import { reMatch } from '../services/matchingEngine.js';
import { generateRoute } from '../services/routingService.js';
import { writeAuditLog } from '../services/auditLogService.js';
import { emitToRole } from '../realtime/io.js';

export async function listPendingMatches(req, res) {
  const admin = await User.findById(req.user.id);

  const query = { status: 'Proposed' };

  const matches = await Match.find(query)
    .populate({
      path: 'organ_id',
      populate: { path: 'donor_hospital_id' },
    })
    .populate({
      path: 'patient_id',
      populate: { path: 'registered_hospital_id' },
    })
    .sort({ created_at: -1 });

  // Filter matches for this admin's hospital if they are linked to one, or return all if unlinked/system admin
  const filtered = matches.filter((m) => {
    if (!admin?.hospital_id) return true;
    const recipientHospitalId = m.patient_id?.registered_hospital_id?._id?.toString();
    return !recipientHospitalId || recipientHospitalId === admin.hospital_id.toString();
  });

  const formatted = filtered.map((m) => {
    const organ = m.organ_id || {};
    const patient = m.patient_id || {};
    const donorHospital = organ.donor_hospital_id || {};
    const recipientHospital = patient.registered_hospital_id || {};

    return {
      id: m._id.toString(),
      code: m.code,
      organ_id: organ._id?.toString(),
      patient_id: patient._id?.toString(),
      compatibility_score: m.compatibility_score,
      viability_decay_cost: m.viability_decay_cost,
      distance_km: m.distance_km,
      status: m.status,
      created_at: m.created_at,
      organ_type: organ.organ_type || 'Kidney',
      organ_blood_type: organ.blood_type || 'O+',
      viability_window_minutes: organ.viability_window_minutes || 1440,
      ischemic_clock_start: organ.ischemic_clock_start || m.created_at,
      donor_hospital_name: donorHospital.name || 'Donor Base',
      patient_name: patient.name || 'Recipient Candidate',
      patient_code: patient.code || 'P-00000',
      patient_blood_type: patient.blood_type || 'O+',
      urgency_score: patient.urgency_score || 75,
      recipient_hospital_name: recipientHospital.name || 'Recipient Hospital',
    };
  });

  res.json({ matches: formatted });
}

export async function confirmMatch(req, res) {
  const { id } = req.params;

  const match = await Match.findById(id);
  if (!match) return res.status(404).json({ message: 'Match not found.' });

  match.status = 'Confirmed';
  match.confirmed_by = req.user.id;
  match.confirmed_at = new Date();
  await match.save();

  await Patient.findByIdAndUpdate(match.patient_id, { waitlist_status: 'Matched' });

  await writeAuditLog({
    relatedMatchId: match._id,
    eventType: 'MatchConfirmed',
    details: `[Simulation Dual-Auth] Match ${match.code} confirmed by hospital admin ${req.user.id}. Dispatch initiated.`,
  });

  const route = await generateRoute(match._id);

  emitToRole('HOSPITAL_ADMIN', 'match:confirmed', { matchId: match._id, code: match.code });
  emitToRole('DOCTOR', 'match:confirmed', { matchId: match._id, code: match.code });

  res.json({ match, route });
}

export async function rejectMatch(req, res) {
  const { id } = req.params;
  const { reason } = req.body;

  const match = await Match.findById(id);
  if (!match) return res.status(404).json({ message: 'Match not found.' });

  match.status = 'Rejected';
  await match.save();

  await writeAuditLog({
    relatedMatchId: match._id,
    eventType: 'MatchRejected',
    details: `Match ${match.code} rejected by hospital admin ${req.user.id}. Reason: ${reason || 'Not specified'}.`,
  });

  const newMatch = await reMatch(id);

  emitToRole('HOSPITAL_ADMIN', 'match:rejected', { matchId: match._id, code: match.code });

  res.json({ rejectedMatch: match, newMatch });
}

export async function listAllMatches(req, res) {
  const matches = await Match.find()
    .populate({
      path: 'organ_id',
      populate: { path: 'donor_hospital_id' },
    })
    .populate({
      path: 'patient_id',
      populate: { path: 'registered_hospital_id' },
    })
    .sort({ created_at: -1 });

  const formatted = matches.map((m) => {
    const organ = m.organ_id || {};
    const patient = m.patient_id || {};
    return {
      id: m._id.toString(),
      code: m.code,
      organ_type: organ.organ_type || '—',
      organ_blood_type: organ.blood_type || '—',
      patient_name: patient.name || '—',
      patient_code: patient.code || '—',
      patient_blood_type: patient.blood_type || '—',
      urgency_score: patient.urgency_score || 0,
      donor_hospital_name: organ.donor_hospital_id?.name || '—',
      recipient_hospital_name: patient.registered_hospital_id?.name || '—',
      compatibility_score: m.compatibility_score,
      status: m.status,
      created_at: m.created_at,
    };
  });

  res.json({ matches: formatted });
}
