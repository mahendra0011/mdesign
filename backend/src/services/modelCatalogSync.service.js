import axios from 'axios';
import { ModelCatalog } from '../models/ModelCatalog.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { invalidatePuterCache } from './modelRouter.service.js';

function classifyModel(id) {  const lower = String(id || '').toLowerCase();
  if (lower.includes('image') || lower.includes('img') || lower.includes('flux') || lower.includes('sdxl') || lower.includes('dall-e') || lower.includes('stable-diffusion')) {
    return 'image';
  }
  if (lower.includes('video') || lower.includes('veo') || lower.includes('sora')) return 'video';
  if (lower.includes('tts') || lower.includes('speech') || lower.includes('audio') || lower.includes('whisper') || lower.includes('voice')) {
    return 'speech';
  }
  if (lower.includes('ocr') || lower.includes('img2txt')) return 'ocr';
  if (
    lower.includes('gemini') ||
    lower.includes('gpt-4o') ||
    lower.includes('gpt-5.4') ||
    lower.includes('gpt-5-nano') ||
    lower.includes('claude-4') ||
    lower.includes('claude-opus') ||
    lower.includes('qwen2.5-vl') ||
    lower.includes('llava') ||
    lower.includes('vision')
  ) {
    return 'multimodal';
  }
  return 'text';
}

function capabilityFor(modelId) {
  const category = classifyModel(modelId);
  if (category === 'image') return ['txt2img'];
  if (category === 'ocr') return ['ocr', 'image-to-text'];
  if (category === 'speech') return ['tts', 'stt'];
  if (category === 'video') return ['txt2vid'];
  if (category === 'multimodal') return ['chat', 'json', 'vision'];
  return ['chat', 'json'];
}

async function upsertModel({ modelId, name, provider, category, badge, source, costInput, costOutput }) {
  await ModelCatalog.updateOne(
    { modelId },
    {
      $set: {
        modelId,
        name,
        provider,
        category,
        capabilities: capabilityFor(modelId),
        costInput: Number.isFinite(costInput) ? costInput : 0,
        costOutput: Number.isFinite(costOutput) ? costOutput : 0,
        badge,
        source,
        isActive: true,
      },
    },
    { upsert: true }
  );
}

export async function syncPuterModels() {
  if (!env.ai.puter.enabled) {
    logger.info('puter model sync skipped (disabled)');
    return { count: 0, skipped: true };
  }
  logger.info('puter model sync skipped (browser-side provider — catalog is static)');
  return { count: 0, skipped: true };
}

export async function syncOpenRouterModels() {
  const response = await axios.get('https://openrouter.ai/api/v1/models', { timeout: 30000 });
  const models = response.data?.data;
  if (!Array.isArray(models)) return { count: 0 };

  const isFree = (m) => {
    const id = String(m.id || '');
    const freePricing = Number(m.pricing?.prompt) === 0 && Number(m.pricing?.completion) === 0;
    return id.endsWith(':free') || freePricing;
  };

  const freeModels = models.filter(isFree);
  const freeIds = freeModels.map((m) => m.id);

  let count = 0;
  for (const m of freeModels) {
    const modelId = m.id;
    await upsertModel({
      modelId,
      name: m.name || modelId,
      provider: 'openrouter',
      category: classifyModel(modelId),
      badge: 'free',
      source: 'openrouter',
      costInput: m.pricing?.prompt,
      costOutput: m.pricing?.completion,
    });
    count += 1;
  }

  // deactivate paid OpenRouter models — only free ones are kept in the project
  const result = await ModelCatalog.updateMany(
    { provider: 'openrouter', modelId: { $nin: freeIds } },
    { $set: { isActive: false } }
  );
  logger.info(
    `openrouter model sync: ${count} free models upserted, ${result.modifiedCount} paid models deactivated`
  );
  return { count };
}

export async function syncModelCatalogs() {
  const results = {};
  for (const fn of [syncPuterModels, syncOpenRouterModels]) {
    try {
      const result = await fn();
      results[fn.name] = result;
    } catch (err) {
      logger.warn(`${fn.name} failed: ${err.message}`);
      results[fn.name] = { count: 0, error: err.message };
    }
  }
  invalidatePuterCache();
  return results;
}