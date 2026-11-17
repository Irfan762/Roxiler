import { Role } from '@prisma/client';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository';
import storeRepository from '../repositories/store.repository';
import ratingRepository from '../repositories/rating.repository';
import { ApiError } from '../utils/errors';

export class UserService {
  /** Admin creates a user (any role). */
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    address?: string;
    role: Role;
  }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      address: data.address,
      role: data.role,
    });

    return this.toSafeUser(user);
  }

  /** Get a single user's details (admin). Includes store info if STORE_OWNER. */
  async getUserDetails(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const safeUser = this.toSafeUser(user);

    // If store owner, fetch their store + rating
    let store = null;
    if (user.role === Role.STORE_OWNER) {
      const ownedStore = await storeRepository.findByOwnerId(id);
      if (ownedStore) {
        const stats = await ratingRepository.getStoreStats(ownedStore.id);
        store = {
          id: ownedStore.id,
          name: ownedStore.name,
          email: ownedStore.email,
          address: ownedStore.address,
          averageRating: stats.average,
          totalRatings: stats.count,
        };
      }
    }

    return { ...safeUser, store };
  }

  /** Paginated, filterable, sortable user listing (admin). */
  async getUsers(params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
    role?: Role;
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const where: Prisma.UserWhereInput = {};

    if (params.role) {
      where.role = params.role;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { address: { contains: params.search } },
      ];
    }

    const [users, total] = await Promise.all([
      userRepository.findMany({
        skip,
        take,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        where,
      }),
      userRepository.count(where),
    ]);

    return {
      data: users.map((u) => this.toSafeUser(u)),
      meta: {
        currentPage: params.page,
        totalPages: Math.ceil(total / take) || 1,
        totalRecords: total,
      },
    };
  }

  private toSafeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

export default new UserService();
