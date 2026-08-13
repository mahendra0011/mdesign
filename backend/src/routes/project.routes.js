import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { projectRateLimiter } from '../middleware/rateLimit.js';
import * as project from '../controllers/project.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);
router.post('/', projectRateLimiter, asyncHandler(project.createProject));
router.get('/', asyncHandler(project.listProjects));
router.get('/model-preferences', asyncHandler(project.getModelPreferences));
router.put('/model-preferences', asyncHandler(project.updateModelPreferences));
router.get('/:id', asyncHandler(project.getProject));
router.get('/:id/models', asyncHandler(project.getProjectModelOverrides));
router.put('/:id/models', asyncHandler(project.updateProjectModelOverrides));
router.post('/:id/regenerate-image', asyncHandler(project.regenerateImage));
router.post('/:id/replay', asyncHandler(project.replayDesign));
router.get('/:id/versions', asyncHandler(project.listVersions));
router.get('/:id/versions/:versionNo', asyncHandler(project.getVersion));
router.post('/:id/revert', asyncHandler(project.revertVersion));

export default router;