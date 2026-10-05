import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/errors';

/** Validates req.body against a Zod schema. Throws ApiError on failure. */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join('; ');
      return next(ApiError.badRequest(messages));
    }
    req.body = result.data;
    next();
  };
}

/** Validates req.query against a Zod schema (non-strict for pagination). */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join('; ');
      return next(ApiError.badRequest(messages));
    }
    req.query = result.data as any;
    next();
  };
}

/** Validates req.params for a UUID id field. */
export function validateIdParam(key: string = 'id') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const id = req.params[key];
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return next(ApiError.badRequest(`Invalid ${key} parameter`));
    }
    next();
  };
}
