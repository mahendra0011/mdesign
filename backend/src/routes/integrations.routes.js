import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as integrations from '../controllers/integrations.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/figma/connect', requireAuth, asyncHandler(integrations.figmaConnect));
router.get('/figma/status', requireAuth, asyncHandler(integrations.figmaStatus));
router.get('/figma/callback', asyncHandler(integrations.figmaCallback));

export default router;