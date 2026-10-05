import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import ratingService from '../services/rating.service';
import { success } from '../utils/response';
import { ApiError } from '../utils/errors';

export class OwnerController {
  async dashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('Authentication required');
      const data = await ratingService.getOwnerDashboard(req.user.id);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  }

  async getRatings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('Authentication required');
      const { page, limit, sortBy, sortOrder } = req.query as any;
      const result = await ratingService.getOwnerRatings(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sortBy: sortBy || 'createdAt',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
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
}

export default new OwnerController();
