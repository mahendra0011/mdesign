import mongoose from 'mongoose';

const modelPreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    textModel: { type: String, default: 'default' },
    imageModel: { type: String, default: 'default' },
    designModel: { type: String, default: 'default' },
  },
  { timestamps: true }
);

export const ModelPreference = mongoose.model('ModelPreference', modelPreferenceSchema);