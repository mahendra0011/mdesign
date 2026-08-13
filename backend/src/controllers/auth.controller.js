import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { User } from '../models/User.js';
import { OtpCode } from '../models/OtpCode.js';
import {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from '../services/token.service.js';
import { sendWelcomeEmail, sendOtpEmail } from '../services/email.service.js';
import { env } from '../config/env.js';
import { badRequest, unauthorized } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

const COOKIE_OPTS = (req) => ({
  httpOnly: true,
  secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/',
});

const hashOtp = (code) => crypto.createHash('sha256').update(String(code).trim()).digest('hex');

export async function sendOtp(req, res) {
  const { email, purpose = 'register' } = req.body || {};
  if (!email) throw badRequest('email is required');
  const normalized = String(email).toLowerCase();
  if (!['register', 'reset'].includes(purpose)) throw badRequest('purpose must be "register" or "reset"');

  const exists = await User.findOne({ email: normalized });
  if (purpose === 'register' && exists) throw badRequest('Email already registered');
  if (purpose === 'reset' && !exists) throw badRequest('No account found for this email');

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await OtpCode.deleteMany({ email: normalized, purpose });
  await OtpCode.create({
    email: normalized,
    purpose,
    codeHash: hashOtp(code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendOtpEmail(normalized, code).catch(() => {});
  logger.info(`OTP sent to ${normalized} (purpose: ${purpose})`);
  if (env.nodeEnv !== 'production') logger.info(`DEV OTP for ${normalized}: ${code}`);

  res.json({
    success: true,
    message: 'OTP sent',
    ...(env.nodeEnv !== 'production' ? { devOtp: code } : {}),
  });
}

export async function verifyOtp(req, res) {
  const { email, code, purpose = 'register' } = req.body || {};
  if (!email || !code) throw badRequest('email and code are required');

  const record = await OtpCode.findOne({
    email: String(email).toLowerCase(),
    purpose,
    consumed: false,
  });
  if (!record) throw badRequest('No active OTP for this email — request a new one');
  if (record.expiresAt < new Date()) throw badRequest('OTP expired — request a new one');
  if (record.attempts >= 5) throw badRequest('Too many attempts — request a new OTP');
  if (record.codeHash !== hashOtp(code)) {
    record.attempts += 1;
    await record.save();
    throw badRequest('Invalid OTP code');
  }

  record.consumed = true;
  record.verifiedAt = new Date();
  await record.save();
  res.json({ success: true, message: 'OTP verified' });
}

export async function register(req, res) {
  const { name, email, password, otp } = req.body || {};
  if (!name || !email || !password) throw badRequest('name, email and password are required');
  if (String(password).length < 8) throw badRequest('Password must be at least 8 characters');

  const normalized = String(email).toLowerCase();
  const exists = await User.findOne({ email: normalized });
  if (exists) throw badRequest('Email already registered');

  let emailVerified = false;
  if (otp) {
    const record = await OtpCode.findOne({ email: normalized, purpose: 'register', codeHash: hashOtp(otp) });
    if (!record || record.expiresAt < new Date()) {
      throw badRequest('Invalid or expired OTP — verify your email first');
    }
    const verified = record.consumed && record.verifiedAt;
    const freshVerify = verified && Date.now() - record.verifiedAt.getTime() < 10 * 60 * 1000;
    if (!freshVerify && record.attempts >= 5) {
      throw badRequest('Too many attempts — request a new OTP');
    }
    record.consumed = true;
    record.verifiedAt = new Date();
    await record.save();
    emailVerified = true;
  }

  const user = await User.create({
    name,
    email: normalized,
    password: await bcrypt.hash(password, 10),
    emailVerified,
  });

  if (user) sendWelcomeEmail(user).catch(() => {});
  return loginUser(req, res, user);
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) throw badRequest('email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user) throw unauthorized('Invalid credentials');
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw unauthorized('Invalid credentials');

  return loginUser(req, res, user);
}

async function loginUser(req, res, user) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = await issueRefreshToken(user._id);
  res.cookie('refresh_token', refreshToken, COOKIE_OPTS(req));
  res.json({
    success: true,
    accessToken,
    user: user.toSafeJSON(),
  });
}

export async function refresh(req, res) {
  const token = req.cookies?.refresh_token;
  if (!token) throw unauthorized('No refresh token');
  const { user, token: newToken } = await rotateRefreshToken(token);
  res.cookie('refresh_token', newToken, COOKIE_OPTS(req));
  res.json({ success: true, accessToken: signAccessToken(user) });
}

export async function logout(req, res) {
  const token = req.cookies?.refresh_token;
  if (token) await revokeRefreshToken(token);
  res.clearCookie('refresh_token', COOKIE_OPTS(req));
  res.status(204).end();
}

export async function me(req, res) {
  res.json({ success: true, user: req.user.toSafeJSON() });
}