import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { ModelPreference } from '../models/ModelPreference.js';
import { enqueue } from './queue.service.js';
import { publishSocketEvent } from '../config/redis.js';
import { ApiError, badRequest } from '../utils/apiError.js';

export async function startPipeline(user, { prompt, platform, models }) {
  const project = await Project.create({
    user: user._id,
    prompt: prompt.trim(),
    platform: platform || 'web',
  });

  if (models && typeof models === 'object') {
    const patch = {};
    const text = models.textModel || models.text;
    const image = models.imageModel || models.image;
    const design = models.designModel || models.design;
    if (text) patch.textModel = text;
    if (image) patch.imageModel = image;
    if (design) patch.designModel = design;
    if (Object.keys(patch).length) {
      await ModelPreference.findOneAndUpdate({ user: user._id }, patch, { upsert: true });
      await Project.findByIdAndUpdate(project._id, { modelOverrides: patch });
    }
  }

  if (user.creditsRemaining <= 0) throw badRequest('No credits remaining');
  await Project.findByIdAndUpdate(project._id, { status: 'pending' });
  await User.decrementCredits(user._id);

  await enqueue('planning', { projectId: project._id });
  return project;
}

export async function markProjectFailed(projectId, message) {
  await Project.findByIdAndUpdate(projectId, { status: 'failed', errorMessage: message });
  await publishSocketEvent(projectId, 'job_failed', { message });
}

export async function getProjectForUser(projectId, userId) {
  const project = await Project.findOne({ _id: projectId, user: userId });
  if (!project) throw new ApiError(404, 'Project not found');
  return project;
}