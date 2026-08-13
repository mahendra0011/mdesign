import axios from 'axios';
import { ModelCatalog } from '../models/ModelCatalog.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const FREE_COST_INPUT_CENTS = 50;
const FREE_COST_OUTPUT_CENTS = 200;

function classifyModel(id) {
  const lower = String(id || '').toLowerCase();
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

function badgeFromCost(cost) {
  if (!cost) return 'free';
  const input = Number.isFinite(cost.input) ? cost.input : 0;
  const output = Number.isFinite(cost.output) ? cost.output : 0;
  return input <= FREE_COST_INPUT_CENTS && output <= FREE_COST_OUTPUT_CENTS ? 'free' : 'quota';
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
  if (!env.ai.puter.enabled || !env.ai.puter.authToken) {
    logger.info('puter model sync skipped (disabled or no PUTER_AUTH_TOKEN)');
    return { count: 0, skipped: true };
  }
  const { init } = await import('@heyputer/puter.js/src/init.cjs');
  const puter = init(env.ai.puter.authToken);
  const models = await puter.ai.listModels();
  if (!Array.isArray(models)) return { count: 0 };

  let count = 0;
  for (const m of models) {
    const cost = m.cost || {};
    await upsertModel({
      modelId: m.id,
      name: m.name || m.id,
      provider: 'puter',
      category: classifyModel(m.id),
      badge: badgeFromCost(cost),
      source: 'puter',
      costInput: cost.input,
      costOutput: cost.output,
    });
    count += 1;
  }
  logger.info(`puter model sync: ${count} models upserted`);
  return { count };
}

export async function syncOpenRouterModels() {
  const response = await axios.get('https://openrouter.ai/api/v1/models', { timeout: 30000 });
  const models = response.data?.data;
  if (!Array.isArray(models)) return { count: 0 };

  let count = 0;
  for (const m of models) {
    const modelId = m.id;
    const badge = typeof modelId === 'string' && modelId.endsWith(':free') ? 'free' : 'quota';
    await upsertModel({
      modelId,
      name: m.name || modelId,
      provider: 'openrouter',
      category: classifyModel(modelId),
      badge,
      source: 'openrouter',
      costInput: m.pricing?.prompt,
      costOutput: m.pricing?.completion,
    });
    count += 1;
  }
  logger.info(`openrouter model sync: ${count} models upserted`);
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
  return results;
}