/**
 * Runs before any test modules are loaded. Sets environment variables
 * so the env.ts config module doesn't throw at import time.
 */
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1d';
process.env.PORT = '4000';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';
