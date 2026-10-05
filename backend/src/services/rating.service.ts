import { Role } from '@prisma/client';
import ratingRepository from '../repositories/rating.repository';
import storeRepository from '../repositories/store.repository';
import userRepository from '../repositories/user.repository';
import { ApiError } from '../utils/errors';

export class RatingService {
  /**
   * Submit or update a rating. Uses upsert to enforce the one-rating-per-store
   * constraint — a user can only have one rating per store (unique constraint).
   */
  async submitRating(userId: string, storeId: string, rating: number) {
    // Validate store exists
    const store = await storeRepository.findById(storeId);
    if (!store) {
      throw ApiError.notFound('Store not found');
    }

    // Check if user already rated (for create vs update semantics)
    const existing = await ratingRepository.findByUserAndStore(userId, storeId);

    const saved = await ratingRepository.upsert({
      userId,
      storeId,
      rating,
    });

    return {
      id: saved.id,
      rating: saved.rating,
      isUpdate: !!existing,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  /** Store owner dashboard: store name, average rating, total ratings. */
  async getOwnerDashboard(ownerId: string) {
    const store = await storeRepository.findByOwnerId(ownerId);
    if (!store) {
      throw ApiError.notFound('No store assigned to your account');
    }

    const stats = await ratingRepository.getStoreStats(store.id);

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating: stats.average,
      totalRatings: stats.count,
    };
  }

  /** Store owner ratings list — users who rated the owner's store. */
  async getOwnerRatings(
    ownerId: string,
    params: { page: number; limit: number; sortBy: string; sortOrder: 'asc' | 'desc' },
  ) {
    const store = await storeRepository.findByOwnerId(ownerId);
    if (!store) {
      throw ApiError.notFound('No store assigned to your account');
    }

    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const { ratings, total } = await ratingRepository.findByStoreIdPaginated(
      store.id,
      skip,
      take,
      params.sortBy,
      params.sortOrder,
    );

    return {
      data: ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: r.user,
      })),
      meta: {
        currentPage: params.page,
        totalPages: Math.ceil(total / take) || 1,
        totalRecords: total,
      },
    };
  }
}

export default new RatingService();
