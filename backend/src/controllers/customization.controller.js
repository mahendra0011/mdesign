import { customizeProject, aiCustomizeProject } from '../services/customization.service.js';

export async function customize(req, res) {
  const { operations, patches } = req.body || {};
  const ops = operations ?? patches;
  const result = await customizeProject(req.params.id, req.user._id, ops);
  res.status(201).json({ success: true, ...result });
}

export async function aiCustomize(req, res) {
  const { instruction } = req.body || {};
  const result = await aiCustomizeProject(req.params.id, req.user._id, instruction);
  res.status(201).json({ success: true, ...result });
}