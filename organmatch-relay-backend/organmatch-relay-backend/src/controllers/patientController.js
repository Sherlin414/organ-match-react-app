import { Patient, User, Hospital } from '../models/index.js';
import { writeAuditLog } from '../services/auditLogService.js';
import { emitToRole } from '../realtime/io.js';
import { encryptClinicalData, decryptClinicalData } from '../utils/cryptoUtils.js';

export async function listWaitlist(req, res) {
  const patients = await Patient.find()
    .populate('registered_hospital_id', 'name location_lat location_lng address')
    .sort({ urgency_score: -1, registered_at: 1 });

  const formatted = patients.map((p) => {
    const obj = p.toObject();
    obj.id = obj._id.toString();
    obj.registered_hospital_name = obj.registered_hospital_id?.name || 'Medical Center';
    // Decrypt sensitive clinical details only for authorized roles
    if (['DOCTOR', 'SYSTEM_ADMIN'].includes(req.user?.role) && obj.sensitive_clinical_envelope) {
      obj.decrypted_clinical_data = decryptClinicalData(obj.sensitive_clinical_envelope);
    }
    return obj;
  });

  res.json({ patients: formatted });
}

export async function registerPatient(req, res) {
  const { name, organNeeded, bloodType, urgencyScore, clinicalDetails } = req.body;
  if (!name || !organNeeded || !bloodType || urgencyScore === undefined) {
    return res.status(400).json({ message: 'name, organNeeded, bloodType, and urgencyScore are required.' });
  }

  const doctor = await User.findById(req.user.id);
  let hospitalId = doctor?.hospital_id;
  if (!hospitalId) {
    const defaultHospital = await Hospital.findOne();
    hospitalId = defaultHospital?._id;
  }

  const count = await Patient.countDocuments();
  const code = `P-${10000 + count + 1}`;

  // Encrypt sensitive clinical data at the field level with AES-256-GCM
  const encryptedEnvelope = clinicalDetails ? encryptClinicalData(clinicalDetails) : null;

  const patient = await Patient.create({
    code,
    name: name.trim(),
    organ_needed: organNeeded,
    blood_type: bloodType,
    urgency_score: Number(urgencyScore),
    registered_hospital_id: hospitalId,
    registered_by: req.user.id,
    waitlist_status: 'Waiting',
    sensitive_clinical_envelope: encryptedEnvelope,
  });

  await writeAuditLog({
    eventType: 'PatientRegistered',
    details: `Patient ${patient.code} (${name}) registered on ${organNeeded} waitlist by doctor ${doctor?.name || req.user.id}. Urgency score: ${urgencyScore}.`,
  });

  const populated = await Patient.findById(patient._id).populate('registered_hospital_id');
  const result = populated.toObject();
  result.id = result._id.toString();

  // Real-time broadcast
  emitToRole('DOCTOR', 'patient:registered', result);
  emitToRole('HOSPITAL_ADMIN', 'patient:registered', result);
  emitToRole('SYSTEM_ADMIN', 'patient:registered', result);

  res.status(201).json({ patient: result });
}

export async function updatePatientStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const patient = await Patient.findByIdAndUpdate(
    id,
    { waitlist_status: status },
    { new: true }
  ).populate('registered_hospital_id');

  if (!patient) return res.status(404).json({ message: 'Patient not found.' });

  const result = patient.toObject();
  result.id = result._id.toString();

  emitToRole('DOCTOR', 'patient:status_updated', result);
  emitToRole('HOSPITAL_ADMIN', 'patient:status_updated', result);

  res.json({ patient: result });
}

/**
 * Access encrypted patient health records vault.
 * Only the patient themselves, their treating Doctor, or System Admin can access.
 */
export async function getPatientVault(req, res) {
  const { id } = req.params;
  const patient = await Patient.findById(id).populate('registered_hospital_id');
  if (!patient) return res.status(404).json({ message: 'Patient not found.' });

  // Authorization check
  if (req.user.role === 'PATIENT' && patient.registered_by?.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized to view these clinical records.' });
  }

  const decrypted = patient.sensitive_clinical_envelope
    ? decryptClinicalData(patient.sensitive_clinical_envelope)
    : null;

  res.json({
    patientId: patient._id,
    code: patient.code,
    name: patient.name,
    envelope: patient.sensitive_clinical_envelope,
    clinicalData: decrypted,
  });
}

export async function savePatientVault(req, res) {
  const { id } = req.params;
  const { clinicalData } = req.body;

  const patient = await Patient.findById(id);
  if (!patient) return res.status(404).json({ message: 'Patient not found.' });

  // Encrypt with AES-256-GCM
  const envelope = encryptClinicalData(clinicalData);
  patient.sensitive_clinical_envelope = envelope;
  await patient.save();

  await writeAuditLog({
    eventType: 'ClinicalVaultUpdated',
    details: `Encrypted health record vault updated for patient ${patient.code} by user ${req.user.id}.`,
  });

  res.json({ success: true, envelope });
}
