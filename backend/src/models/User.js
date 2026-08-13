import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    planTier: { type: String, enum: ['free', 'pro', 'team'], default: 'free' },
    creditsRemaining: { type: Number, default: 10 },
    emailVerified: { type: Boolean, default: false },
    figmaAccessToken: { type: String, default: null },
    figmaRefreshToken: { type: String, default: null },
    figmaTokenUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.statics.decrementCredits = async function decrementCredits(userId) {
  const user = await this.findByIdAndUpdate(
    userId,
    { $inc: { creditsRemaining: -1 } },
    { new: true }
  );
  if (!user) throw new Error('User not found');
  return user;
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    planTier: this.planTier,
    creditsRemaining: this.creditsRemaining,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);