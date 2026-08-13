import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../services/upload.service.js';
import {
  createSession,
  getSession,
  addElement,
  removeElement,
  removeBackground,
  changeBackground,
  generateElement,
  saveAsTemplate,
} from '../controllers/customise.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/sessions', requireAuth, asyncHandler(createSession));
router.get('/sessions/:sessionId', requireAuth, asyncHandler(getSession));
router.post(
  '/sessions/:sessionId/add-element',
  requireAuth,
  upload.single('elementImage'),
  asyncHandler(addElement)
);
router.delete('/sessions/:sessionId/elements/:elementId', requireAuth, asyncHandler(removeElement));
router.post('/sessions/:sessionId/background/remove', requireAuth, asyncHandler(removeBackground));
router.post('/sessions/:sessionId/background/change', requireAuth, asyncHandler(changeBackground));
router.post('/sessions/:sessionId/generate-element', requireAuth, asyncHandler(generateElement));
router.post('/sessions/:sessionId/save-as-template', requireAuth, asyncHandler(saveAsTemplate));

export default router;