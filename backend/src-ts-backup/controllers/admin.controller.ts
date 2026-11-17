import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';
import adminService from '../services/admin.service';
import userService from '../services/user.service';
import storeService from '../services/store.service';
import { success } from '../utils/response';
import { ApiError } from '../utils/errors';

export class AdminController {
  async dashboard(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      return success(res, stats);
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, sortBy, sortOrder, search, role } = req.query as any;
      const result = await userService.getUsers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sortBy: sortBy || 'createdAt',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
        search: search || undefined,
        role: role ? (role as Role) : undefined,
      });
      return res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      return success(res, user, 201);
    } catch (err) {
      next(err);
    }
  }

  async getUserDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const details = await userService.getUserDetails(id);
      return success(res, details);
    } catch (err) {
      next(err);
    }
  }

  async getStores(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, sortBy, sortOrder, search, ownerId } = req.query as any;
      const result = await storeService.getAdminStores({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sortBy: sortBy || 'createdAt',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
        search: search || undefined,
        ownerId: ownerId || undefined,
      });
      return res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }

  async createStore(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const store = await storeService.createStore(req.body);
      return success(res, store, 201);
    } catch (err) {
      next(err);
    }
  }
}

export default new AdminController();
