import dotenv from 'dotenv';

dotenv.config();

const num = (v, d) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

const bool = (v, d = false) => (v === undefined ? d : v === 'true' || v === '1');

export const env = {
  port: num(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/mdesign',
  mongoDnsServers: process.env.MONGO_DNS_SERVERS || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'noreply@mdesign.app',
    fromName: process.env.EMAIL_FROM_NAME || 'MDesign',
    welcome: bool(process.env.EMAIL_WELCOME, true),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  ai: {
    text: {
      provider: process.env.AI_TEXT_PROVIDER || 'openai-compatible',
      baseUrl: process.env.AI_TEXT_BASE_URL || 'https://api.openai.com/v1',
      apiKey: process.env.AI_TEXT_API_KEY || '',
      model: process.env.AI_TEXT_MODEL || 'gpt-4o-mini',
    },
    image: {
      provider: process.env.AI_IMAGE_PROVIDER || 'openai-compatible',
      baseUrl: process.env.AI_IMAGE_BASE_URL || 'https://api.openai.com/v1',
      apiKey: process.env.AI_IMAGE_API_KEY || '',
      model: process.env.AI_IMAGE_MODEL || 'dall-e-3',
      size: process.env.AI_IMAGE_SIZE || '1024x1024',
    },
    design: {
      provider: process.env.AI_DESIGN_PROVIDER || 'openai-compatible',
      baseUrl: process.env.AI_DESIGN_BASE_URL || 'https://api.openai.com/v1',
      apiKey: process.env.AI_DESIGN_API_KEY || '',
      model: process.env.AI_DESIGN_MODEL || 'gpt-4o',
    },
    vision: {
      provider: process.env.AI_VISION_PROVIDER || process.env.AI_DESIGN_PROVIDER || 'openai-compatible',
      baseUrl: process.env.AI_VISION_BASE_URL || process.env.AI_DESIGN_BASE_URL || 'https://api.openai.com/v1',
      apiKey: process.env.AI_VISION_API_KEY || process.env.AI_DESIGN_API_KEY || '',
      model: process.env.AI_VISION_MODEL || process.env.AI_DESIGN_MODEL || 'gpt-4o',
    },
    puter: {
      enabled: bool(process.env.PUTER_ENABLED, true),
      appId: process.env.PUTER_APP_ID || '',
      authToken: process.env.PUTER_AUTH_TOKEN || '',
      text: { model: process.env.PUTER_TEXT_MODEL || 'gpt-5.4-nano' },
      design: { model: process.env.PUTER_DESIGN_MODEL || 'gpt-5.4-nano' },
      vision: { model: process.env.PUTER_VISION_MODEL || 'gemini-3.6-flash' },
      image: { model: process.env.PUTER_IMAGE_MODEL || 'flux' },
    },
  },
  buildPace: ['fast', 'normal', 'cinematic'].includes(process.env.BUILD_PACE) ? process.env.BUILD_PACE : 'normal',
  imageConcurrency: num(process.env.IMAGE_CONCURRENCY, 3),
  imageMaxRetries: num(process.env.IMAGE_MAX_RETRIES, 2),
  imageGenMode: process.env.IMAGE_GEN_MODE === 'parallel' ? 'parallel' : 'sequential',
  imagePostprocess: bool(process.env.IMAGE_POSTPROCESS, true),
  planning: {
    maxSections: num(process.env.PLANNING_MAX_SECTIONS, 12),
    repairRetries: num(process.env.PLANNING_REPAIR_RETRIES, 2),
  },
  runWorkersInProcess: bool(process.env.RUN_WORKERS_IN_PROCESS, false),
  figmaAccessToken: process.env.FIGMA_ACCESS_TOKEN || '',
  figma: {
    clientId: process.env.FIGMA_CLIENT_ID || '',
    clientSecret: process.env.FIGMA_CLIENT_SECRET || '',
    redirectUri: process.env.FIGMA_REDIRECT_URI || 'http://localhost:5000/api/integrations/figma/callback',
  },
};