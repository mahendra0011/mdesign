import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';
import { seedModelCatalog } from '../models/ModelCatalog.js';
import { syncModelCatalogs } from '../services/modelCatalogSync.service.js';
import { logger } from '../utils/logger.js';

const FALLBACK_DNS_SERVERS = ['8.8.8.8', '1.1.1.1'];

function configureMongoDns() {
  const configuredServers = (env.mongoDnsServers || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  let servers = null;
  if (configuredServers.length > 0) {
    servers = configuredServers;
  } else if (env.mongoUri.includes('+srv')) {
    servers = FALLBACK_DNS_SERVERS;
  }
  if (servers) {
    dns.setServers(servers);
    logger.info(`MongoDB DNS resolver set to: ${servers.join(', ')}`);
  }
}

export async function connectMongo() {
  mongoose.set('strictQuery', true);
  configureMongoDns();
  await mongoose.connect(env.mongoUri, { family: 4 });
  await seedModelCatalog();
  syncModelCatalogs()
    .then(() => logger.info('model catalog runtime sync complete'))
    .catch((err) => logger.warn(`model catalog runtime sync failed: ${err.message}`));
  logger.info(`MongoDB connected: ${env.mongoUri}`);
  return mongoose.connection;
}