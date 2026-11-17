import { Role } from '@prisma/client';
import { db } from './setup';
import authService from '../src/services/auth.service';
import userService from '../src/services/user.service';
import storeService from '../src/services/store.service';
import ratingService from '../src/services/rating.service';
import { ApiError } from '../src/utils/errors';

describe('Store & Rating Service', () => {
  beforeEach(() => db.reset());

  let ownerId: string;
  let storeId: string;
  let userId: string;

  beforeEach(async () => {
    // Create a store owner
    const owner = await userService.createUser({
      name: 'Store Owner Person With Long Name',
      email: 'owner@example.com',
      password: 'Owner@1234',
      address: '100 Owner Street',
      role: Role.STORE_OWNER,
    });
    ownerId = owner.id;

    // Create a normal user
    const user = await authService.signup({
      name: 'Normal User Person With Long Name',
      email: 'normal@example.com',
      address: '200 User Street',
      password: 'Password@123',
    });
    userId = user.user.id;

    // Create a store
    const store = await storeService.createStore({
      name: 'Test Store With a Long Enough Name',
      email: 'store@example.com',
      address: '300 Store Avenue',
      ownerId,
    });
    storeId = store.id;
  });

  describe('Store creation (admin)', () => {
    it('should create a store assigned to a STORE_OWNER', async () => {
      expect(storeId).toBeDefined();
      expect(db.stores.length).toBe(1);
      expect(db.stores[0].ownerId).toBe(ownerId);
    });

    it('should reject store creation with non-owner user', async () => {
      await expect(
        storeService.createStore({
          name: 'Another Store With a Long Enough Name',
          email: 'store2@example.com',
          address: '301 Avenue',
          ownerId: userId, // normal user, not store owner
        }),
      ).rejects.toThrow('not a store owner');
    });

    it('should reject store creation with non-existent owner', async () => {
      await expect(
        storeService.createStore({
          name: 'Store With a Long Enough Name Here',
          email: 'store3@example.com',
          address: '302 Avenue',
          ownerId: 'nonexistent-id',
        }),
      ).rejects.toThrow('not found');
    });
  });

  describe('Rating submission', () => {
    it('should submit a rating (1-5) for a store', async () => {
      const result = await ratingService.submitRating(userId, storeId, 5);
      expect(result.rating).toBe(5);
      expect(result.isUpdate).toBe(false);
    });

    it('should calculate the store average rating correctly', async () => {
      // Create additional users
      const user2 = await authService.signup({
        name: 'Second Normal User With Long Name',
        email: 'normal2@example.com',
        address: '201 Street',
        password: 'Password@123',
      });
      const user3 = await authService.signup({
        name: 'Third Normal User With Long Name',
        email: 'normal3@example.com',
        address: '202 Street',
        password: 'Password@123',
      });

      await ratingService.submitRating(userId, storeId, 5);
      await ratingService.submitRating(user2.user.id, storeId, 4);
      await ratingService.submitRating(user3.user.id, storeId, 3);

      const dashboard = await ratingService.getOwnerDashboard(ownerId);
      expect(dashboard.averageRating).toBe(4); // (5+4+3)/3 = 4
      expect(dashboard.totalRatings).toBe(3);
    });

    it('should prevent duplicate ratings — upsert updates existing', async () => {
      const first = await ratingService.submitRating(userId, storeId, 4);
      expect(first.isUpdate).toBe(false);

      const second = await ratingService.submitRating(userId, storeId, 5);
      expect(second.isUpdate).toBe(true);
      expect(second.rating).toBe(5);

      // Should still be only one rating
      expect(db.ratings.length).toBe(1);
    });

    it('should allow a user to modify their previous rating', async () => {
      await ratingService.submitRating(userId, storeId, 3);
      const updated = await ratingService.submitRating(userId, storeId, 5);
      expect(updated.rating).toBe(5);
      expect(updated.isUpdate).toBe(true);

      // Verify the stored rating changed
      const store = await storeService.getStoreById(storeId, userId);
      expect(store.userRating).toBe(5);
    });

    it('should reject rating for a non-existent store', async () => {
      await expect(
        ratingService.submitRating(userId, 'nonexistent-store-id', 5),
      ).rejects.toThrow('Store not found');
    });

    it('should compute average rating as 0 when no ratings exist', async () => {
      const dashboard = await ratingService.getOwnerDashboard(ownerId);
      expect(dashboard.averageRating).toBe(0);
      expect(dashboard.totalRatings).toBe(0);
    });
  });

  describe('Store listing', () => {
    it('should include overall rating and user rating in store listing', async () => {
      await ratingService.submitRating(userId, storeId, 4);

      const result = await storeService.getStores({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        userId,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].averageRating).toBe(4);
      expect(result.data[0].userRating).toBe(4);
    });

    it('should return null userRating when user has not rated', async () => {
      const result = await storeService.getStores({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        userId,
      });

      expect(result.data[0].userRating).toBeNull();
    });
  });

  describe('Store owner dashboard', () => {
    it('should return store name, average rating, and total ratings', async () => {
      const user2 = await authService.signup({
        name: 'Second Normal User With Long Name',
        email: 'normal4@example.com',
        address: '203 Street',
        password: 'Password@123',
      });

      await ratingService.submitRating(userId, storeId, 5);
      await ratingService.submitRating(user2.user.id, storeId, 3);

      const dashboard = await ratingService.getOwnerDashboard(ownerId);

      expect(dashboard.store.name).toBe('Test Store With a Long Enough Name');
      expect(dashboard.averageRating).toBe(4); // (5+3)/2 = 4
      expect(dashboard.totalRatings).toBe(2);
    });

    it('should list users who rated the store', async () => {
      await ratingService.submitRating(userId, storeId, 5);

      const result = await ratingService.getOwnerRatings(ownerId, {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].rating).toBe(5);
      expect(result.data[0].user.name).toBeDefined();
    });
  });

  describe('User details (admin)', () => {
    it('should show owned store info for STORE_OWNER users', async () => {
      const details = await userService.getUserDetails(ownerId);
      expect(details.role).toBe(Role.STORE_OWNER);
      expect(details.store).not.toBeNull();
      expect(details.store!.name).toBe('Test Store With a Long Enough Name');
    });

    it('should not show store info for NORMAL_USER users', async () => {
      const details = await userService.getUserDetails(userId);
      expect(details.role).toBe(Role.NORMAL_USER);
      expect(details.store).toBeNull();
    });
  });
});
