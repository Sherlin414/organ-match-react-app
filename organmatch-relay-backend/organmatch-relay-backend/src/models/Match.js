import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    organ_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organ', required: true },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    compatibility_score: { type: Number, default: 0 },
    viability_decay_cost: { type: Number, default: 0 },
    distance_km: { type: Number, default: 0 },
    status: {
      type: String,
      default: 'Proposed',
      enum: ['Proposed', 'Confirmed', 'Rejected', 'Rematched'],
    },
    confirmed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    confirmed_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

matchSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);
export default Match;
