import mongoose from 'mongoose';

const exportJobSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target: { type: String, enum: ['figma', 'react', 'html', 'svg', 'png'], required: true },
    status: { type: String, enum: ['queued', 'processing', 'done', 'failed'], default: 'queued' },
    output: { type: String }, // generated code/markup for html/react/svg/png targets
    outputUrl: String, // figma file url or hosted asset
    figmaFileKey: String,
    figmaPayload: { type: mongoose.Schema.Types.Mixed, default: null }, // node tree for the MDesign Figma plugin
    requiresPlugin: { type: Boolean, default: false },
    error: String,
  },
  { timestamps: true }
);

export const ExportJob = mongoose.model('ExportJob', exportJobSchema);