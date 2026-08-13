import { UploadedDesign } from '../models/UploadedDesign.js';
import { analyzeImage, extractJson } from './modelRouter.service.js';
import { publishUserEvent } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const ANALYSIS_PROMPT = `You are MDesign's Visual Analysis Engine. You are given an image of a UI design/template.
Analyze it and output ONLY valid JSON matching this schema:
{
  "detectedSections": [
    { "name": string, "order": number, "components": string[], "layoutIntent": string, "colorsUsed": string[] }
  ],
  "colorPalette": string[],
  "fontGuess": string,
  "styleMood": string
}
Rules:
- No markdown, no explanation, only raw JSON.
- detectedSections: split the design into logical sections from top to bottom.
- components: every distinct UI element visible in that section (navbar, headline, buttons, cards, forms, images, footer).
- layoutIntent: one line describing the spatial arrangement of that section.`;

export function normalizeAnalysis(raw) {
  const fallback = { detectedSections: [], colorPalette: [], fontGuess: 'Inter', styleMood: 'modern' };
  if (!raw || typeof raw !== 'object') return fallback;
  return {
    detectedSections: Array.isArray(raw.detectedSections)
      ? raw.detectedSections.slice(0, 12).map((s, i) => ({
          name: s?.name || `Section ${i + 1}`,
          order: Number.isFinite(s?.order) ? s.order : i + 1,
          components: Array.isArray(s?.components) ? s.components.slice(0, 12).map(String) : [],
          layoutIntent: s?.layoutIntent || '',
          colorsUsed: Array.isArray(s?.colorsUsed) ? s.colorsUsed.slice(0, 8).map(String) : [],
        }))
      : [],
    colorPalette: Array.isArray(raw.colorPalette) ? raw.colorPalette.slice(0, 8).map(String) : [],
    fontGuess: raw.fontGuess || 'Inter',
    styleMood: raw.styleMood || 'modern',
  };
}

export async function processAnalysisJob({ uploadedDesignId }) {
  const design = await UploadedDesign.findById(uploadedDesignId);
  if (!design) throw new Error('Uploaded design not found');

  await UploadedDesign.findByIdAndUpdate(uploadedDesignId, { status: 'analyzing', analysisError: null });
  await publishUserEvent(design.user, 'upload:analysis_started', { uploadedDesignId });
  logger.info(`upload analysis started for ${uploadedDesignId}`);

  try {
    const { content } = await analyzeImage({
      imageUrl: design.originalFileUrl,
      prompt: ANALYSIS_PROMPT,
    });
    const analysisResult = normalizeAnalysis(extractJson(content));
    await UploadedDesign.findByIdAndUpdate(uploadedDesignId, { status: 'analyzed', analysisResult });
    await publishUserEvent(design.user, 'upload:analysis_done', { uploadedDesignId, analysisResult });
    logger.info(
      `upload ${uploadedDesignId} analyzed (${analysisResult.detectedSections.length} sections)`
    );
    return analysisResult;
  } catch (err) {
    await UploadedDesign.findByIdAndUpdate(uploadedDesignId, {
      status: 'failed',
      analysisError: err.message,
    });
    await publishUserEvent(design.user, 'upload:analysis_failed', {
      uploadedDesignId,
      error: err.message,
    });
    logger.warn(`upload analysis failed for ${uploadedDesignId}: ${err.message}`);
    throw err;
  }
}