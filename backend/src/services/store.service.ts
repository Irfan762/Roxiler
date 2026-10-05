import { Prisma, Role } from '@prisma/client';
import storeRepository from '../repositories/store.repository';
import ratingRepository from '../repositories/rating.repository';
import userRepository from '../repositories/user.repository';
import { ApiError } from '../utils/errors';

export class StoreService {
  /** Admin creates a store, assigning to a STORE_OWNER. */
  async createStore(data: {
    name: string;
    email: string;
    address?: string;
    ownerId: string;
  }) {
    const owner = await userRepository.findById(data.ownerId);
    if (!owner) throw ApiError.notFound('Store owner not found');
    if (owner.role !== Role.STORE_OWNER)
      throw ApiError.badRequest('The selected user is not a store owner');

    const existingStore = await storeRepository.findByOwnerId(data.ownerId);
    if (existingStore)
      throw ApiError.conflict('This store owner already has a store assigned');

    return storeRepository.create(data);
  }

  /** Store listing for normal users — includes overall + user's own rating.
   *  Uses batch queries: 2 DB calls total regardless of page size (was N*2 before).
   */
  async getStores(params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
    userId?: string;
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    // MySQL utf8mb4_unicode_ci is case-insensitive — no 'insensitive' mode needed
    const where: Prisma.StoreWhereInput = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { address: { contains: params.search } },
      ];
    }

    const [stores, total] = await Promise.all([
      storeRepository.findMany({ skip, take, sortBy: params.sortBy, sortOrder: params.sortOrder, where }),
      storeRepository.count(where),
    ]);

    const storeIds = stores.map((s) => s.id);

    // 2 queries for all stores at once — no N+1
    const [statsMap, userRatingsMap] = await Promise.all([
      ratingRepository.getStatsBatch(storeIds),
      params.userId
        ? ratingRepository.getUserRatingsBatch(params.userId, storeIds)
        : Promise.resolve(new Map<string, number>()),
    ]);

    const storesWithRatings = stores.map((store) => {
      const stats = statsMap.get(store.id)!;
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        averageRating: stats.average,
        totalRatings: stats.count,
        userRating: userRatingsMap.get(store.id) ?? null,
      };
    });

    if (params.sortBy === 'rating') {
      storesWithRatings.sort((a, b) =>
        params.sortOrder === 'asc'
          ? a.averageRating - b.averageRating
          : b.averageRating - a.averageRating,
      );
    }

    return {
      data: storesWithRatings,
      meta: {
        currentPage: params.page,
        totalPages: Math.ceil(total / take) || 1,
        totalRecords: total,
      },
    };
  }

  /** Single store detail — 3 queries max. */
  async getStoreById(id: string, userId?: string) {
    const store = await storeRepository.findById(id);
    if (!store) throw ApiError.notFound('Store not found');

    const [stats, userRatingRow] = await Promise.all([
      ratingRepository.getStoreStats(id),
      userId ? ratingRepository.findUserRating(userId, id) : Promise.resolve(null),
    ]);

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.ownerId,
      averageRating: stats.average,
      totalRatings: stats.count,
      userRating: userRatingRow?.rating ?? null,
    };
  }

  /** Admin store listing — batch queries, no N+1. */
  async getAdminStores(params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
    ownerId?: string;
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const where: Prisma.StoreWhereInput = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { address: { contains: params.search } },
      ];
    }
    if (params.ownerId) where.ownerId = params.ownerId;

    const [stores, total] = await Promise.all([
      storeRepository.findMany({ skip, take, sortBy: params.sortBy, sortOrder: params.sortOrder, where }),
      storeRepository.count(where),
    ]);

    const storeIds = stores.map((s) => s.id);
    const statsMap = await ratingRepository.getStatsBatch(storeIds);

    const storesWithRatings = stores.map((store) => {
      const stats = statsMap.get(store.id)!;
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        owner: store.owner,
        averageRating: stats.average,
        totalRatings: stats.count,
      };
    });

    if (params.sortBy === 'rating') {
      storesWithRatings.sort((a, b) =>
        params.sortOrder === 'asc'
          ? a.averageRating - b.averageRating
          : b.averageRating - a.averageRating,
      );
    }

    return {
      data: storesWithRatings,
      meta: {
        currentPage: params.page,
        totalPages: Math.ceil(total / take) || 1,
        totalRecords: total,
      },
    };
  }
}

export default new StoreService();
