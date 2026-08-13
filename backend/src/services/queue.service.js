import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const KEY = (name) => `mdesign:queue:${name}`;
const handlers = new Map();
const running = new Map();

export function registerQueue(name, handler, concurrency = 1) {
  handlers.set(name, { handler, concurrency });
}

export async function enqueue(name, payload, { delayMs = 0, attempts = 1, attemptsUsed = 0 } = {}) {
  const job = { payload, attempts, attemptsUsed, createdAt: Date.now() };
  if (delayMs > 0) {
    setTimeout(() => redis.lpush(KEY(name), JSON.stringify(job)).catch(() => {}), delayMs);
  } else {
    await redis.lpush(KEY(name), JSON.stringify(job));
  }
  return job;
}

async function pop(name) {
  const result = await redis.brpop(KEY(name), 5);
  if (!result) return null;
  return JSON.parse(result[1]);
}

async function runLoop(name, workerId) {
  while (running.get(name) === true) {
    try {
      const job = await pop(name);
      if (!job) continue;
      const { handler } = handlers.get(name) || {};
      if (!handler) {
        logger.warn(`no handler for queue ${name}, job dropped`);
        continue;
      }
      const { payload, attempts = 1 } = job;
      logger.info(`worker:${workerId} processing ${name} ${JSON.stringify(payload)?.slice(0, 200)}`);
      try {
        await handler(payload);
      } catch (err) {
        logger.error(`worker:${workerId} ${name} failed: ${err.message}`);
        if (attempts > 1) {
          const attemptsUsed = 1 + (job.attemptsUsed || 0);
          const delayMs = Math.min(2 ** attemptsUsed * 2000, 30000);
          await enqueue(name, payload, { attempts: attempts - 1, attemptsUsed, delayMs });
        } else {
          throw err;
        }
      }
    } catch (err) {
      logger.error(`worker loop ${name}:${workerId} error: ${err.message}`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

export function startWorkers() {
  for (const [name, { concurrency }] of handlers) {
    running.set(name, true);
    for (let i = 0; i < concurrency; i += 1) runLoop(name, i + 1);
    logger.info(`workers started for queue "${name}" x${concurrency}`);
  }
}

export function stopWorkers() {
  for (const name of handlers.keys()) running.set(name, false);
}