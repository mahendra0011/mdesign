import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as models from '../controllers/models.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(models.listModels));
router.get('/preferences', asyncHandler(models.getModelPreferences));
router.put('/preferences', asyncHandler(models.updateModelPreferences));
router.post('/sync', asyncHandler(models.syncModels));

export default router;