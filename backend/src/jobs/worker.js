import { connectMongo } from '../config/mongo.js';
import { redis } from '../config/redis.js';
import { registerWorkers, startInProcessWorkers } from './registerWorkers.js';
import { seedModelCatalog } from '../models/ModelCatalog.js';
import { logger } from '../utils/logger.js';

async function main() {
  await connectMongo();
  await seedModelCatalog();
  await redis.ping();
  registerWorkers();
  startInProcessWorkers();
  logger.info('MDesign worker pool started');

  const shutdown = async () => {
    logger.info('stopping workers...');
    await redis.quit().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  logger.error(`fatal: ${err.message}`);
  process.exit(1);
});