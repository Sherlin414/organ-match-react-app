import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location_lat: { type: Number, default: 13.0827 },
    location_lng: { type: Number, default: 80.2707 },
    type: { type: String, enum: ['donor', 'recipient', 'both'], default: 'both' },
    address: { type: String, default: '' },
    contact: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

hospitalSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
export default Hospital;
