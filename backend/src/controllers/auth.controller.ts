import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import authService from '../services/auth.service';
import { success, error } from '../utils/response';
import { ApiError } from '../utils/errors';

export class AuthController {
  async signup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);
      return success(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('Authentication required');
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async logout(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Stateless JWT logout — client discards the token.
      // For production you could add a token blocklist (Redis).
      return success(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  /** Returns the currently authenticated user's info. */
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('Authentication required');
      return success(res, req.user);
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
