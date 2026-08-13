import { Router } from 'express';
import { authRateLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';
import * as auth from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', authRateLimiter, asyncHandler(auth.register));
router.post('/login', authRateLimiter, asyncHandler(auth.login));
router.post('/refresh', authRateLimiter, asyncHandler(auth.refresh));
router.post('/logout', asyncHandler(auth.logout));
router.post('/send-otp', authRateLimiter, asyncHandler(auth.sendOtp));
router.post('/verify-otp', authRateLimiter, asyncHandler(auth.verifyOtp));
router.get('/me', requireAuth, asyncHandler(auth.me));

export default router;