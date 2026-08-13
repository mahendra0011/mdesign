import { ModelCatalog } from '../models/ModelCatalog.js';
import { ModelPreference } from '../models/ModelPreference.js';
import { syncModelCatalogs } from '../services/modelCatalogSync.service.js';
import { badRequest } from '../utils/apiError.js';

const CATEGORIES = ['text', 'image', 'design', 'multimodal', 'speech', 'video', 'ocr'];
const DEFAULT_PREFS = { textModel: 'default', imageModel: 'default', designModel: 'default' };

export async function listModels(req, res) {
  const { category } = req.query;
  const filter = { isActive: true };
  if (category) {
    if (!CATEGORIES.includes(category)) throw badRequest(`category must be one of ${CATEGORIES.join('|')}`);
    filter.category = category;
  }
  const models = await ModelCatalog.find(filter)
    .select('modelId name provider category capabilities costPerUnit costInput costOutput avgLatencyMs badge source isActive')
    .sort({ category: 1, costPerUnit: 1 });
  res.json({ success: true, models });
}

export async function syncModels(req, res) {
  const results = await syncModelCatalogs();
  res.json({ success: true, results });
}

export async function getModelPreferences(req, res) {
  const pref = await ModelPreference.findOne({ user: req.user._id });
  res.json({ success: true, preferences: pref || DEFAULT_PREFS });
}

export async function updateModelPreferences(req, res) {
  const { textModel, imageModel, designModel } = req.body || {};
  const patch = {};
  if (textModel !== undefined) patch.textModel = textModel;
  if (imageModel !== undefined) patch.imageModel = imageModel;
  if (designModel !== undefined) patch.designModel = designModel;
  if (!Object.keys(patch).length) throw badRequest('nothing to update');

  const provided = [textModel, imageModel, designModel].filter((m) => m && m !== 'default');
  if (provided.length) {
    const valid = await ModelCatalog.find({ modelId: { $in: provided } }).select('modelId');
    const validIds = new Set(valid.map((m) => m.modelId));
    for (const modelId of provided) {
      if (!validIds.has(modelId)) throw badRequest(`unknown model "${modelId}"`);
    }
  }

  await ModelPreference.findOneAndUpdate({ user: req.user._id }, patch, { upsert: true, new: true });
  res.json({ success: true, message: 'Model preferences updated' });
}