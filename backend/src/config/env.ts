import dotenv from 'dotenv';

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET', 'dev-secret-change-me'),
  JWT_EXPIRES_IN: required('JWT_EXPIRES_IN', '1d'),
  PORT: parseInt(required('PORT', '4000'), 10),
  FRONTEND_URL: required('FRONTEND_URL', 'http://localhost:3000'),
  NODE_ENV: required('NODE_ENV', 'development'),
};
