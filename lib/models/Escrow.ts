import mongoose, { Schema, model, models } from 'mongoose';

const EscrowSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  clientId: { type: String, required: true, index: true },
  freelancerId: { type: String, default: '', index: true },
  escrowWallet: { type: String, default: '' },
  escrowSecretEncrypted: { type: String, select: false },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'XLM' },
  status: {
    type: String,
    enum: ['draft', 'active', 'in_progress', 'completed', 'disputed', 'cancelled'],
    default: 'draft',
  },
  freelancerEmail: { type: String, default: '' },
  inviteToken: { type: String, default: '' },
  inviteExpiresAt: { type: Date },
  txHash: { type: String, default: '' },
}, { timestamps: true });

const Escrow = models.Escrow || model('Escrow', EscrowSchema);

export default Escrow;
