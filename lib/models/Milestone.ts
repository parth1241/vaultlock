import mongoose, { Schema, model, models } from 'mongoose';

const MilestoneSchema = new Schema({
  escrowId: { type: Schema.Types.ObjectId, ref: 'Escrow', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, required: true },
  order: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'released', 'disputed'],
    default: 'pending',
  },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  releasedAt: { type: Date },
  txHash: { type: String, default: '' },
  balanceId: { type: String, default: '' },
  freelancerNotes: { type: String, default: '' },
  clientFeedback: { type: String, default: '' },
}, { timestamps: true });

const Milestone = models.Milestone || model('Milestone', MilestoneSchema);

export default Milestone;
