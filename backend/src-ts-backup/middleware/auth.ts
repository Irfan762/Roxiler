import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthRequest, JwtPayload } from '../types';
import { ApiError } from '../utils/errors';
import { error } from '../utils/response';

/**
 * Verifies the JWT access token from the Authorization header and attaches
 * the decoded payload to req.user. Does NOT check roles — use `requireRole`
 * after this for role-protected routes.
 */
export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw ApiError.unauthorized('Authentication token is required');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      throw ApiError.unauthorized('Authentication token is required');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid or expired token'));
      return;
    }
    next(err);
  }
}

/**
 * Role-based authorization middleware. Must be used after `authenticate`.
 * Never trusts frontend role information — only the JWT payload.
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw ApiError.forbidden('You do not have permission to access this resource');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// Convenience role guards
export const requireAdmin = [authenticate, requireRole('SYSTEM_ADMIN')];
export const requireUser = [authenticate, requireRole('NORMAL_USER')];
export const requireOwner = [authenticate, requireRole('STORE_OWNER')];
export const requireAnyAuth = [authenticate, requireRole('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER')];
