import { randomUUID } from 'node:crypto';
import { publishSocketEvent, publishUserEvent, redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const PENDING_PREFIX = 'mdesign:ai-job:';
const TIMEOUT_MS = 90000;

/**
 * Ask the user's browser to execute an AI call via Puter.js.
 * projectId -> emits to project:${projectId} room; otherwise userId -> user:${userId} room.
 * Blocks until submitAiJobResult() writes the result, or timeout.
 */
export async function requestAiJob({ projectId, userId, kind, payload, model }) {
  const jobId = randomUUID();
  if (projectId) {
    await publishSocketEvent(projectId, 'ai_job_request', { jobId, kind, payload, model });
  } else if (userId) {
    await publishUserEvent(userId, 'ai_job_request', { jobId, kind, payload, model });
  } else {
    throw new Error('requestAiJob requires projectId or userId');
  }

  const key = `${PENDING_PREFIX}${jobId}`;
  const result = await redis.blpop(key, Math.ceil(TIMEOUT_MS / 1000));
  if (!result) {
    const err = new Error('AI job timed out — is the browser tab open?');
    err.isTimeout = true;
    throw err;
  }
  const parsed = JSON.parse(result[1]);
  if (!parsed.success) {
    const err = new Error(parsed.error || 'AI job failed in browser');
    err.isBrowserError = true;
    throw err;
  }
  return parsed;
}

export async function submitAiJobResult(jobId, resultPayload) {
  const key = `${PENDING_PREFIX}${jobId}`;
  await redis.rpush(key, JSON.stringify(resultPayload));
  await redis.expire(key, 5);
  logger.info(`ai job ${jobId} result submitted: ${resultPayload.success ? 'success' : 'failure'}`);
}
