import mongoose from 'mongoose';

const organSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    organ_type: { type: String, required: true },
    blood_type: { type: String, required: true },
    viability_window_minutes: { type: Number, required: true },
    retrieval_timestamp: { type: Date, default: Date.now },
    ischemic_clock_start: { type: Date, default: Date.now },
    status: {
      type: String,
      default: 'Available',
      enum: ['Available', 'Matched', 'InTransit', 'Delivered', 'Expired'],
    },
    donor_hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    registered_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hla_markers: { type: [Number], default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

organSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export const Organ = mongoose.models.Organ || mongoose.model('Organ', organSchema);
export default Organ;
