import cors from 'cors';
import express, { type Express } from 'express';
import { errorHandler } from './presentation/http/middlewares/error-handler.js';
import { notFoundHandler } from './presentation/http/middlewares/not-found-handler.js';
import { healthRouter } from './presentation/http/routes/health-routes.js';
import { env } from './shared/config/env.js';

export function createApp(): Express {
  const app = express();

  // Disable the "X-Powered-By" header for security reasons
  app.disable('x-powered-by');
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
