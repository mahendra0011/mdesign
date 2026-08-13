import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(_req, _res, next) {
  next(new ApiError(404, 'Route not found'));
}

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  if (status >= 500) logger.error(err);
  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Internal server error' : err.message,
    ...(err.details !== undefined ? { details: err.details } : {}),
  });
}