import { GeneratedImage } from '../models/GeneratedImage.js';
import { Project } from '../models/Project.js';
import { generateImage, resolveModelOverride } from './modelRouter.service.js';
import {
  buildSectionMockupPrompt,
  buildNegativePrompt,
  sanitizeMockupPrompt,
} from './mockupPrompt.service.js';
import { postprocessImage } from './postprocess.service.js';
import { uploadToCloudinary } from './upload.service.js';
import { publishSocketEvent, publishImageEvent } from '../config/redis.js';
import { enqueue } from './queue.service.js';
import { env } from '../config/env.js';
import { extractImageRequirements } from './planning.service.js';
import { logger } from '../utils/logger.js';

const POLICY_HINT = /policy|safety|inappropriate|harmful|blocked|moderation/i;
async function bumpProgress(projectId, { done = 0, failed = 0 }) {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { $inc: { 'progress.doneImages': done, 'progress.failedImages': failed } },
    { new: true }
  );
  if (project && project.progress.doneImages + project.progress.failedImages >= project.progress.totalImages) {
    const failedCount = project.progress.failedImages;
    logger.info(
      `all ${project.progress.totalImages} section mockups processed for project ${projectId}${failedCount ? ` (${failedCount} failed)` : ''} — triggering design-gen`
    );
    if (failedCount) {
      await publishSocketEvent(projectId, 'pipeline_notice', {
        message: `${failedCount} mockup${failedCount > 1 ? 's' : ''} failed — using placeholder`,
      });
    }
    await enqueue('design-gen', { projectId });
  }
}

async function chainNext(project, index, total) {
  if (env.imageGenMode !== 'sequential' || index >= total - 1) return;
  const requirements = extractImageRequirements(project.plan);
  const next = requirements[index + 1];
  if (!next) return;
  logger.info(`sequential mode — enqueueing next mockup ${index + 2}/${total}`);
  await enqueue('image-gen', {
    projectId: project._id,
    requirement: next,
    index: index + 1,
    total,
    modelOverride: null,
  });
}

export async function processImageJob({ projectId, requirement, index, total, modelOverride }) {
  const project = await Project.findById(projectId);
  if (!project || !project.plan) throw new Error(`project ${projectId} missing or plan absent`);

  const section = project.plan.sections?.find((s) => s.id === requirement.section_id) || {};
  const resolvedModel = modelOverride || (await resolveModelOverride(project.user, 'image', project._id));

  const existing = await GeneratedImage.findOne({ project: projectId, index });
  const retryCount = existing?.retryCount || 0;
  const imageDoc = await GeneratedImage.findOneAndUpdate(
    { project: projectId, index },
    {
      $set: {
        project: projectId,
        sectionId: requirement.section_id,
        index,
        status: 'processing',
        isFullSectionMockup: true,
        modelUsed: resolvedModel || 'default',
        retryCount,
      },
    },
    { upsert: true, new: true }
  );

  let mockupPrompt = buildSectionMockupPrompt({ plan: project.plan, section, requirement });

  logger.info(`generating full-section mockup ${index + 1}/${total} (${section.name || section.id})`);
  await publishSocketEvent(projectId, 'image_status', {
    index,
    total,
    status: 'processing',
    sectionId: requirement.section_id,
  });

  try {
    let generated;
    try {
      generated = await generateImage({
        modelOverride: resolvedModel,
        prompt: mockupPrompt,
        negativePrompt: buildNegativePrompt(),
        aspectRatio: requirement.aspect_ratio || '16:9',
        projectId,
      });
    } catch (err) {
      if (retryCount === 0 && POLICY_HINT.test(err.message || '')) {
        logger.warn(
          `content-policy rejection on mockup ${index + 1} — running prompt sanitizer and retrying once`
        );
        const sanitized = await sanitizeMockupPrompt(mockupPrompt, projectId);
        if (sanitized) {
          mockupPrompt = sanitized;
          generated = await generateImage({
            modelOverride: resolvedModel,
            prompt: mockupPrompt,
            negativePrompt: buildNegativePrompt(),
            aspectRatio: requirement.aspect_ratio || '16:9',
            projectId,
          });
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    let url = generated.url;
    if (url && url.startsWith('data:')) {
      const base64 = url.split(',')[1] || '';
      const uploaded = await uploadToCloudinary(Buffer.from(base64, 'base64'), { folder: 'mdesign/mockups' });
      url = uploaded.secure_url;
    }

    const processed = await postprocessImage(url, requirement.aspect_ratio || '16:9');

    await GeneratedImage.findByIdAndUpdate(imageDoc._id, {
      status: 'done',
      url: processed.url,
      width: processed.width || generated.width,
      height: processed.height || generated.height,
      promptUsed: mockupPrompt,
      modelUsed: generated.model,
      error: null,
    });
    await publishImageEvent(projectId, {
      index,
      total,
      status: 'done',
      url: processed.url,
      width: processed.width || generated.width,
      height: processed.height || generated.height,
      sectionId: requirement.section_id,
    });
    await bumpProgress(projectId, { done: 1 });
  } catch (err) {
    await GeneratedImage.findByIdAndUpdate(imageDoc._id, {
      status: 'failed',
      error: err.message,
      retryCount: retryCount + 1,
    });
    await publishImageEvent(projectId, {
      index,
      total,
      status: 'failed',
      sectionId: requirement.section_id,
      error: err.message,
    });
    await bumpProgress(projectId, { failed: 1 });
    logger.warn(
      `mockup ${index + 1}/${total} failed for project ${projectId} (retry ${retryCount + 1}): ${err.message}`
    );
  } finally {
    await chainNext(project, index, total);
  }
}