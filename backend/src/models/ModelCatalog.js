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

  // ── Anthropic · Claude ────────────────────────────────────────────────
  { modelId: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0005, avgLatencyMs: 800, badge: 'free', source: 'puter' },

  // ── Google · Gemini + Gemma ───────────────────────────────────────────
  { modelId: 'gemma-4', name: 'Gemma 4', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0001, avgLatencyMs: 600, badge: 'free', source: 'puter' },
  { modelId: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0001, avgLatencyMs: 600, badge: 'free', source: 'puter' },
  { modelId: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.0002, avgLatencyMs: 700, badge: 'free', source: 'puter' },

  // ── xAI · Grok ────────────────────────────────────────────────────────
  { modelId: 'grok-4-mini', name: 'Grok 4 Mini', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0003, avgLatencyMs: 900, badge: 'free', source: 'puter' },

  // ── Z.AI · GLM ────────────────────────────────────────────────────────
  { modelId: 'glm-4.7-flash', name: 'GLM 4.7 Flash', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.0002, avgLatencyMs: 600, badge: 'free', source: 'puter' },
  { modelId: 'glm-5-turbo', name: 'GLM 5 Turbo', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0003, avgLatencyMs: 800, badge: 'free', source: 'puter' },

  // ── Qwen · Alibaba ────────────────────────────────────────────────────
  { modelId: 'qwen3.6-27b', name: 'Qwen 3.6 27B', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0002, avgLatencyMs: 700, badge: 'free', source: 'puter' },
  { modelId: 'qwen3.7-flash', name: 'Qwen 3.7 Flash (vision)', provider: 'puter', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.0002, avgLatencyMs: 700, badge: 'free', source: 'puter' },

  // ── DeepSeek ──────────────────────────────────────────────────────────
  { modelId: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0003, avgLatencyMs: 900, badge: 'free', source: 'puter' },

  // ── Mistral ───────────────────────────────────────────────────────────
  { modelId: 'mistral-small', name: 'Mistral Small', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0003, avgLatencyMs: 800, badge: 'free', source: 'puter' },

  // ── Meta · Llama ──────────────────────────────────────────────────────
  { modelId: 'llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0002, avgLatencyMs: 700, badge: 'free', source: 'puter' },

  // ── Perplexity ────────────────────────────────────────────────────────
  { modelId: 'sonar', name: 'Perplexity Sonar', provider: 'puter', category: 'text', capabilities: ['chat', 'json', 'web'], costPerUnit: 0.0005, avgLatencyMs: 1000, badge: 'free', source: 'puter' },

  // ── Microsoft ─────────────────────────────────────────────────────────
  { modelId: 'microsoft/phi-4', name: 'Microsoft Phi-4', provider: 'puter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0.0002, avgLatencyMs: 700, badge: 'free', source: 'puter' },

  // ── OpenRouter gateway ────────────────────────────────────────────────
  { modelId: '*:free (openrouter)', name: 'OpenRouter :free models', provider: 'openrouter', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 1000, badge: 'free', source: 'openrouter' },

  // ── Text-to-Image ─────────────────────────────────────────────────────
  { modelId: 'puter-image-default', name: 'Puter default image', provider: 'puter', category: 'image', capabilities: ['txt2img'], costPerUnit: 0, avgLatencyMs: 5000, badge: 'free', source: 'puter' },
  { modelId: 'flux', name: 'FLUX', provider: 'puter', category: 'image', capabilities: ['txt2img'], costPerUnit: 0, avgLatencyMs: 4000, badge: 'free', source: 'puter' },
  { modelId: 'flux-schnell', name: 'FLUX Schnell', provider: 'puter', category: 'image', capabilities: ['txt2img'], costPerUnit: 0, avgLatencyMs: 2500, badge: 'free', source: 'puter' },
  { modelId: 'nano-banana', name: 'Nano Banana (Google)', provider: 'puter', category: 'image', capabilities: ['txt2img'], costPerUnit: 0, avgLatencyMs: 3500, badge: 'free', source: 'puter' },

  // ── OCR / Image-to-Text ───────────────────────────────────────────────
  { modelId: 'puter-img2txt', name: 'Puter OCR (img2txt)', provider: 'puter', category: 'ocr', capabilities: ['ocr', 'image-to-text'], costPerUnit: 0, avgLatencyMs: 1500, badge: 'free', source: 'puter' },

  // ── Text-to-Speech ────────────────────────────────────────────────────
  { modelId: 'puter-tts-default', name: 'Puter TTS default', provider: 'puter', category: 'speech', capabilities: ['tts'], costPerUnit: 0, avgLatencyMs: 800, badge: 'free', source: 'puter' },
  { modelId: 'google-tts', name: 'Google TTS', provider: 'puter', category: 'speech', capabilities: ['tts'], costPerUnit: 0, avgLatencyMs: 900, badge: 'free', source: 'puter' },

  // ── Speech-to-Text ────────────────────────────────────────────────────
  { modelId: 'whisper', name: 'Whisper (OpenAI)', provider: 'puter', category: 'speech', capabilities: ['stt', 'transcription', 'translation'], costPerUnit: 0, avgLatencyMs: 2000, badge: 'free', source: 'puter' },

  // ── Native (developer-key) models ─────────────────────────────────────
  { modelId: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (native)', provider: 'google', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0.0035, avgLatencyMs: 900, badge: 'quota', source: 'native' },
  { modelId: 'dall-e-3', name: 'DALL-E 3 (native)', provider: 'openai', category: 'image', capabilities: ['txt2img'], costPerUnit: 0.04, avgLatencyMs: 9000, badge: 'quota', source: 'native' },
  { modelId: 'flux-pro-1.1', name: 'FLUX Pro 1.1 (native)', provider: 'fal', category: 'image', capabilities: ['txt2img', 'style-ref'], costPerUnit: 0.05, avgLatencyMs: 6000, badge: 'quota', source: 'native' },
  { modelId: 'imagen-3', name: 'Imagen 3 (native)', provider: 'google', category: 'image', capabilities: ['txt2img'], costPerUnit: 0.04, avgLatencyMs: 8000, badge: 'quota', source: 'native' },
  { modelId: 'sdxl-turbo', name: 'SDXL Turbo (native)', provider: 'stability', category: 'image', capabilities: ['txt2img'], costPerUnit: 0.002, avgLatencyMs: 1500, badge: 'quota', source: 'native' },

  // ── Gemini · Google AI Studio (free tier) ─────────────────────────────
  { modelId: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'gemini', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0, avgLatencyMs: 900, badge: 'free', source: 'native' },
  { modelId: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'gemini', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0, avgLatencyMs: 900, badge: 'free', source: 'native' },
  { modelId: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', provider: 'gemini', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0, avgLatencyMs: 900, badge: 'free', source: 'native' },
  { modelId: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (preview)', provider: 'gemini', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0, avgLatencyMs: 1000, badge: 'free', source: 'native' },
  { modelId: 'gemini-flash-latest', name: 'Gemini Flash (latest)', provider: 'gemini', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0, avgLatencyMs: 800, badge: 'free', source: 'native' },
  { modelId: 'gemini-flash-lite-latest', name: 'Gemini Flash-Lite (latest)', provider: 'gemini', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0, avgLatencyMs: 650, badge: 'free', source: 'native' },
  { modelId: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', provider: 'gemini', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0, avgLatencyMs: 700, badge: 'free', source: 'native' },
  { modelId: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B A4B IT', provider: 'gemini', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 1100, badge: 'free', source: 'native' },
  { modelId: 'gemma-4-31b-it', name: 'Gemma 4 31B IT', provider: 'gemini', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 1200, badge: 'free', source: 'native' },

  // ── Groq · free tier ──────────────────────────────────────────────────
  { modelId: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', provider: 'groq', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 1100, badge: 'free', source: 'native' },
  { modelId: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', provider: 'groq', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 500, badge: 'free', source: 'native' },
  { modelId: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B Vision', provider: 'groq', category: 'multimodal', capabilities: ['chat', 'json', 'vision'], costPerUnit: 0, avgLatencyMs: 1400, badge: 'free', source: 'native' },
  { modelId: 'llama-3.2-3b-preview', name: 'Llama 3.2 3B', provider: 'groq', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 400, badge: 'free', source: 'native' },
  { modelId: 'llama-3.2-1b-preview', name: 'Llama 3.2 1B', provider: 'groq', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 300, badge: 'free', source: 'native' },
  { modelId: 'mistral-saba-24b', name: 'Mistral Saba 24B', provider: 'groq', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 900, badge: 'free', source: 'native' },
  { modelId: 'qwen-2.5-coder-32b', name: 'Qwen 2.5 Coder 32B', provider: 'groq', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 1000, badge: 'free', source: 'native' },
  { modelId: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B', provider: 'groq', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 1500, badge: 'free', source: 'native' },
  { modelId: 'qwen3-235b-a22b', name: 'Qwen3 235B A22B', provider: 'groq', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 1300, badge: 'free', source: 'native' },
  { modelId: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2 Instruct', provider: 'groq', category: 'text', capabilities: ['chat', 'json'], costPerUnit: 0, avgLatencyMs: 1200, badge: 'free', source: 'native' },
];

export async function seedModelCatalog() {
  for (const entry of DEFAULT_CATALOG) {
    await ModelCatalog.updateOne({ modelId: entry.modelId }, { $set: { ...entry, isActive: true } }, { upsert: true });
  }
  // deactivate paid puter models that are no longer in the free-only catalog
  const puterIds = DEFAULT_CATALOG.filter((e) => e.provider === 'puter').map((e) => e.modelId);
  await ModelCatalog.updateMany(
    { provider: 'puter', modelId: { $nin: puterIds } },
    { $set: { isActive: false } }
  );
  // deactivate native entries (gemini/groq/other) that are no longer in the catalog
  const nativeIds = DEFAULT_CATALOG.filter((e) => e.source === 'native').map((e) => e.modelId);
  await ModelCatalog.updateMany(
    { source: 'native', modelId: { $nin: nativeIds } },
    { $set: { isActive: false } }
  );
}