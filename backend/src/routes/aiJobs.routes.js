import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { submitAiJobResult } from '../services/aiJobBridge.service.js';
import { ApiError } from '../utils/apiError.js';

const router = Router();

router.post(
  '/:jobId/result',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    if (!jobId || typeof jobId !== 'string' || jobId.length > 64) {
      throw new ApiError(400, 'Invalid job id');
    }
    const { success, content, imageDataUrl, width, height, error } = req.body || {};
    if (typeof success !== 'boolean') throw new ApiError(400, 'success is required');
    if (!success && typeof error !== 'string') throw new ApiError(400, 'error is required on failure');
    if (success && typeof content !== 'string' && typeof imageDataUrl !== 'string') {
      throw new ApiError(400, 'content or imageDataUrl is required on success');
    }
    await submitAiJobResult(jobId, { success, content, imageDataUrl, width, height, error });
    res.json({ ok: true });
  })
);

export default router;
