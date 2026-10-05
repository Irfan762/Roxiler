import { Role } from '@prisma/client';
import prisma from '../config/prisma';
import userRepository from '../repositories/user.repository';
import storeRepository from '../repositories/store.repository';
import ratingRepository from '../repositories/rating.repository';

export class AdminService {
  /** Dashboard statistics: total users, total stores, total ratings. */
  async getDashboardStats() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      userRepository.totalCount(),
      storeRepository.totalCount(),
      ratingRepository.totalCount(),
    ]);

    // Breakdown by role for richer dashboard
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    return {
      totalUsers,
      totalStores,
      totalRatings,
      usersByRole: usersByRole.map((g) => ({ role: g.role, count: g._count.role })),
    };
  }
}

export default new AdminService();
