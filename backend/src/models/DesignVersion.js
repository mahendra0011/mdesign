import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    props: { type: mongoose.Schema.Types.Mixed, default: {} },
    style: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: String,
    name: String,
    components: [componentSchema],
  },
  { _id: false }
);

const designTreeSchema = new mongoose.Schema(
  {
    name: String,
    platform: String,
    colors: { type: mongoose.Schema.Types.Mixed, default: {} },
    fonts: { type: mongoose.Schema.Types.Mixed, default: {} },
    spacing: { type: mongoose.Schema.Types.Mixed, default: {} },
    tokens: { type: mongoose.Schema.Types.Mixed, default: {} },
    sections: [sectionSchema],
  },
  { _id: false, minimize: false }
);

const designVersionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    versionNo: { type: Number, required: true },
    createdBy: { type: String, enum: ['ai', 'user_edit'], required: true },
    parentVersion: { type: Number, default: null },
    designJson: { type: designTreeSchema, required: true, minimize: false },
    patchOps: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

designVersionSchema.index({ project: 1, versionNo: -1 });

export const DesignVersion = mongoose.model('DesignVersion', designVersionSchema);