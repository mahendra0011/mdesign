import http from 'node:http';
import { createApp } from './app.js';
import { connectMongo } from './config/mongo.js';
import { redis } from './config/redis.js';
import { env } from './config/env.js';
import { attachSocketGateway } from './sockets/index.js';
import { registerWorkers, startInProcessWorkers } from './jobs/registerWorkers.js';
import { seedModelCatalog } from './models/ModelCatalog.js';
import { logger } from './utils/logger.js';

async function main() {
  await connectMongo();
  await seedModelCatalog();
  await redis.ping();

  if (env.runWorkersInProcess) startInProcessWorkers();
  else registerWorkers();

  const app = createApp();
  const server = http.createServer(app);
  attachSocketGateway(server, { corsOrigin: env.clientUrl });

  server.listen(env.port, () => {
    logger.info(`MDesign API listening on :${env.port}`);
  });

  const shutdown = async () => {
    logger.info('shutting down...');
    server.close();
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
