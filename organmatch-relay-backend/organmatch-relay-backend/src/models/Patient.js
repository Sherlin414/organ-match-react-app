import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    organ_needed: { type: String, required: true },
    blood_type: { type: String, required: true },
    urgency_score: { type: Number, required: true },
    registered_hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    registered_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    waitlist_status: { type: String, default: 'Waiting', enum: ['Waiting', 'Matched', 'Transplanted'] },
    hla_markers: { type: [Number], default: [] },
    // Sensitive clinical data encrypted with AES-256-GCM
    sensitive_clinical_envelope: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'registered_at', updatedAt: 'updated_at' },
  }
);

patientSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
export default Patient;
