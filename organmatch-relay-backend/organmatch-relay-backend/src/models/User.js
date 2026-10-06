import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: [
        'PATIENT',
        'DOCTOR',
        'HOSPITAL_ADMIN',
        'DONOR_COORDINATOR',
        'SYSTEM_ADMIN',
        'AMBULANCE',
        'POLICE',
      ],
    },
    contact_number: { type: String, default: null },
    hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null },
    license_number: { type: String, default: null },
    organization_name: { type: String, default: null },
    license_id: { type: String, default: null },
    station_name: { type: String, default: null },
    jurisdiction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Jurisdiction', default: null },
    organ_needed: { type: String, default: null },
    blood_type: { type: String, default: null },
    urgency_score: { type: Number, default: null },
    registered_hospital_name: { type: String, default: null },
    waitlist_status: { type: String, default: null },
    google_id: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.password_hash;
    return ret;
  },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
