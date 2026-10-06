import { Organ, User, Hospital } from '../models/index.js';
import { matchOrganToPatient } from '../services/matchingEngine.js';
import { writeAuditLog } from '../services/auditLogService.js';
import { emitToRole } from '../realtime/io.js';

// Deterministic HLA marker generation based on organ index
function generateHlaMarkers(seedNumber) {
  const base = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const offset = (seedNumber || 1) % 6;
  return base.slice(offset, offset + 6);
}

export async function registerOrgan(req, res) {
  const { organType, bloodType, viabilityWindow } = req.body;
  if (!organType || !bloodType || !viabilityWindow) {
    return res.status(400).json({ message: 'organType, bloodType, and viabilityWindow are required.' });
  }

  const coordinator = await User.findById(req.user.id);
  let hospitalId = coordinator?.hospital_id;
  if (!hospitalId) {
    const defaultHospital = await Hospital.findOne();
    hospitalId = defaultHospital?._id;
  }

  const count = await Organ.countDocuments();
  const code = `ORG-${1000 + count + 1}`;
  const hlaMarkers = generateHlaMarkers(count + 1);

  const organ = await Organ.create({
    code,
    organ_type: organType,
    blood_type: bloodType,
    viability_window_minutes: Number(viabilityWindow),
    donor_hospital_id: hospitalId,
    registered_by: req.user.id,
    status: 'Available',
    hla_markers: hlaMarkers,
    retrieval_timestamp: new Date(),
    ischemic_clock_start: new Date(),
  });

  await writeAuditLog({
    eventType: 'OrganRegistered',
    details: `Donor organ ${organ.code} (${organType}, ${bloodType}) registered by coordinator ${coordinator?.name || req.user.id}. Viability window: ${viabilityWindow} min.`,
  });

  // Execute deterministic matching engine
  const match = await matchOrganToPatient(organ._id);

  const populated = await Organ.findById(organ._id).populate('donor_hospital_id');
  const result = populated.toObject();
  result.id = result._id.toString();

  // Broadcast real-time event
  emitToRole('DONOR_COORDINATOR', 'organ:registered', result);
  emitToRole('HOSPITAL_ADMIN', 'organ:registered', result);
  emitToRole('SYSTEM_ADMIN', 'organ:registered', result);

  res.status(201).json({ organ: result, match });
}

export async function listOrgans(req, res) {
  const organs = await Organ.find()
    .populate('donor_hospital_id', 'name location_lat location_lng address')
    .sort({ retrieval_timestamp: -1 });

  const formatted = organs.map((o) => {
    const obj = o.toObject();
    obj.id = obj._id.toString();
    obj.donor_hospital_name = obj.donor_hospital_id?.name || 'Donor Medical Center';
    return obj;
  });

  res.json({ organs: formatted });
}

export async function updateOrganStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const organ = await Organ.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).populate('donor_hospital_id');

  if (!organ) return res.status(404).json({ message: 'Organ not found.' });

  const result = organ.toObject();
  result.id = result._id.toString();

  emitToRole('DONOR_COORDINATOR', 'organ:status_updated', result);
  emitToRole('HOSPITAL_ADMIN', 'organ:status_updated', result);

  res.json({ organ: result });
}
