import { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

/** Global error handler. Converts known errors into consistent API responses. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => e.message).join('; ');
    return res.status(400).json({ success: false, message: messages });
  }

  // Our custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 — unique constraint violation
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') ?? 'field';
      return res
        .status(409)
        .json({ success: false, message: `A record with this ${target} already exists` });
    }
    // P2025 — record not found
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    return res.status(400).json({ success: false, message: 'Database constraint error' });
  }

  // Unknown errors — log and return generic 500
  logger.error('Unhandled error:', err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};

/** 404 handler for unmatched routes. */
export function notFoundHandler(_req: unknown, res: import('express').Response): void {
  res.status(404).json({ success: false, message: 'Route not found' });
}
