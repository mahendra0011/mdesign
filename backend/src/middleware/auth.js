import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../utils/apiError.js';
import { User } from '../models/User.js';

async function loadUser(token) {
  let payload;
  try {
    payload = jwt.verify(token, env.jwt.accessSecret);
  } catch {
    throw unauthorized('Invalid or expired token');
  }
  const user = await User.findById(payload.sub).select('-password');
  if (!user) throw unauthorized('User no longer exists');
  return user;
}

export function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies && req.cookies.access_token) return req.cookies.access_token;
  return null;
}

export const requireAuth = async (req, _res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw unauthorized();
    req.user = await loadUser(token);
    next();
  } catch (err) {
    next(err);
  }
};

export async function authFromSocketHandshake(handshake) {
  const token = handshake.auth?.token || handshake.headers?.authorization?.replace('Bearer ', '');
  if (!token) throw unauthorized();
  const user = await loadUser(token);
  return { user, token };
}