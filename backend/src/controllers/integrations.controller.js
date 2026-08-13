import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

const FIGMA_AUTH_URL = 'https://www.figma.com/oauth';
const FIGMA_TOKEN_URL = 'https://www.figma.com/api/oauth/token';

export async function figmaConnect(req, res) {
  if (!env.figma.clientId) throw new ApiError(503, 'Figma OAuth is not configured on the server');
  const params = new URLSearchParams({
    client_id: env.figma.clientId,
    redirect_uri: env.figma.redirectUri,
    response_type: 'code',
    scope: 'file_content:write',
    state: String(req.user._id),
  });
  res.json({ success: true, authUrl: `${FIGMA_AUTH_URL}?${params.toString()}` });
}

export async function figmaCallback(req, res) {
  const { code, state } = req.query;
  if (!code || !state) throw new ApiError(400, 'Missing code or state from Figma');
  if (!env.figma.clientId || !env.figma.clientSecret) {
    throw new ApiError(503, 'Figma OAuth is not configured on the server');
  }

  const params = new URLSearchParams({
    client_id: env.figma.clientId,
    client_secret: env.figma.clientSecret,
    redirect_uri: env.figma.redirectUri,
    code: String(code),
    grant_type: 'authorization_code',
  });
  const response = await fetch(FIGMA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(502, `Figma token exchange failed: ${text.slice(0, 200)}`);
  }
  const data = await response.json();

  await User.findByIdAndUpdate(state, {
    figmaAccessToken: data.access_token,
    figmaRefreshToken: data.refresh_token || null,
    figmaTokenUpdatedAt: new Date(),
  });

  res.redirect(`${env.clientUrl}?figma=connected`);
}

export async function figmaStatus(req, res) {
  const user = await User.findById(req.user._id).select('figmaAccessToken figmaTokenUpdatedAt');
  res.json({
    success: true,
    connected: Boolean(user?.figmaAccessToken),
    connectedAt: user?.figmaTokenUpdatedAt || null,
  });
}