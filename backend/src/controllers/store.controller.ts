import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import storeService from '../services/store.service';
import ratingService from '../services/rating.service';
import { success } from '../utils/response';
import { ApiError } from '../utils/errors';

export class StoreController {
  /** List stores for normal users — includes overall + user's rating. */
  async getStores(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, sortBy, sortOrder, search } = req.query as any;
      const result = await storeService.getStores({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sortBy: sortBy || 'createdAt',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
        search: search || undefined,
        userId: req.user?.id,
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

  /** Get a single store. */
  async getStoreById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const store = await storeService.getStoreById(id, req.user?.id);
      return success(res, store);
    } catch (err) {
      next(err);
    }
  }

  /** Submit or update a rating (uses upsert under the hood). */
  async submitRating(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('Authentication required');
      const { id: storeId } = req.params;
      const { rating } = req.body;
      const result = await ratingService.submitRating(req.user.id, storeId, rating);
      return success(res, result, result.isUpdate ? 200 : 201);
    } catch (err) {
      next(err);
    }
  }

  /** Update an existing rating (same endpoint, explicit PUT). */
  async updateRating(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('Authentication required');
      const { id: storeId } = req.params;
      const { rating } = req.body;
      const result = await ratingService.submitRating(req.user.id, storeId, rating);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export default new StoreController();
