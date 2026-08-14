import axios from 'axios';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { requestAiJob } from './aiJobBridge.service.js';

const GEMINI_MODELS = new Set([
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3-flash-preview',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemma-4-26b-a4b-it',
  'gemma-4-31b-it',
]);

const GROQ_MODELS = new Set([
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'llama-3.2-90b-vision-preview',
  'llama-3.2-3b-preview',
  'llama-3.2-1b-preview',
  'mistral-saba-24b',
  'qwen-2.5-coder-32b',
  'deepseek-r1-distill-llama-70b',
  'qwen3-235b-a22b',
  'moonshotai/kimi-k2-instruct',
]);

// Cache of Puter model IDs (queried from the catalog on first use, refreshed on sync)
let puterModelCache = null;

async function isPuterModel(modelId) {
  if (!env.ai.puter.enabled || !modelId) return false;
  if (puterModelCache) return puterModelCache.has(modelId);
  const { ModelCatalog } = await import('../models/ModelCatalog.js');
  const docs = await ModelCatalog.find({ provider: 'puter', isActive: true }).select('modelId -_id').lean();
  puterModelCache = new Set(docs.map((d) => d.modelId));
  return puterModelCache.has(modelId);
}

// Invalidate the Puter model cache (call after catalog sync)
export function invalidatePuterCache() {
  puterModelCache = null;
}

async function pickConfig(kind, modelOverride) {
  const base = kind === 'image' ? env.ai.image : kind === 'design' ? env.ai.design : kind === 'vision' ? env.ai.vision : env.ai.text;
  const model = modelOverride || base.model;

  // Gemini free-tier models (Google AI Studio key)
  if (GEMINI_MODELS.has(model) && env.ai.gemini.apiKey) {
    const block = env.ai.gemini;
    const blockModel = kind === 'vision' ? block.visionModel : kind === 'design' ? block.designModel : block.textModel;
    return { provider: 'openai-compatible', baseUrl: block.baseUrl, apiKey: block.apiKey, model: blockModel };
  }

  // Groq free-tier models (Groq key)
  if (GROQ_MODELS.has(model) && env.ai.groq.apiKey) {
    const block = env.ai.groq;
    const blockModel = kind === 'vision' ? block.visionModel : kind === 'design' ? block.designModel : block.textModel;
    return { provider: 'openai-compatible', baseUrl: block.baseUrl, apiKey: block.apiKey, model: blockModel };
  }

  // Puter models (browser-side — user's own free quota via Puter bridge)
  if (await isPuterModel(model)) {
    return { provider: 'puter', model, enabled: env.ai.puter.enabled };
  }

  return { ...base, model };
}

export function extractJson(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new ApiError(502, 'Model returned no JSON object');
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new ApiError(502, 'Model returned invalid JSON');
  }
}

async function chatOpenAICompatible(config, system, userPrompt) {
  const response = await axios.post(
    `${config.baseUrl.replace(/\/$/, '')}/chat/completions`,
    {
      model: config.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    },
    { headers: openaiCompatHeaders(config) }
  );
  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new ApiError(502, 'Empty LLM response');
  return content;
}

function openaiCompatHeaders(config) {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
    ...(config.baseUrl.includes('openrouter.ai') ? { 'HTTP-Referer': env.clientUrl, 'X-Title': 'MDesign' } : {}),
  };
}

async function chatGemini(config, system, userPrompt) {
  const url = `${config.baseUrl.replace(/\/$/, '')}/models/${config.model}:generateContent`;
  const response = await axios.post(
    url,
    {
      contents: [
        {
          role: 'user',
          parts: [
            { text: system },
            { text: userPrompt },
          ],
        },
      ],
      generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
    },
    { headers: { 'x-goog-api-key': config.apiKey, 'Content-Type': 'application/json' } }
  );
  const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new ApiError(502, 'Empty Gemini response');
  return content;
}

export async function chatText({ kind = 'text', modelOverride, system, user, projectId, userId }) {
  const config = await pickConfig(kind, modelOverride);
  if (config.provider === 'puter') {
    const result = await requestAiJob({
      projectId,
      userId,
      kind: 'plan',
      payload: { systemPrompt: system, userPrompt: user },
      model: config.model,
    });
    return { content: result.content, model: config.model };
  }
  if (!config.apiKey) throw new ApiError(500, `No API key configured for "${kind}" provider`);
  const content =
    config.provider === 'gemini'
      ? await chatGemini(config, system, user)
      : await chatOpenAICompatible(config, system, user);
  return { content, model: config.model };
}

const DEFAULT_IMAGE_SIZES = { '16:9': [1792, 1024], '4:3': [1344, 1024], '1:1': [1024, 1024] };

function sizeFor(aspectRatio) {
  const [w, h] = DEFAULT_IMAGE_SIZES[aspectRatio] || DEFAULT_IMAGE_SIZES['1:1'];
  return { width: w, height: h };
}

const imageAdapters = {
  'openai-compatible': {
    async generate(config, prompt, { negativePrompt: _negativePrompt, aspectRatio }) {
      const { width, height } = sizeFor(aspectRatio);
      const size = `${width}x${height}`;
      const response = await axios.post(
        `${config.baseUrl.replace(/\/$/, '')}/images/generations`,
        {
          model: config.model,
          prompt,
          n: 1,
          size,
          response_format: 'b64_json',
        },
        {
          headers: openaiCompatHeaders(config),
          timeout: 120000,
        }
      );
      const data = response.data?.data?.[0];
      if (!data) throw new ApiError(502, 'Image API returned no data');
      const url = data.url || (data.b64_json ? `data:image/png;base64,${data.b64_json}` : null);
      if (!url) throw new ApiError(502, 'Image API returned unsupported payload');
      return { url, width: data.width || width, height: data.height || height };
    },
  },
  stability: {
    async generate(config, prompt, { negativePrompt, seed }) {
      const response = await axios.post(
        `${config.baseUrl.replace(/\/$/, '')}/v1/generation/${config.model}`,
        {
          text_prompts: [
            { text: prompt, weight: 1 },
            ...(negativePrompt ? [{ text: negativePrompt, weight: -1 }] : []),
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          ...(Number.isInteger(seed) && seed >= 0 ? { seed } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }
      );
      const artifact = response.data?.artifacts?.[0];
      if (!artifact?.base64) throw new ApiError(502, 'Stability API returned no artifact');
      return { url: `data:image/png;base64,${artifact.base64}`, width: 1024, height: 1024 };
    },
  },
  fal: {
    async generate(config, prompt, { negativePrompt, seed }) {
      const model = config.model.replace(/^fal-ai\//, '');
      const response = await axios.post(
        `${config.baseUrl.replace(/\/$/, '')}/fal-ai/${model}`,
        {
          prompt,
          num_images: 1,
          sync_mode: true,
          ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
          ...(Number.isInteger(seed) && seed >= 0 ? { seed } : {}),
        },
        {
          headers: { Authorization: `Key ${config.apiKey}`, 'Content-Type': 'application/json' },
          timeout: 180000,
        }
      );
      const image = response.data?.images?.[0] || response.data?.data?.images?.[0];
      const url = image?.url || image?.highres_url;
      if (!url) throw new ApiError(502, 'FAL API returned no image url');
      return { url, width: image?.width || 1024, height: image?.height || 1024 };
    },
  },
};

const PREF_KEY = { image: 'imageModel', design: 'designModel', text: 'textModel' };

export async function resolveModelOverride(userId, kind, projectId) {
  if (!userId) return undefined;
  const key = PREF_KEY[kind] || 'textModel';

  // only accept overrides that exist in the catalog as active models
  // (paid OpenRouter models are deactivated and therefore ignored)
  const isUsable = async (modelId) => {
    if (!modelId || modelId === 'default') return false;
    const ModelCatalog = (await import('../models/ModelCatalog.js')).ModelCatalog;
    const found = await ModelCatalog.findOne({
      modelId,
      isActive: true,
      $or: [{ provider: { $ne: 'openrouter' } }, { badge: 'free' }],
    }).select('modelId');
    return !!found;
  };

  if (projectId) {
    const Project = (await import('../models/Project.js')).Project;
    const project = await Project.findById(projectId).select('modelOverrides').lean();
    const override = project?.modelOverrides?.[key];
    if (await isUsable(override)) return override;
  }

  const ModelPreference = (await import('../models/ModelPreference.js')).ModelPreference;
  const pref = await ModelPreference.findOne({ user: userId });
  if (!pref) return undefined;
  const value = pref[key];
  if (await isUsable(value)) return value;
  return undefined;
}

export async function generateImage({ modelOverride, prompt, negativePrompt, aspectRatio, seed, projectId, userId }) {
  const config = await pickConfig('image', modelOverride);
  if (config.provider === 'puter') {
    const result = await requestAiJob({
      projectId,
      userId,
      kind: 'image',
      payload: { prompt, negativePrompt, aspectRatio },
      model: config.model,
    });
    return { url: result.imageDataUrl, width: result.width || 1024, height: result.height || 1024, model: config.model };
  }
  if (!config.apiKey) throw new ApiError(500, 'No API key configured for image provider');
  const adapter = imageAdapters[config.provider] || imageAdapters['openai-compatible'];
  const result = await adapter.generate(config, prompt, { negativePrompt, aspectRatio, seed });
  return { ...result, model: config.model };
}

function splitDataUrl(imageUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(imageUrl || '');
  if (match) return { mimeType: match[1], base64: match[2] };
  return null;
}

async function visionOpenAICompatible(config, prompt, imageUrl) {
  const content = [
    { type: 'text', text: prompt },
    { type: 'image_url', image_url: { url: imageUrl } },
  ];
  const response = await axios.post(
    `${config.baseUrl.replace(/\/$/, '')}/chat/completions`,
    {
      model: config.model,
      messages: [{ role: 'user', content }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    },
    { headers: openaiCompatHeaders(config) }
  );
  const contentOut = response.data?.choices?.[0]?.message?.content;
  if (!contentOut) throw new ApiError(502, 'Empty vision response');
  return contentOut;
}

async function visionGemini(config, prompt, imageUrl) {
  const dataUrl = splitDataUrl(imageUrl);
  const parts = [{ text: prompt }];
  if (dataUrl) {
    parts.push({ inline_data: { mime_type: dataUrl.mimeType, data: dataUrl.base64 } });
  } else {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const base64 = Buffer.from(response.data).toString('base64');
    const mimeType = response.headers['content-type'] || 'image/png';
    parts.push({ inline_data: { mime_type: mimeType, data: base64 } });
  }
  const api = await axios.post(
    `${config.baseUrl.replace(/\/$/, '')}/models/${config.model}:generateContent`,
    { contents: [{ role: 'user', parts }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } },
    { headers: { 'x-goog-api-key': config.apiKey, 'Content-Type': 'application/json' } }
  );
  const text = api.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new ApiError(502, 'Empty Gemini vision response');
  return text;
}

async function visionPuter(config, prompt, imageUrl, projectId, userId) {
  const result = await requestAiJob({
    projectId,
    userId,
    kind: 'vision',
    payload: { prompt, imageUrl },
    model: config.model,
  });
  return result.content;
}

export async function analyzeImage({ imageUrl, prompt, modelOverride, projectId, userId }) {
  const config = await pickConfig('vision', modelOverride);
  if (config.provider === 'puter') {
    const content = await visionPuter(config, prompt, imageUrl, projectId, userId);
    return { content, model: config.model };
  }
  if (!config.apiKey) throw new ApiError(500, 'No API key configured for vision provider');
  const content =
    config.provider === 'gemini'
      ? await visionGemini(config, prompt, imageUrl)
      : await visionOpenAICompatible(config, prompt, imageUrl);
  return { content, model: config.model };
}