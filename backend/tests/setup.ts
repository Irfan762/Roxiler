/**
 * Test setup — mocks the Prisma client and external dependencies so tests
 * run without a live database. All repository-level calls are mocked.
 */
import { Role } from '@prisma/client';

// In-memory user store for testing
type TestUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  address: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

type TestStore = {
  id: string;
  name: string;
  email: string;
  address: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

type TestRating = {
  id: string;
  userId: string;
  storeId: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
};

// Shared in-memory data stores (reset per test file via beforeEach in individual tests)
export const db = {
  users: [] as TestUser[],
  stores: [] as TestStore[],
  ratings: [] as TestRating[],
  reset() {
    this.users = [];
    this.stores = [];
    this.ratings = [];
  },
  uid: 0,
  nextId(prefix: string) {
    this.uid++;
    return `${prefix}-${this.uid}`;
  },
};

// Mock the prisma config module so all repository calls hit our in-memory db
jest.mock('../src/config/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn(({ where }: any) => {
          if (where.email) return db.users.find((u) => u.email === where.email) || null;
          if (where.id) return db.users.find((u) => u.id === where.id) || null;
          return null;
        }),
        findFirst: jest.fn(({ where }: any) => {
          if (where.role) return db.users.filter((u) => u.role === where.role);
          if (where.ownerId) return db.stores.find((s) => s.ownerId === where.ownerId) || null;
          return null;
        }),
        findMany: jest.fn(({ where, orderBy, skip, take }: any) => {
          let results = [...db.users];
          if (where?.role) results = results.filter((u) => u.role === where.role);
          if (where?.OR) {
            const s = where.OR[0]?.name?.contains?.toLowerCase();
            results = results.filter(
              (u) =>
                u.name.toLowerCase().includes(s) ||
                u.email.toLowerCase().includes(s) ||
                (u.address || '').toLowerCase().includes(s),
            );
          }
          // sort
          if (orderBy) {
            const key = Object.keys(orderBy)[0];
            const dir = orderBy[key] === 'desc' ? -1 : 1;
            results.sort((a, b) => ((a as any)[key] > (b as any)[key] ? 1 : -1) * dir);
          }
          const total = results.length;
          if (skip) results = results.slice(skip);
          if (take) results = results.slice(0, take);
          return results;
        }),
        create: jest.fn(({ data }: any) => {
          const user: TestUser = {
            id: db.nextId('user'),
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash: data.passwordHash,
            address: data.address || null,
            role: data.role || Role.NORMAL_USER,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          db.users.push(user);
          return user;
        }),
        update: jest.fn(({ where, data }: any) => {
          const idx = db.users.findIndex((u) => u.id === where.id);
          if (idx === -1) throw new Error('Record not found');
          db.users[idx] = { ...db.users[idx], ...data };
          return db.users[idx];
        }),
        count: jest.fn(({ where }: any) => {
          if (!where) return db.users.length;
          if (where.role) return db.users.filter((u) => u.role === where.role).length;
          if (where.OR) {
            const s = where.OR[0]?.name?.contains?.toLowerCase();
            return db.users.filter(
              (u) =>
                u.name.toLowerCase().includes(s) ||
                u.email.toLowerCase().includes(s) ||
                (u.address || '').toLowerCase().includes(s),
            ).length;
          }
          return db.users.length;
        }),
        groupBy: jest.fn(({ by, _count }: any) => {
          const result: any[] = [];
          const roles = Object.values(Role);
          for (const role of roles) {
            const count = db.users.filter((u) => u.role === role).length;
            if (count > 0) result.push({ [by[0]]: role, _count: { role: count } });
          }
          return result;
        }),
      },
      store: {
        findUnique: jest.fn(({ where }: any) => {
          if (where.id) return db.stores.find((s) => s.id === where.id) || null;
          return null;
        }),
        findFirst: jest.fn(({ where }: any) => {
          if (where.ownerId) return db.stores.find((s) => s.ownerId === where.ownerId) || null;
          return null;
        }),
        findMany: jest.fn(({ where, skip, take }: any) => {
          let results = [...db.stores];
          if (where?.OR) {
            const s = where.OR[0]?.name?.contains?.toLowerCase();
            results = results.filter(
              (st) =>
                st.name.toLowerCase().includes(s) ||
                (st.address || '').toLowerCase().includes(s),
            );
          }
          if (where?.ownerId) results = results.filter((s) => s.ownerId === where.ownerId);
          const total = results.length;
          if (skip) results = results.slice(skip);
          if (take) results = results.slice(0, take);
          return results.map((s) => ({
            ...s,
            owner: db.users.find((u) => u.id === s.ownerId),
          }));
        }),
        create: jest.fn(({ data }: any) => {
          const store: TestStore = {
            id: db.nextId('store'),
            name: data.name,
            email: data.email.toLowerCase(),
            address: data.address || null,
            ownerId: data.ownerId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          db.stores.push(store);
          return store;
        }),
        count: jest.fn(({ where }: any) => {
          if (!where) return db.stores.length;
          if (where.ownerId) return db.stores.filter((s) => s.ownerId === where.ownerId).length;
          if (where.OR) {
            const s = where.OR[0]?.name?.contains?.toLowerCase();
            return db.stores.filter(
              (st) =>
                st.name.toLowerCase().includes(s) ||
                (st.address || '').toLowerCase().includes(s),
            ).length;
          }
          return db.stores.length;
        }),
      },
      rating: {
        findUnique: jest.fn(({ where }: any) => {
          if (where.userId_storeId)
            return (
              db.ratings.find(
                (r) =>
                  r.userId === where.userId_storeId.userId &&
                  r.storeId === where.userId_storeId.storeId,
              ) || null
            );
          return null;
        }),
        findMany: jest.fn(({ where, skip, take }: any) => {
          let results = db.ratings.filter((r) => r.storeId === where.storeId);
          if (take) {
            const s = skip || 0;
            results = results.slice(s, s + take);
          }
          return results.map((r) => ({
            ...r,
            user: db.users.find((u) => u.id === r.userId),
          }));
        }),
        create: jest.fn(({ data }: any) => {
          const rating: TestRating = {
            id: db.nextId('rating'),
            userId: data.userId,
            storeId: data.storeId,
            rating: data.rating,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          db.ratings.push(rating);
          return rating;
        }),
        update: jest.fn(({ where, data }: any) => {
          const idx = db.ratings.findIndex(
            (r) =>
              r.userId === where.userId_storeId.userId &&
              r.storeId === where.userId_storeId.storeId,
          );
          if (idx === -1) throw new Error('Record not found');
          db.ratings[idx] = { ...db.ratings[idx], ...data, updatedAt: new Date() };
          return db.ratings[idx];
        }),
        upsert: jest.fn(({ where, update, create }: any) => {
          const idx = db.ratings.findIndex(
            (r) =>
              r.userId === where.userId_storeId.userId &&
              r.storeId === where.userId_storeId.storeId,
          );
          if (idx !== -1) {
            db.ratings[idx] = { ...db.ratings[idx], ...update, updatedAt: new Date() };
            return db.ratings[idx];
          }
          const rating: TestRating = {
            id: db.nextId('rating'),
            userId: create.userId,
            storeId: create.storeId,
            rating: create.rating,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          db.ratings.push(rating);
          return rating;
        }),
        aggregate: jest.fn(({ where }: any) => {
          const storeRatings = db.ratings.filter((r) => r.storeId === where.storeId);
          const count = storeRatings.length;
          const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
          return {
            _avg: { rating: count > 0 ? sum / count : null },
            _count: { rating: count },
          };
        }),
        count: jest.fn(({ where }: any) => {
          if (where?.storeId)
            return db.ratings.filter((r) => r.storeId === where.storeId).length;
          return db.ratings.length;
        }),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    },
  };
});
