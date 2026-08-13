import { Project } from '../models/Project.js';
import { ExportJob } from '../models/ExportJob.js';
import { createExportJob } from '../services/export.service.js';
import { enqueue } from '../services/queue.service.js';
import { badRequest } from '../utils/apiError.js';

export async function createExport(req, res) {
  const { target } = req.body || {};
  const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
  if (!project) throw badRequest('Project not found');
  if (project.status !== 'ready') throw badRequest('Project is not ready for export');

  const job = await createExportJob(project._id, req.user._id, target);
  await enqueue('export', { jobId: job._id });
  res.status(201).json({ success: true, job });
}

export async function getExportJob(req, res) {
  const job = await ExportJob.findOne({ _id: req.params.id, user: req.user._id });
  if (!job) throw badRequest('Export job not found');
  res.json({ success: true, job });
}

export async function getFigmaPayload(req, res) {
  const job = await ExportJob.findOne({ _id: req.params.id, user: req.user._id, target: 'figma' });
  if (!job) throw badRequest('Figma export job not found');
  if (!job.figmaPayload) throw badRequest('No figma payload yet — job may still be queued');
  res.json({ success: true, payload: job.figmaPayload, fileKey: job.figmaFileKey, url: job.outputUrl });
}