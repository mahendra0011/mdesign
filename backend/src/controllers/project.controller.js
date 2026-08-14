import { Project } from '../models/Project.js';
import { GeneratedImage } from '../models/GeneratedImage.js';
import { DesignVersion } from '../models/DesignVersion.js';
import { ModelPreference } from '../models/ModelPreference.js';
import { ModelCatalog } from '../models/ModelCatalog.js';
import { startPipeline, getProjectForUser } from '../services/orchestrator.service.js';
import { extractImageRequirements, startImagePhase } from '../services/planning.service.js';
import { streamDesignBuild } from '../services/animation.service.js';
import { revertVersion as revertVersionService } from '../services/customization.service.js';
import { publishSocketEvent } from '../config/redis.js';
import { enqueue } from '../services/queue.service.js';
import { badRequest, ApiError } from '../utils/apiError.js';

const OVERRIDE_KEYS = ['textModel', 'imageModel', 'designModel'];

export async function createProject(req, res) {
  const { prompt, platform, models } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) throw badRequest('prompt is required');
  const project = await startPipeline(req.user, { prompt, platform, models });
  res.status(201).json({ success: true, project });
}

export async function listProjects(req, res) {
  const { favourite } = req.query || {};
  const filter = { user: req.user._id };
  if (favourite === 'true') filter.favourite = true;
  const projects = await Project.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .select('-plan');
  res.json({ success: true, projects });
}

export async function toggleFavourite(req, res) {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    [{ $set: { favourite: { $not: '$favourite' } } }],
    { new: true }
  );
  if (!project) throw new ApiError(404, 'Project not found');
  res.json({ success: true, favourite: project.favourite });
}

export async function getProject(req, res) {
  const project = await getProjectForUser(req.params.id, req.user._id);
  const images = await GeneratedImage.find({ project: project._id }).sort({ index: 1 });
  const latestVersion = await DesignVersion.findOne({ project: project._id })
    .sort({ versionNo: -1 });
  res.json({ success: true, project: project.toJSON(), images, latestVersion });
}

export async function listVersions(req, res) {
  await getProjectForUser(req.params.id, req.user._id);
  const versions = await DesignVersion.find({ project: req.params.id })
    .sort({ versionNo: -1 })
    .select('versionNo createdBy parentVersion createdAt patchOps');
  res.json({ success: true, versions });
}

export async function getVersion(req, res) {
  const project = await getProjectForUser(req.params.id, req.user._id);
  const versionNo = Number(req.params.versionNo);
  const version = await DesignVersion.findOne({ project: project._id, versionNo });
  if (!version) throw badRequest('Design version not found');
  res.json({ success: true, version });
}

export async function revertVersion(req, res) {
  const { versionNo } = req.body || {};
  if (typeof versionNo !== 'number' || versionNo < 1) throw badRequest('versionNo (number) is required');
  const result = await revertVersionService(req.params.id, req.user._id, versionNo);
  res.json({ success: true, ...result });
}

export async function regenerateImage(req, res) {
  const project = await getProjectForUser(req.params.id, req.user._id);
  const { index, prompt } = req.body || {};
  if (typeof index !== 'number' || index < 0) throw badRequest('index (number) is required');
  if (!project.plan) throw badRequest('Project has no plan to regenerate from');

  const requirements = extractImageRequirements(project.plan);
  const requirement = { ...requirements[index] };
  if (!requirement.section_id) throw badRequest(`no image requirement at index ${index}`);
  if (prompt && typeof prompt === 'string' && prompt.trim()) {
    requirement.prompt = prompt.trim();
  }

  const existing = await GeneratedImage.findOne({ project: project._id, index });
  if (!existing || existing.status === 'processing') throw badRequest('Image not eligible for regeneration');

  await GeneratedImage.findByIdAndUpdate(existing._id, {
    status: 'queued',
    url: null,
    width: null,
    height: null,
    error: null,
  });
  await enqueue('image-gen', {
    projectId: project._id,
    requirement,
    index,
    total: requirements.length,
    modelOverride: null,
  });
  res.json({ success: true, message: `regeneration for mockup ${index + 1}/${requirements.length} queued` });
}

export async function replayDesign(req, res) {
  const project = await getProjectForUser(req.params.id, req.user._id);
  if (project.status !== 'ready') throw badRequest('Only ready projects can be replayed');
  const latest = await DesignVersion.findOne({ project: project._id }).sort({ versionNo: -1 });
  if (!latest) throw badRequest('No design version to replay');

  const { pace } = req.body || {};
  const allowedPace = ['fast', 'normal', 'cinematic'].includes(pace) ? pace : null;
  await streamDesignBuild(project._id, latest.designJson, latest.versionNo, allowedPace);
  await publishSocketEvent(project._id, 'design_ready', {
    versionNo: latest.versionNo,
    designJson: latest.designJson,
  });
  res.json({ success: true, message: `design replay finished (version ${latest.versionNo})` });
}

export async function approvePlan(req, res) {
  const project = await getProjectForUser(req.params.id, req.user._id);
  if (!project.plan) throw badRequest('No plan to approve yet');
  if (project.planStatus !== 'awaiting_approval') throw badRequest('Plan is not awaiting approval');

  await Project.findByIdAndUpdate(project._id, { planStatus: 'approved' });
  await startImagePhase(project._id, project.plan);
  res.json({ success: true, message: 'Plan approved — starting mockup generation' });
}

export async function replan(req, res) {
  const { instruction } = req.body || {};
  if (typeof instruction !== 'string' || !instruction.trim()) throw badRequest('instruction is required');
  if (instruction.length > 2000) throw badRequest('instruction too long (max 2000 chars)');

  const project = await getProjectForUser(req.params.id, req.user._id);
  if (!project.plan) throw badRequest('No plan to revise yet');

  await Project.findByIdAndUpdate(project._id, { planStatus: 'awaiting_approval' });
  await enqueue('planning', { projectId: project._id, instruction: instruction.trim() });
  res.json({ success: true, message: 'Revising plan with your changes' });
}

export async function getModelPreferences(req, res) {
  const pref = await ModelPreference.findOne({ user: req.user._id });
  res.json({
    success: true,
    preferences: pref || { textModel: 'default', imageModel: 'default', designModel: 'default' },
  });
}

export async function updateModelPreferences(req, res) {
  const { textModel, imageModel, designModel } = req.body || {};
  const patch = {};
  if (textModel) patch.textModel = textModel;
  if (imageModel) patch.imageModel = imageModel;
  if (designModel) patch.designModel = designModel;
  if (!Object.keys(patch).length) throw badRequest('nothing to update');
  await ModelPreference.findOneAndUpdate({ user: req.user._id }, patch, { upsert: true, new: true });
  res.json({ success: true, message: 'Model preferences updated' });
}

export async function getProjectModelOverrides(req, res) {
  const project = await getProjectForUser(req.params.id, req.user._id);
  res.json({ success: true, overrides: project.modelOverrides || {} });
}

export async function updateProjectModelOverrides(req, res) {
  const project = await getProjectForUser(req.params.id, req.user._id);
  const body = req.body || {};
  const patch = {};
  for (const key of OVERRIDE_KEYS) {
    if (body[key] !== undefined) patch[`modelOverrides.${key}`] = body[key];
  }
  if (!Object.keys(patch).length) throw badRequest(`provide at least one of ${OVERRIDE_KEYS.join('|')}`);

  const provided = OVERRIDE_KEYS.map((k) => body[k]).filter((m) => m && m !== 'default' && m !== null);
  if (provided.length) {
    const valid = await ModelCatalog.find({ modelId: { $in: provided } }).select('modelId');
    const validIds = new Set(valid.map((m) => m.modelId));
    for (const modelId of provided) {
      if (!validIds.has(modelId)) throw badRequest(`unknown model "${modelId}"`);
    }
  }

  await Project.findByIdAndUpdate(project._id, patch);
  res.json({ success: true, message: 'Project model overrides updated' });
}