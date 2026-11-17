import { Prisma, Rating } from '@prisma/client';
import prisma from '../config/prisma';

/** Rating with included user relation. */
export type RatingWithUser = Rating & {
  user: { id: string; name: string; email: string };
};

/** Per-store aggregated stats returned by bulk fetch. */
export interface StoreRatingStats {
  storeId: string;
  average: number;
  count: number;
}

export class RatingRepository {
  /** Find a single rating by user + store (unique pair). */
  async findByUserAndStore(userId: string, storeId: string): Promise<Rating | null> {
    return prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
  }

  /** Upsert — create or update in one call. */
  async upsert(data: { userId: string; storeId: string; rating: number }): Promise<Rating> {
    return prisma.rating.upsert({
      where: { userId_storeId: { userId: data.userId, storeId: data.storeId } },
      update: { rating: data.rating },
      create: data,
    });
  }

  /**
   * Batch fetch avg rating + count for multiple stores in ONE query.
   * Replaces the N individual aggregate() calls.
   */
  async getStatsBatch(storeIds: string[]): Promise<Map<string, StoreRatingStats>> {
    if (storeIds.length === 0) return new Map();

    const rows = await prisma.rating.groupBy({
      by: ['storeId'],
      where: { storeId: { in: storeIds } },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const map = new Map<string, StoreRatingStats>();
    for (const row of rows) {
      map.set(row.storeId, {
        storeId: row.storeId,
        average: row._avg.rating ? Math.round(row._avg.rating * 10) / 10 : 0,
        count: row._count.rating,
      });
    }
    // Fill zeroes for stores with no ratings
    for (const id of storeIds) {
      if (!map.has(id)) map.set(id, { storeId: id, average: 0, count: 0 });
    }
    return map;
  }

  /**
   * Batch fetch a user's own ratings for multiple stores in ONE query.
   * Returns a map of storeId → rating value.
   */
  async getUserRatingsBatch(userId: string, storeIds: string[]): Promise<Map<string, number>> {
    if (storeIds.length === 0) return new Map();

    const rows = await prisma.rating.findMany({
      where: { userId, storeId: { in: storeIds } },
      select: { storeId: true, rating: true },
    });

    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.storeId, row.rating);
    }
    return map;
  }

  /** Single store stats (still useful for single-store detail). */
  async getStoreStats(storeId: string): Promise<{ average: number; count: number }> {
    const result = await prisma.rating.aggregate({
      where: { storeId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      average: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0,
      count: result._count.rating,
    };
  }

  /** Find a user's rating for a specific store. */
  async findUserRating(userId: string, storeId: string): Promise<Rating | null> {
    return prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
  }

  /** Total number of ratings across all stores. */
  async totalCount(): Promise<number> {
    return prisma.rating.count();
  }

  /** Paginated ratings for a store with user info (for store owner). */
  async findByStoreIdPaginated(
    storeId: string,
    skip: number,
    take: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc',
  ): Promise<{ ratings: RatingWithUser[]; total: number }> {
    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where: { storeId },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { [sortBy]: sortOrder } as Prisma.RatingOrderByWithRelationInput,
        skip,
        take,
      }),
      prisma.rating.count({ where: { storeId } }),
    ]);

    return { ratings: ratings as RatingWithUser[], total };
  }
}

export default new RatingRepository();
