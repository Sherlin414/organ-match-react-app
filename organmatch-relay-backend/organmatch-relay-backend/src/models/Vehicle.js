import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    registration_number: { type: String, required: true },
    current_location_lat: { type: Number, default: 13.0827 },
    current_location_lng: { type: Number, default: 80.2707 },
    status: {
      type: String,
      default: 'Idle',
      enum: ['Idle', 'Assigned', 'InTransit', 'Completed'],
    },
    driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

vehicleSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
