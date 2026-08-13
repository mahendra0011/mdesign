import { Project } from '../models/Project.js';
import { DesignVersion } from '../models/DesignVersion.js';
import { applyOps, setPath } from '../utils/objectPath.js';
import { chatText, extractJson, resolveModelOverride } from './modelRouter.service.js';
import { publishSocketEvent } from '../config/redis.js';
import { ApiError, badRequest } from '../utils/apiError.js';

function findComponent(designJson, componentId) {
  for (const section of designJson.sections || []) {
    const component = (section.components || []).find((c) => c.id === componentId);
    if (component) return { section, component };
  }
  return null;
}

function applySemanticOp(designJson, op, index) {
  switch (op.op) {
    case 'update_text': {
      const found = findComponent(designJson, op.target);
      if (!found) throw new Error(`op ${index}: unknown component "${op.target}"`);
      found.component.props.text = String(op.value);
      break;
    }
    case 'update_token':
    case 'update_font': {
      const path = String(op.target).startsWith('tokens.') ? op.target : `tokens.${op.target}`;
      setPath(designJson, path, op.value);
      break;
    }
    case 'replace_component': {
      const found = findComponent(designJson, op.target);
      if (!found) throw new Error(`op ${index}: unknown component "${op.target}"`);
      const { value } = op;
      if (!value || typeof value !== 'object') throw new Error(`op ${index}: replace_component needs a value object`);
      Object.assign(found.component, value);
      break;
    }
    case 'reorder_section': {
      const name = String(op.target);
      const currentIndex = (designJson.sections || []).findIndex((s) => s.id === name);
      if (currentIndex === -1) throw new Error(`op ${index}: unknown section "${name}"`);
      const order = Number(op.new_order);
      if (!Number.isInteger(order) || order < 0) throw new Error(`op ${index}: new_order must be a non-negative integer`);
      const [section] = designJson.sections.splice(currentIndex, 1);
      designJson.sections.splice(Math.min(order, designJson.sections.length), 0, section);
      break;
    }
    default:
      applyOps(designJson, [op]);
  }
}

export async function revertVersion(projectId, userId, targetVersionNo) {
  await getVersionForUser(projectId, userId, targetVersionNo);
  const project = await Project.findOne({ _id: projectId, user: userId });
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.status !== 'ready') throw badRequest('Project is not ready for customization');
  const latest = await DesignVersion.findOne({ project: projectId }).sort({ versionNo: -1 }).lean();
  if (!latest) throw new ApiError(404, 'No design version found');
  if (latest.versionNo === targetVersionNo) return { version: latest, warnings: [], restored: false };

  const target = await DesignVersion.findOne({ project: projectId, versionNo: targetVersionNo }).lean();
  const designJson = structuredClone(target.designJson);
  const warnings = validateDesignLayout(designJson);

  const nextNo = project.latestVersionNo + 1;
  const version = await DesignVersion.create({
    project: projectId,
    versionNo: nextNo,
    createdBy: 'user_edit',
    parentVersion: targetVersionNo,
    designJson,
    patchOps: [{ op: 'restore_version', versionNo: targetVersionNo }],
  });
  await Project.findByIdAndUpdate(projectId, { latestVersionNo: nextNo });
  await publishSocketEvent(projectId, 'design_updated', { versionNo: nextNo, designJson, warnings });

  return { version, warnings, restored: true };
}

export function validateDesignLayout(designJson) {
  const warnings = [];
  const seen = new Set();
  for (const section of designJson.sections || []) {
    if (!section.id) warnings.push('section without id');
    for (const component of section.components || []) {
      if (!component.id) {
        warnings.push('component without id');
        continue;
      }
      if (seen.has(component.id)) warnings.push(`duplicate component id "${component.id}"`);
      seen.add(component.id);
    }
  }
  const tokens = designJson.tokens || {};
  const tokenColors = Object.values(tokens.colors || {});
  const hex = /^#[0-9a-f]{6}$/i;
  for (const value of tokenColors) {
    if (typeof value === 'string' && hex.test(value)) {
      const r = parseInt(value.slice(1, 3), 16);
      const g = parseInt(value.slice(3, 5), 16);
      const b = parseInt(value.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const text = tokens.colors?.text || '#111111';
      if (hex.test(text)) {
        const tr = parseInt(text.slice(1, 3), 16);
        const tg = parseInt(text.slice(3, 5), 16);
        const tb = parseInt(text.slice(5, 7), 16);
        const textLum = (0.299 * tr + 0.587 * tg + 0.114 * tb) / 255;
        if (Math.abs(luminance - textLum) < 0.12) {
          warnings.push(`low contrast: token ${value} vs text color ${text}`);
        }
      }
    }
  }
  return warnings;
}

export async function customizeProject(projectId, userId, ops, { notify = true } = {}) {
  if (!Array.isArray(ops) || ops.length === 0) throw badRequest('operations array required');

  const project = await Project.findOne({ _id: projectId, user: userId });
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.status !== 'ready') throw badRequest('Project is not ready for customization');

  const latest = await DesignVersion.findOne({ project: projectId }).sort({ versionNo: -1 }).lean();
  if (!latest) throw new ApiError(404, 'No design version found');

  const designJson = structuredClone(latest.designJson);
  try {
    ops.forEach((op, index) => applySemanticOp(designJson, op, index));
  } catch (err) {
    throw badRequest(`Invalid operation: ${err.message}`);
  }

  const warnings = validateDesignLayout(designJson);

  const nextNo = project.latestVersionNo + 1;
  const version = await DesignVersion.create({
    project: projectId,
    versionNo: nextNo,
    createdBy: 'user_edit',
    parentVersion: latest.versionNo,
    designJson,
    patchOps: ops,
  });
  await Project.findByIdAndUpdate(projectId, { latestVersionNo: nextNo });

  if (notify) {
    await publishSocketEvent(projectId, 'design_updated', {
      versionNo: nextNo,
      designJson,
      warnings,
    });
  }

  return { version, warnings };
}

const AI_CUSTOMIZE_PROMPT = `You are MDesign's customization engine. Analyze the design_json and the user's
instruction, then return ONLY {"operations":[...]}. Supported operation types:
- {"op":"update_text","target":"<component_id>","value":"<new text>"}
- {"op":"update_token","target":"tokens.colors.primary","value":"#hex"} (also fonts/radius/spacing paths)
- {"op":"update_font","target":"tokens.fonts.heading","value":"<font family>"}
- {"op":"replace_component","target":"<component_id>","value":{"type":"<type>","props":{},"style":{}}}
- {"op":"reorder_section","target":"<section_id>","new_order":<int>}
- JSON-patch style {"op":"replace|add|remove|append","path":"<dot path>","value":...}
Use real component/section ids from the design_json only. Return fewest operations that fulfill the intent.`;

export async function aiCustomizeProject(projectId, userId, instruction) {
  if (typeof instruction !== 'string' || !instruction.trim()) throw badRequest('instruction is required');

  const project = await Project.findOne({ _id: projectId, user: userId });
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.status !== 'ready') throw badRequest('Project is not ready for customization');

  const latest = await DesignVersion.findOne({ project: projectId }).sort({ versionNo: -1 }).lean();
  if (!latest) throw new ApiError(404, 'No design version found');

  let ops;
  try {
    const { content } = await chatText({
      kind: 'text',
      modelOverride: await resolveModelOverride(userId, 'text', projectId),
      system: AI_CUSTOMIZE_PROMPT,
      user: JSON.stringify({ instruction, design_json: latest.designJson }),
    });
    ops = extractJson(content).operations;
  } catch (err) {
    throw new ApiError(502, `AI customization failed: ${err.message}`);
  }
  if (!Array.isArray(ops) || ops.length === 0) throw new ApiError(502, 'AI produced no operations');

  return customizeProject(projectId, userId, ops);
}

export async function getVersionForUser(projectId, userId, versionNo) {
  const project = await Project.findOne({ _id: projectId, user: userId });
  if (!project) throw new ApiError(404, 'Project not found');
  const query = { project: projectId };
  if (versionNo) query.versionNo = versionNo;
  const version = await DesignVersion.findOne(query).sort({ versionNo: versionNo ? undefined : -1 });
  if (!version) throw new ApiError(404, 'Design version not found');
  return version;
}