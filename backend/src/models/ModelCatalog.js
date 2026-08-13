import mongoose from 'mongoose';

const modelCatalogSchema = new mongoose.Schema(
  {
    modelId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    provider: { type: String, required: true },
    category: {
      type: String,
      enum: ['text', 'image', 'design', 'multimodal', 'speech', 'video', 'ocr'],
      required: true,
      index: true,
    },
    capabilities: { type: [String], default: [] },
    costPerUnit: { type: Number, default: 0 },
    costInput: { type: Number, default: 0 },
    costOutput: { type: Number, default: 0 },
    avgLatencyMs: { type: Number, default: 0 },
    badge: { type: String, enum: ['free', 'quota'], default: 'quota', index: true },
    source: { type: String, enum: ['native', 'puter', 'openrouter'], default: 'native', index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ModelCatalog = mongoose.model('ModelCatalog', modelCatalogSchema);

export const DEFAULT_CATALOG = [
  // ── OpenAI · text/chat ────────────────────────────────────────────────
  { modelId: 'gpt-5.4-nano', name: 'GPT-5.4 Nano', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.0001, avgLatencyMs: 500, badge: 'free', source: 'puter' },
  { modelId: 'gpt-5-nano', name: 'GPT-5 Nano (Puter default)', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0001, avgLatencyMs: 500, badge: 'free', source: 'puter' },
  { modelId: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.00015, avgLatencyMs: 700, badge: 'free', source: 'puter' },
  { modelId: 'gpt-5.1', name: 'GPT-5.1', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.008, avgLatencyMs: 1500, badge: 'quota', source: 'puter' },
  { modelId: 'gpt-5', name: 'GPT-5', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.01, avgLatencyMs: 2000, badge: 'quota', source: 'puter' },
  { modelId: 'gpt-4o', name: 'GPT-4o', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.005, avgLatencyMs: 1200, badge: 'quota', source: 'puter' },
  { modelId: 'o3-mini', name: 'O3 Mini', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.006, avgLatencyMs: 2500, badge: 'quota', source: 'puter' },

  // ── Anthropic · Claude ────────────────────────────────────────────────
  { modelId: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0005, avgLatencyMs: 800, badge: 'free', source: 'puter' },
  { modelId: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.003, avgLatencyMs: 1100, badge: 'quota', source: 'puter' },
  { modelId: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.005, avgLatencyMs: 1300, badge: 'quota', source: 'puter' },
  { modelId: 'claude-4.6-sonnet', name: 'Claude 4.6 Sonnet', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.008, avgLatencyMs: 1800, badge: 'quota', source: 'puter' },
  { modelId: 'claude-opus-4-5', name: 'Claude Opus 4.5', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.015, avgLatencyMs: 3000, badge: 'quota', source: 'puter' },

  // ── Google · Gemini + Gemma ───────────────────────────────────────────
  { modelId: 'gemma-4', name: 'Gemma 4', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0001, avgLatencyMs: 600, badge: 'free', source: 'puter' },
  { modelId: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0001, avgLatencyMs: 600, badge: 'free', source: 'puter' },
  { modelId: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.0002, avgLatencyMs: 700, badge: 'free', source: 'puter' },
  { modelId: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.006, avgLatencyMs: 1600, badge: 'quota', source: 'puter' },

  // ── xAI · Grok ────────────────────────────────────────────────────────
  { modelId: 'grok-4-mini', name: 'Grok 4 Mini', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0003, avgLatencyMs: 900, badge: 'free', source: 'puter' },
  { modelId: 'grok-4', name: 'Grok 4', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.007, avgLatencyMs: 1700, badge: 'quota', source: 'puter' },

  // ── Z.AI · GLM ────────────────────────────────────────────────────────
  { modelId: 'glm-4.7-flash', name: 'GLM 4.7 Flash', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.0002, avgLatencyMs: 600, badge: 'free', source: 'puter' },
  { modelId: 'glm-5-turbo', name: 'GLM 5 Turbo', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0003, avgLatencyMs: 800, badge: 'free', source: 'puter' },
  { modelId: 'glm-4.7', name: 'GLM 4.7', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.002, avgLatencyMs: 1000, badge: 'quota', source: 'puter' },
  { modelId: 'glm-5', name: 'GLM 5', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.003, avgLatencyMs: 1200, badge: 'quota', source: 'puter' },
  { modelId: 'glm-5.1', name: 'GLM 5.1', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.004, avgLatencyMs: 1400, badge: 'quota', source: 'puter' },
  { modelId: 'glm-5.2', name: 'GLM 5.2', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.005, avgLatencyMs: 1600, badge: 'quota', source: 'puter' },

  // ── Qwen · Alibaba ────────────────────────────────────────────────────
  { modelId: 'qwen3.6-27b', name: 'Qwen 3.6 27B', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0002, avgLatencyMs: 700, badge: 'free', source: 'puter' },
  { modelId: 'qwen3.7-flash', name: 'Qwen 3.7 Flash (vision)', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.0002, avgLatencyMs: 700, badge: 'free', source: 'puter' },
  { modelId: 'qwen3.8-max', name: 'Qwen 3.8 Max', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.004, avgLatencyMs: 1500, badge: 'quota', source: 'puter' },

  // ── DeepSeek ──────────────────────────────────────────────────────────
  { modelId: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0003, avgLatencyMs: 900, badge: 'free', source: 'puter' },
  { modelId: 'deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.004, avgLatencyMs: 2000, badge: 'quota', source: 'puter' },

  // ── Mistral ───────────────────────────────────────────────────────────
  { modelId: 'mistral-small', name: 'Mistral Small', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0003, avgLatencyMs: 800, badge: 'free', source: 'puter' },
  { modelId: 'mistral-large', name: 'Mistral Large', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.005, avgLatencyMs: 1500, badge: 'quota', source: 'puter' },

  // ── Meta · Llama ──────────────────────────────────────────────────────
  { modelId: 'llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0002, avgLatencyMs: 700, badge: 'free', source: 'puter' },
  { modelId: 'llama-3.1-70b-instruct', name: 'Llama 3.1 70B Instruct', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.003, avgLatencyMs: 1400, badge: 'quota', source: 'puter' },

  // ── Perplexity ────────────────────────────────────────────────────────
  { modelId: 'sonar', name: 'Perplexity Sonar', provider: 'puter', category: 'text', capabilities: ['chat', 'json', 'web'], costPerUnit: 0.0005, avgLatencyMs: 1000, badge: 'free', source: 'puter' },
  { modelId: 'sonar-pro', name: 'Perplexity Sonar Pro', provider: 'puter', category: 'text', capabilities: ['chat', 'json', 'web'], costPerUnit: 0.005, avgLatencyMs: 1800, badge: 'quota', source: 'puter' },

  // ── Microsoft ─────────────────────────────────────────────────────────
  { modelId: 'microsoft/phi-4', name: 'Microsoft Phi-4', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0002, avgLatencyMs: 700, badge: 'free', source: 'puter' },

  // ── OpenRouter gateway ────────────────────────────────────────────────
  { modelId: '*:free (openrouter)', name: 'OpenRouter :free models', provider: 'openrouter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 1000, badge: 'free', source: 'openrouter' },
  { modelId: 'openrouter (400+)', name: 'OpenRouter full catalog', provider: 'openrouter', category: 'text', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.005, avgLatencyMs: 1500, badge: 'quota', source: 'openrouter' },

  // ── Text-to-Image ─────────────────────────────────────────────────────
  { modelId: 'puter-image-default', name: 'Puter default image', provider: 'puter', category: 'image', capabilities: ['txt2img'], costPerUnit: 0, avgLatencyMs: 5000, badge: 'free', source: 'puter' },
  { modelId: 'flux', name: 'FLUX', provider: 'puter', category: 'image', capabilities: ['txt2img'], costPerUnit: 0, avgLatencyMs: 4000, badge: 'free', source: 'puter' },
  { modelId: 'flux-schnell', name: 'FLUX Schnell', provider: 'puter', category: 'image', capabilities: ['txt2img'], costPerUnit: 0, avgLatencyMs: 2500, badge: 'free', source: 'puter' },
  { modelId: 'nano-banana', name: 'Nano Banana (Google)', provider: 'puter', category: 'image', capabilities: ['txt2img'], costPerUnit: 0, avgLatencyMs: 3500, badge: 'free', source: 'puter' },
  { modelId: 'openai/gpt-image-2', name: 'OpenAI GPT Image 2', provider: 'puter', category: 'image', capabilities: ['txt2img'], costPerUnit: 0.02, avgLatencyMs: 10000, badge: 'quota', source: 'puter' },
  { modelId: 'google/gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image', provider: 'puter', category: 'image', capabilities: ['txt2img'], costPerUnit: 0.02, avgLatencyMs: 12000, badge: 'quota', source: 'puter' },
  { modelId: 'grok-image', name: 'Grok Image', provider: 'puter', category: 'image', capabilities: ['txt2img'], costPerUnit: 0.015, avgLatencyMs: 9000, badge: 'quota', source: 'puter' },

  // ── OCR / Image-to-Text ───────────────────────────────────────────────
  { modelId: 'puter-img2txt', name: 'Puter OCR (img2txt)', provider: 'puter', category: 'ocr', capabilities: ['ocr', 'image-to-text'], costPerUnit: 0, avgLatencyMs: 1500, badge: 'free', source: 'puter' },

  // ── Text-to-Speech ────────────────────────────────────────────────────
  { modelId: 'puter-tts-default', name: 'Puter TTS default', provider: 'puter', category: 'speech', capabilities: ['tts'], costPerUnit: 0, avgLatencyMs: 800, badge: 'free', source: 'puter' },
  { modelId: 'google-tts', name: 'Google TTS', provider: 'puter', category: 'speech', capabilities: ['tts'], costPerUnit: 0, avgLatencyMs: 900, badge: 'free', source: 'puter' },
  { modelId: 'openai-tts', name: 'OpenAI TTS', provider: 'puter', category: 'speech', capabilities: ['tts'], costPerUnit: 0.01, avgLatencyMs: 1200, badge: 'quota', source: 'puter' },
  { modelId: 'elevenlabs-tts', name: 'ElevenLabs TTS', provider: 'puter', category: 'speech', capabilities: ['tts'], costPerUnit: 0.02, avgLatencyMs: 1500, badge: 'quota', source: 'puter' },
  { modelId: 'grok-tts', name: 'Grok TTS', provider: 'puter', category: 'speech', capabilities: ['tts'], costPerUnit: 0.015, avgLatencyMs: 1400, badge: 'quota', source: 'puter' },

  // ── Speech-to-Text ────────────────────────────────────────────────────
  { modelId: 'whisper', name: 'Whisper (OpenAI)', provider: 'puter', category: 'speech', capabilities: ['stt', 'transcription', 'translation'], costPerUnit: 0, avgLatencyMs: 2000, badge: 'free', source: 'puter' },
  { modelId: 'grok-stt', name: 'Grok Speech-to-Text', provider: 'puter', category: 'speech', capabilities: ['stt'], costPerUnit: 0.012, avgLatencyMs: 2000, badge: 'quota', source: 'puter' },

  // ── Speech-to-Speech ──────────────────────────────────────────────────
  { modelId: 'elevenlabs-voice-changer', name: 'ElevenLabs Voice Changer', provider: 'puter', category: 'speech', capabilities: ['s2s', 'voice-changer'], costPerUnit: 0.02, avgLatencyMs: 2500, badge: 'quota', source: 'puter' },

  // ── Text-to-Video ─────────────────────────────────────────────────────
  { modelId: 'puter-video-default', name: 'Puter video default', provider: 'puter', category: 'video', capabilities: ['txt2vid'], costPerUnit: 0.05, avgLatencyMs: 60000, badge: 'quota', source: 'puter' },

  // ── Native (developer-key) models ─────────────────────────────────────
  { modelId: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (native)', provider: 'google', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.0035, avgLatencyMs: 900, badge: 'quota', source: 'native' },
  { modelId: 'dall-e-3', name: 'DALL-E 3 (native)', provider: 'openai', category: 'image', capabilities: ['txt2img'], costPerUnit: 0.04, avgLatencyMs: 9000, badge: 'quota', source: 'native' },
  { modelId: 'flux-pro-1.1', name: 'FLUX Pro 1.1 (native)', provider: 'fal', category: 'image', capabilities: ['txt2img', 'style-ref'], costPerUnit: 0.05, avgLatencyMs: 6000, badge: 'quota', source: 'native' },
  { modelId: 'imagen-3', name: 'Imagen 3 (native)', provider: 'google', category: 'image', capabilities: ['txt2img'], costPerUnit: 0.04, avgLatencyMs: 8000, badge: 'quota', source: 'native' },
  { modelId: 'sdxl-turbo', name: 'SDXL Turbo (native)', provider: 'stability', category: 'image', capabilities: ['txt2img'], costPerUnit: 0.002, avgLatencyMs: 1500, badge: 'quota', source: 'native' },
];

export async function seedModelCatalog() {
  for (const entry of DEFAULT_CATALOG) {
    await ModelCatalog.updateOne({ modelId: entry.modelId }, { $set: entry }, { upsert: true });
  }
}