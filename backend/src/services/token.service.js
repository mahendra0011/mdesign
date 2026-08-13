import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { unauthorized } from '../utils/apiError.js';

export function signAccessToken(userId) {
  return jwt.sign({}, env.jwt.accessSecret, {
    subject: String(userId),
    expiresIn: env.jwt.accessExpires,
  });
}

export function signRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

export async function issueRefreshToken(userId) {
  const token = signRefreshToken();
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.jwt.refreshExpires));
  await RefreshToken.create({ user: userId, token, expiresAt });
  return token;
}

export async function rotateRefreshToken(oldToken) {
  const stored = await RefreshToken.findOne({ token: oldToken });
  if (!stored || stored.revokedAt) throw unauthorized('Invalid refresh token');
  if (stored.expiresAt < new Date()) throw unauthorized('Refresh token expired');
  stored.revokedAt = new Date();
  await stored.save();
  const newToken = await issueRefreshToken(stored.user);
  return { user: stored.user, token: newToken };
}

export async function revokeRefreshToken(token) {
  await RefreshToken.updateOne({ token }, { revokedAt: new Date() });
}

function parseDurationToMs(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 1000 * 60 * 60 * 24 * 30;
  const value = Number.parseInt(match[1], 10);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return value * unit;
}