import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer'], required: true },
  linkedWallet: { type: String, default: '' },
  avatarColor: { type: String, default: '#6366f1' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  rememberMe: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
  preferences: {
    emailOnMilestone: { type: Boolean, default: true },
    emailOnRelease: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
  },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;
