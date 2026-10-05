import cors from 'cors';
import { env } from '../config/env';

/** CORS configuration — allows only the configured frontend origin. */
export const corsOptions = {
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
