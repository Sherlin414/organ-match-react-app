import mongoose from 'mongoose';

const jurisdictionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    control_room_contact: { type: String, default: '' },
    sequence_hint: { type: Number, default: 1 },
    lat: { type: Number, default: 13.07 },
    lng: { type: Number, default: 80.26 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

jurisdictionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export const Jurisdiction = mongoose.models.Jurisdiction || mongoose.model('Jurisdiction', jurisdictionSchema);
export default Jurisdiction;
