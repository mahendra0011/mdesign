import { upload, uploadToCloudinary } from '../services/upload.service.js';
import { UploadedDesign } from '../models/UploadedDesign.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { createPlanFromAnalysis, startImagePhase } from '../services/planning.service.js';
import { enqueue } from '../services/queue.service.js';
import { ApiError, badRequest } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw badRequest('file (image) is required');
  const result = await uploadToCloudinary(req.file.buffer, { folder: 'mdesign/uploads' });
  res.status(201).json({
    success: true,
    image: { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height },
  });
});

export const uploadDesign = asyncHandler(async (req, res) => {
  if (!req.file) throw badRequest('file (image) is required');
  const result = await uploadToCloudinary(req.file.buffer, { folder: 'mdesign/designs' });
  const design = await UploadedDesign.create({
    user: req.user._id,
    originalFileUrl: result.secure_url,
    cloudinaryPublicId: result.public_id,
    originalFileType: req.file.mimetype === 'application/pdf' ? 'pdf' : 'image',
    status: 'uploaded',
  });
  await enqueue('design-analysis', { uploadedDesignId: design._id });
  res.status(201).json({ success: true, message: 'File uploaded — analysis started', uploadedDesign: design });
});

export const listUploads = asyncHandler(async (req, res) => {
  const uploads = await UploadedDesign.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, uploads });
});

export const getUpload = asyncHandler(async (req, res) => {
  const design = await UploadedDesign.findOne({ _id: req.params.id, user: req.user._id });
  if (!design) throw new ApiError(404, 'Upload not found');
  res.json({ success: true, uploadedDesign: design });
});

export const createProjectFromUpload = asyncHandler(async (req, res) => {
  const design = await UploadedDesign.findOne({ _id: req.params.id, user: req.user._id });
  if (!design) throw new ApiError(404, 'Upload not found');
  if (design.status !== 'analyzed') throw badRequest('Design is not analyzed yet');
  const user = await User.findById(req.user._id);
  if (user.creditsRemaining <= 0) throw badRequest('No credits remaining');

  const { platform = 'web' } = req.body || {};
  const plan = createPlanFromAnalysis(design.analysisResult, {
    platform,
    prompt: 'Uploaded template — AI recreated design',
  });
  const project = await Project.create({
    user: user._id,
    prompt: 'Uploaded template — AI recreated design',
    platform,
    plan,
  });
  await Project.findByIdAndUpdate(project._id, { status: 'pending' });
  await User.decrementCredits(user._id);
  await startImagePhase(project._id, plan);
  await UploadedDesign.findByIdAndUpdate(design._id, { linkedProjectId: project._id });
  res.status(201).json({ success: true, project });
});

export { upload };