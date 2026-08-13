import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  upload,
  uploadImage,
  uploadDesign,
  listUploads,
  getUpload,
  createProjectFromUpload,
} from '../controllers/upload.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/', requireAuth, upload.single('file'), asyncHandler(uploadImage));
router.post('/design', requireAuth, upload.single('file'), asyncHandler(uploadDesign));
router.get('/', requireAuth, asyncHandler(listUploads));
router.get('/:id', requireAuth, asyncHandler(getUpload));
router.post('/:id/project', requireAuth, asyncHandler(createProjectFromUpload));

export default router;