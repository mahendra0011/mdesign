import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import customizationRoutes from './routes/customization.routes.js';
import exportRoutes from './routes/export.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import customiseRoutes from './routes/customise.routes.js';
import modelsRoutes from './routes/models.routes.js';
import integrationsRoutes from './routes/integrations.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test') app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ success: true, status: 'ok', uptime: process.uptime() }));
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/projects', customizationRoutes);
  app.use('/api/exports', exportRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/customise', customiseRoutes);
  app.use('/api/models', modelsRoutes);
  app.use('/api/integrations', integrationsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}