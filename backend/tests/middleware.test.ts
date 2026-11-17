import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authenticate, requireRole } from '../src/middleware/auth';
import { ApiError } from '../src/utils/errors';
import { env } from '../src/config/env';
import { AuthRequest } from '../src/types';

describe('Role-based middleware', () => {
  const mockResponse = () => ({}) as Response;
  const mockNext: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('authenticate should attach user from valid JWT', () => {
    const token = jwt.sign(
      { id: 'u1', email: 'admin@example.com', role: Role.SYSTEM_ADMIN },
      env.JWT_SECRET,
    );

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthRequest;

    authenticate(req, mockResponse(), mockNext);

    expect(req.user).toBeDefined();
    expect(req.user!.role).toBe(Role.SYSTEM_ADMIN);
    expect(mockNext).toHaveBeenCalled();
  });

  it('authenticate should reject missing token', () => {
    const req = { headers: {} } as AuthRequest;

    authenticate(req, mockResponse(), mockNext);

    const err = (mockNext as jest.Mock).mock.calls[0][0] as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(401);
  });

  it('requireRole should allow correct role', () => {
    const req = {
      user: { id: 'u1', email: 'a@b.com', role: Role.SYSTEM_ADMIN },
    } as AuthRequest;

    const guard = requireRole('SYSTEM_ADMIN');
    guard(req, mockResponse(), mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('requireRole should forbid incorrect role with 403', () => {
    const req = {
      user: { id: 'u1', email: 'a@b.com', role: Role.NORMAL_USER },
    } as AuthRequest;

    const guard = requireRole('SYSTEM_ADMIN');
    guard(req, mockResponse(), mockNext);

    const err = (mockNext as jest.Mock).mock.calls[0][0] as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(403);
  });

  it('requireRole should reject when no user attached', () => {
    const req = {} as AuthRequest;

    const guard = requireRole('SYSTEM_ADMIN');
    guard(req, mockResponse(), mockNext);

    const err = (mockNext as jest.Mock).mock.calls[0][0] as ApiError;
    expect(err.statusCode).toBe(401);
  });

  it('STORE_OWNER should not access admin routes', () => {
    const req = {
      user: { id: 'u1', email: 'owner@example.com', role: Role.STORE_OWNER },
    } as AuthRequest;

    const guard = requireRole('SYSTEM_ADMIN');
    guard(req, mockResponse(), mockNext);

    const err = (mockNext as jest.Mock).mock.calls[0][0] as ApiError;
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('permission');
  });
});
