import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { customize, aiCustomize } from '../controllers/customization.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.patch('/:id/design', requireAuth, asyncHandler(customize));
router.post('/:id/customize-ai', requireAuth, asyncHandler(aiCustomize));
router.post('/:id/customize', requireAuth, asyncHandler(customize));

export default router;