import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const BREVO_API = 'https://api.brevo.com/v3';

async function sendTransactionalEmail({ to, subject, html }) {
  if (!env.brevo.apiKey) {
    logger.warn('BREVO_API_KEY not set — skipping email');
    return null;
  }
  const response = await axios.post(
    `${BREVO_API}/smtp/email`,
    {
      sender: { email: env.brevo.fromEmail, name: env.brevo.fromName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    },
    { headers: { 'api-key': env.brevo.apiKey, 'content-type': 'application/json' } }
  );
  logger.info(`email sent to ${to}: ${subject}`);
  return response.data;
}

export async function sendWelcomeEmail(user) {
  if (!env.brevo.welcome) return null;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Welcome to MDesign, ${user.name || 'there'}!</h2>
      <p>Your AI design studio is ready. Drop a prompt and watch a full UI design build itself — section by section, image by image.</p>
      <p style="color: #888">You have <strong>${user.creditsRemaining}</strong> project credits on your ${user.planTier} plan.</p>
    </div>`;
  return sendTransactionalEmail({ to: user.email, subject: 'Welcome to MDesign 🎉', html });
}

export async function sendDesignReadyEmail(user, project) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Your design is ready ✨</h2>
      <p><em>"${project.prompt}"</em></p>
      <p>Log in to customize colors, fonts and components, then export to Figma, React or HTML.</p>
    </div>`;
  return sendTransactionalEmail({ to: user.email, subject: 'Your MDesign is ready', html });
}

export async function sendOtpEmail(to, code) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Verify your email ✉️</h2>
      <p>Your MDesign verification code is:</p>
      <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px; background: #f4f4f5; border-radius: 12px; text-align: center;">${code}</div>
      <p style="color: #888">This code is valid for 10 minutes. If you didn't request it, you can ignore this email.</p>
    </div>`;
  return sendTransactionalEmail({ to, subject: 'Your MDesign verification code', html });
}