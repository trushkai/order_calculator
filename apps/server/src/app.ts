import express from 'express';
import cors from 'cors';
import { rootRouter } from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { config } from './config/index.js';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use('/api', rootRouter);
  app.use(errorMiddleware);

  return app;
};
