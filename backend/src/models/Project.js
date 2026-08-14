import mongoose from 'mongoose';

const componentPlanSchema = new mongoose.Schema(
  {
    type: String,
    count: Number,
    notes: String,
  },
  { _id: false }
);

const animationPlanSchema = new mongoose.Schema(
  {
    trigger: String,
    type: String,
    target_component: String,
  },
  { _id: false }
);

const imageRequirementSchema = new mongoose.Schema(
  {
    id: String,
    purpose: String,
    description: String,
    aspect_ratio: String,
  },
  { _id: false }
);

const sectionPlanSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    order: Number,
    layout_intent: String,
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    components_in_frame: [String],
    components: [componentPlanSchema],
    animations: [animationPlanSchema],
    images_required: [imageRequirementSchema],
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    app_type: String,
    platform: String,
    style_mood: String,
    color_direction: String,
    font_direction: String,
    sections: [sectionPlanSchema],
  },
  { _id: false, minimize: false }
);

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    prompt: { type: String, required: true, trim: true, maxlength: 4000 },
    platform: { type: String, enum: ['web', 'android', 'windows'], default: 'web' },
    status: {
      type: String,
      enum: ['pending', 'planning', 'images_generating', 'designing', 'ready', 'failed'],
      default: 'pending',
      index: true,
    },
    errorMessage: { type: String },
    planStatus: {
      type: String,
      enum: ['none', 'awaiting_approval', 'approved'],
      default: 'none',
    },
    plan: { type: planSchema, default: null, minimize: false },
    progress: {
      totalImages: { type: Number, default: 0 },
      doneImages: { type: Number, default: 0 },
      failedImages: { type: Number, default: 0 },
    },
    latestVersionNo: { type: Number, default: 0 },
    favourite: { type: Boolean, default: false, index: true },
    modelOverrides: {
      textModel: { type: String, default: null },
      imageModel: { type: String, default: null },
      designModel: { type: String, default: null },
    },
  },
  { timestamps: true }
);

projectSchema.virtual('images', {
  ref: 'GeneratedImage',
  localField: '_id',
  foreignField: 'project',
});

projectSchema.set('toJSON', { virtuals: true });

export const Project = mongoose.model('Project', projectSchema);