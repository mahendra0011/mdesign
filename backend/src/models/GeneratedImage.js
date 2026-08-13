import mongoose from 'mongoose';

const generatedImageSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    sectionId: String,
    index: { type: Number, required: true },
    status: { type: String, enum: ['queued', 'processing', 'done', 'failed'], default: 'queued' },
    isFullSectionMockup: { type: Boolean, default: true },
    promptUsed: String,
    modelUsed: String,
    url: String,
    publicId: String,
    width: Number,
    height: Number,
    retryCount: { type: Number, default: 0 },
    error: String,
  },
  { timestamps: true }
);

export const GeneratedImage = mongoose.model('GeneratedImage', generatedImageSchema);