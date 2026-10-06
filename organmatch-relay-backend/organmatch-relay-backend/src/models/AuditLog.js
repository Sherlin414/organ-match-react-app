import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    related_match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null, index: true },
    event_type: { type: String, required: true },
    previous_hash: { type: String, required: true },
    current_hash: { type: String, required: true },
    details: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
  }
);

auditLogSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
