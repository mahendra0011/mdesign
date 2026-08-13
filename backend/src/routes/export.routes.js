import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as exportCtrl from '../controllers/export.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/:id', requireAuth, asyncHandler(exportCtrl.getExportJob));
router.get('/:id/figma-payload', requireAuth, asyncHandler(exportCtrl.getFigmaPayload));
router.post('/:id/export', requireAuth, asyncHandler(exportCtrl.createExport));

export default router;