import mongoose from 'mongoose';

const uploadedDesignSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalFileUrl: { type: String, required: true },
    originalFileType: { type: String, enum: ['image', 'figma_export', 'pdf'], default: 'image' },
    cloudinaryPublicId: String,
    status: {
      type: String,
      enum: ['uploaded', 'analyzing', 'analyzed', 'failed'],
      default: 'uploaded',
      index: true,
    },
    analysisResult: { type: mongoose.Schema.Types.Mixed, default: null },
    analysisError: String,
    linkedProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  },
  { timestamps: true }
);

export const UploadedDesign = mongoose.model('UploadedDesign', uploadedDesignSchema);