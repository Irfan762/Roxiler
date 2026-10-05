import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { corsOptions } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/error';
import routes from './routes';

function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors(corsOptions));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(morgan('dev'));

  // API routes
  app.use('/api', routes);

  // 404 + error handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
