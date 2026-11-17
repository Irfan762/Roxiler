import { Prisma, Role, User } from '@prisma/client';
import prisma from '../config/prisma';

export class UserRepository {
  /** Find a user by email, returns null if not found. */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /** Find a user by id. */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /** Create a new user with hashed password. */
  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    address?: string;
    role?: Role;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        address: data.address || null,
        role: data.role ?? Role.NORMAL_USER,
      },
    });
  }

  /** Update password hash by user id. */
  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /** Paginated user search with filtering and sorting. */
  async findMany(params: {
    skip: number;
    take: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    where: Prisma.UserWhereInput;
  }): Promise<User[]> {
    return prisma.user.findMany({
      where: params.where,
      orderBy: { [params.sortBy]: params.sortOrder },
      skip: params.skip,
      take: params.take,
    });
  }

  /** Count users matching a filter. */
  async count(where: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where });
  }

  /** Find users by role. */
  async findByRole(role: Role): Promise<User[]> {
    return prisma.user.findMany({ where: { role } });
  }

  /** Total count of all users. */
  async totalCount(): Promise<number> {
    return prisma.user.count();
  }
}

export default new UserRepository();
