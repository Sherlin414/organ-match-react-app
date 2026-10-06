import mongoose from 'mongoose';

const routeJurisdictionSchema = new mongoose.Schema({
  jurisdiction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Jurisdiction', required: true },
  sequence_order: { type: Number, required: true },
  alert_sent_at: { type: Date, default: Date.now },
  exit_confirmed_at: { type: Date, default: null },
  congestion_flagged: { type: Boolean, default: false },
  congestion_details: { type: String, default: '' },
});

const routeSchema = new mongoose.Schema(
  {
    match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    vehicle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    from_hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    to_hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    estimated_travel_time_minutes: { type: Number, required: true },
    distance_km: { type: Number, default: 0 },
    viability_time_limit_minutes: { type: Number, required: true },
    waypoints: { type: [mongoose.Schema.Types.Mixed], default: [] },
    route_jurisdictions: { type: [routeJurisdictionSchema], default: [] },
    status: {
      type: String,
      default: 'Active',
      enum: ['Generated', 'Active', 'Completed', 'Cancelled'],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

routeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);
export default Route;
