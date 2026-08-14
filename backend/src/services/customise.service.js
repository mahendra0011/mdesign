import sharp from 'sharp';
import { cloudinary } from '../config/cloudinary.js';
import { uploadToCloudinary } from './upload.service.js';
import { analyzeImage, extractJson, generateImage } from './modelRouter.service.js';
import { publishUserEvent } from '../config/redis.js';
import { badRequest } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export function extractPublicId(url) {
  if (!url) return null;
  const m = String(url).match(/\/(?:image\/upload|video\/upload)\/(?:v\d+\/)?([^/.]+)(?:\.[a-zA-Z0-9]+)?$/);
  return m ? m[1] : null;
}

export function extractFileName(url) {
  if (!url) return 'image';
  const m = String(url).match(/([^/]+)(?:\.(?:png|jpg|jpeg|webp|gif))$/i);
  return m ? m[1] : 'image';
}

const ELEMENT_DETECTION_PROMPT = `Detect all distinct UI elements (text, image, icon, button, logo, shape) in this UI design image.
Return ONLY JSON matching: {"elements":[{"type":"text|image|icon|button|logo|shape","bbox":{"x":number,"y":number,"width":number,"height":number}}]}
bbox values are percentages (0-100) of the image. Max 20 elements. No markdown, no explanation.`;

export async function detectElements(imageUrl, userId) {
  try {
    const { content } = await analyzeImage({ imageUrl, prompt: ELEMENT_DETECTION_PROMPT, userId });
    const parsed = extractJson(content);
    return (parsed?.elements || []).slice(0, 20).map((el, i) => ({
      elementId: `el_${i + 1}_${Date.now()}`,
      type: ['text', 'image', 'icon', 'button', 'logo', 'shape'].includes(el?.type) ? el.type : 'image',
      bbox: {
        x: Math.max(0, Math.min(100, Number(el?.bbox?.x) || 0)),
        y: Math.max(0, Math.min(100, Number(el?.bbox?.y) || 0)),
        width: Math.max(2, Math.min(100, Number(el?.bbox?.width) || 15)),
        height: Math.max(2, Math.min(100, Number(el?.bbox?.height) || 15)),
      },
      isPartOfBaseImage: true,
    }));
  } catch (err) {
    logger.warn(`element detection failed for ${imageUrl}: ${err.message}`);
    return [];
  }
}

export function renderComposite(session) {
  const W = session.canvasSize?.width || 1600;
  const H = session.canvasSize?.height || 1200;
  const baseUrl = session.background?.type === 'original' ? session.baseImageUrl : session.currentCompositeUrl;
  const basePublicId = extractPublicId(baseUrl);
  if (!basePublicId) return baseUrl;

  const sorted = [...session.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  const transformation = [];
  sorted.forEach((el, i) => {
    const publicId = extractPublicId(el.sourceUrl);
    if (!publicId) return;
    const x = Math.round(((el.bbox?.x || 0) / 100) * W);
    const y = Math.round(((el.bbox?.y || 0) / 100) * H);
    const width = Math.max(1, Math.round(((el.bbox?.width || 15) / 100) * W));
    const layer = {
      overlay: publicId,
      width,
      crop: 'scale',
      gravity: 'north_west',
      x,
      y,
    };
    if (i > 0) layer.flags = 'layer_apply';
    transformation.push(layer);
  });
  if (transformation.length === 0) return baseUrl;
  return cloudinary.url(basePublicId, { transformation });
}

export async function removeBackgroundViaCloudinary(imageUrl) {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) throw badRequest('Background removal requires a Cloudinary-hosted image');
  const result = await cloudinary.uploader.explicit(publicId, {
    type: 'upload',
    background_removal: 'cloudinary_ai',
  });
  const url = result.secure_url || result.derived?.[0]?.secure_url;
  if (!url) throw new Error('Background removal produced no asset');
  return url;
}

export function inpaintRegionViaCloudinary(imageUrl, bbox, canvasSize) {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return null;
  const W = canvasSize?.width || 1600;
  const H = canvasSize?.height || 1200;
  const x = Math.max(0, Math.round(((bbox?.x || 0) / 100) * W));
  const y = Math.max(0, Math.round(((bbox?.y || 0) / 100) * H));
  const width = Math.max(20, Math.round(((bbox?.width || 10) / 100) * W));
  const height = Math.max(20, Math.round(((bbox?.height || 10) / 100) * H));
  return cloudinary.url(publicId, {
    transformation: [
      {
        effect: 'gen_fill:prompt_seamless',
        width,
        height,
        x,
        y,
        gravity: 'north_west',
        crop: 'crop',
      },
    ],
  });
}

export async function buildSolidBackgroundUrl(color, canvasSize) {
  const W = canvasSize?.width || 1600;
  const H = canvasSize?.height || 1200;
  const buffer = await sharp({
    create: { width: W, height: H, channels: 4, background: color },
  })
    .png()
    .toBuffer();
  const result = await uploadToCloudinary(buffer, { folder: 'mdesign/composites' });
  return result.secure_url;
}

export function overlayImages(backgroundUrl, foregroundUrl) {
  const bg = extractPublicId(backgroundUrl);
  const fg = extractPublicId(foregroundUrl);
  if (!bg || !fg) return null;
  return cloudinary.url(bg, {
    transformation: [{ overlay: fg, gravity: 'center' }, { flags: 'layer_apply' }],
  });
}

export function buildGenerateElementPrompt(prompt, elementType) {
  const kind = elementType === 'image' ? 'full-bleed image' : elementType;
  return `${prompt}, UI design element (${kind}), isolated asset, transparent background, clean edges, high quality, no text artifacts`;
}

export async function runElementGeneration(session, { prompt, elementType }) {
  const { url: imageUrl } = await generateImage({
    prompt: buildGenerateElementPrompt(prompt, elementType),
    aspectRatio: '1:1',
    userId: session.user,
  });
  const result = await cloudinary.uploader.upload(imageUrl, { folder: 'mdesign/elements' });
  const element = {
    elementId: `el_ai_${Date.now()}`,
    type: elementType === 'image' ? 'image' : 'icon',
    sourceUrl: result.secure_url,
    bbox: { x: 40, y: 40, width: 20, height: 20 },
    zIndex: (session.elements.length + 1) * 10,
    isAiGenerated: true,
  };
  return element;
}

export async function emitSessionUpdate(session, action, payload = {}) {
  await publishUserEvent(session.user, 'customise:updated', {
    sessionId: session._id,
    action,
    ...payload,
  });
}

export async function recordHistory(session, action, payload) {
  session.history = session.history || [];
  session.history.push({ action, payload });
  if (session.history.length > 50) session.history = session.history.slice(-50);
  await session.save();
}