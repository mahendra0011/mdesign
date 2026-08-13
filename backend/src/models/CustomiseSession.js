import mongoose from 'mongoose';

const elementSchema = new mongoose.Schema(
  {
    elementId: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'icon', 'shape', 'logo', 'component', 'button'], required: true },
    sourceUrl: String,
    bbox: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: { type: Number, default: 15 },
      height: { type: Number, default: 15 },
    },
    zIndex: { type: Number, default: 0 },
    isAiGenerated: { type: Boolean, default: false },
    isPartOfBaseImage: { type: Boolean, default: false },
  },
  { _id: false }
);

const customiseSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    uploadedDesign: { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedDesign', index: true },
    baseImageUrl: { type: String, required: true },
    currentCompositeUrl: { type: String, required: true },
    canvasSize: { width: { type: Number, default: 1600 }, height: { type: Number, default: 1200 } },
    background: {
      type: { type: String, enum: ['original', 'removed', 'color', 'image'], default: 'original' },
      value: { type: String, default: null },
    },
    elements: { type: [elementSchema], default: [] },
    history: {
      type: [{ action: String, payload: mongoose.Schema.Types.Mixed, at: { type: Date, default: Date.now } }],
      default: [],
    },
    status: { type: String, enum: ['editing', 'saved'], default: 'editing' },
  },
  { timestamps: true }
);

export const CustomiseSession = mongoose.model('CustomiseSession', customiseSessionSchema);