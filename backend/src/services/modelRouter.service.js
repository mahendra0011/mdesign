import axios from 'axios';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

function pickConfig(kind, modelOverride) {
  const base = kind === 'image' ? env.ai.image : kind === 'design' ? env.ai.design : kind === 'vision' ? env.ai.vision : env.ai.text;
  return { ...base, model: modelOverride || base.model };
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
    { headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' } }
  );
  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new ApiError(502, 'Empty LLM response');
  return content;
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

let puterRuntime = null;

async function getPuter() {
  if (puterRuntime) return puterRuntime;
  if (!env.ai.puter.enabled) throw new ApiError(500, 'Puter provider is disabled (PUTER_ENABLED=false)');
  if (!env.ai.puter.authToken) {
    throw new ApiError(
      500,
      'Puter provider requires PUTER_AUTH_TOKEN — create one at https://puter.com/dashboard'
    );
  }
  const { init } = await import('@heyputer/puter.js/src/init.cjs');
  puterRuntime = init(env.ai.puter.authToken);
  return puterRuntime;
}

function chatContentToString(content) {
  if (typeof content === 'string') return content;
  if (content && typeof content.toString === 'function') {
    const text = content.toString();
    if (text && text !== '[object Object]') return text;
  }
  if (content && typeof content === 'object') {
    const keys = ['text', 'content', 'message'];
    for (const key of keys) {
      if (typeof content[key] === 'string') return content[key];
    }
  }
  return null;
}

async function chatPuter(config, system, userPrompt) {
  const puter = await getPuter();
  const response = await puter.ai.chat(
    [
      { role: 'system', content: system },
      { role: 'user', content: userPrompt },
    ],
    { model: config.model }
  );
  const content =
    chatContentToString(response?.message?.content) ||
    chatContentToString(response?.content) ||
    chatContentToString(response?.text) ||
    chatContentToString(response);
  if (!content) throw new ApiError(502, 'Empty Puter chat response');
  return content;
}

export async function chatText({ kind = 'text', modelOverride, system, user }) {
  const config = pickConfig(kind, modelOverride);
  if (config.provider === 'puter') {
    const content = await chatPuter(config, system, user);
    return { content, model: config.model };
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
          headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
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
  puter: {
    async generate(config, prompt, { aspectRatio }) {
      const puter = await getPuter();
      const result = await puter.ai.txt2img(prompt, {
        model: config.model,
        ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}),
      });
      let buffer = null;
      if (result && typeof result.arrayBuffer === 'function') {
        buffer = Buffer.from(await result.arrayBuffer());
      } else if (result && typeof result.toBuffer === 'function') {
        buffer = await result.toBuffer();
      } else if (result && typeof result === 'object') {
        if (result.buffer instanceof ArrayBuffer) buffer = Buffer.from(result.buffer);
        else if (typeof result.source === 'string' && result.source.startsWith('data:')) {
          buffer = Buffer.from(result.source.split(',')[1] || '', 'base64');
        }
      }
      if (!buffer || buffer.length === 0) throw new ApiError(502, 'Puter txt2img returned no image data');
      const width = result?.width || 1024;
      const height = result?.height || 1024;
      return { url: `data:image/png;base64,${buffer.toString('base64')}`, width, height };
    },
  },
};

const PREF_KEY = { image: 'imageModel', design: 'designModel', text: 'textModel' };

export async function resolveModelOverride(userId, kind, projectId) {
  if (!userId) return undefined;
  const key = PREF_KEY[kind] || 'textModel';

  if (projectId) {
    const Project = (await import('../models/Project.js')).Project;
    const project = await Project.findById(projectId).select('modelOverrides').lean();
    const override = project?.modelOverrides?.[key];
    if (override && override !== 'default') return override;
  }

  const ModelPreference = (await import('../models/ModelPreference.js')).ModelPreference;
  const pref = await ModelPreference.findOne({ user: userId });
  if (!pref) return undefined;
  const value = pref[key];
  if (value && value !== 'default') return value;
  return undefined;
}

export async function generateImage({ modelOverride, prompt, negativePrompt, aspectRatio, seed }) {
  const config = pickConfig('image', modelOverride);
  if (config.provider === 'puter') {
    const result = await imageAdapters.puter.generate(config, prompt, { aspectRatio });
    return { ...result, model: config.model };
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
    { headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' } }
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

async function visionPuter(config, prompt, imageUrl) {
  const puter = await getPuter();
  const response = await puter.ai.chat(prompt, imageUrl, { model: config.model });
  const content = chatContentToString(response?.message?.content) || chatContentToString(response?.content) || chatContentToString(response);
  if (!content) throw new ApiError(502, 'Empty Puter vision response');
  return content;
}

export async function analyzeImage({ imageUrl, prompt, modelOverride }) {
  const config = pickConfig('vision', modelOverride);
  if (config.provider === 'puter') {
    const content = await visionPuter(config, prompt, imageUrl);
    return { content, model: config.model };
  }
  if (!config.apiKey) throw new ApiError(500, 'No API key configured for vision provider');
  const content =
    config.provider === 'gemini'
      ? await visionGemini(config, prompt, imageUrl)
      : await visionOpenAICompatible(config, prompt, imageUrl);
  return { content, model: config.model };
}