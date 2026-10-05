import { Prisma, Store, User } from '@prisma/client';
import prisma from '../config/prisma';

/** Store with included owner relation. */
export type StoreWithOwner = Store & {
  owner: { id: string; name: string; email: string };
};

export class StoreRepository {
  async findById(id: string): Promise<Store | null> {
    return prisma.store.findUnique({ where: { id } });
  }

  /** Find a store by its owner id. */
  async findByOwnerId(ownerId: string): Promise<Store | null> {
    return prisma.store.findFirst({ where: { ownerId } });
  }

  async create(data: {
    name: string;
    email: string;
    address?: string;
    ownerId: string;
  }): Promise<Store> {
    return prisma.store.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        address: data.address || null,
        ownerId: data.ownerId,
      },
    });
  }

  /** Paginated store search with filtering and sorting. */
  async findMany(params: {
    skip: number;
    take: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    where: Prisma.StoreWhereInput;
  }): Promise<StoreWithOwner[]> {
    const orderBy: Prisma.StoreOrderByWithRelationInput =
      params.sortBy === 'rating'
        ? { name: params.sortOrder }
        : { [params.sortBy]: params.sortOrder };

    return prisma.store.findMany({
      where: params.where,
      orderBy: orderBy ?? { name: params.sortOrder },
      skip: params.skip,
      take: params.take,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /** Count stores matching a filter. */
  async count(where: Prisma.StoreWhereInput): Promise<number> {
    return prisma.store.count({ where });
  }

  /** Total count of all stores. */
  async totalCount(): Promise<number> {
    return prisma.store.count();
  }
}

export default new StoreRepository();
