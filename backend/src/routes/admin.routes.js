const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Protect all admin routes with SYSTEM_ADMIN check
router.use(authenticate, requireRole('SYSTEM_ADMIN'));

/**
 * GET /api/admin/dashboard
 * Aggregated platform statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings, roleGroups] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
    ]);

    const usersByRole = roleGroups.map((group) => ({
      role: group.role,
      count: group._count.role,
    }));

    const roles = {};
    for (const group of roleGroups) {
      roles[group.role] = group._count.role;
    }

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
        usersByRole,
        roles,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading admin stats.' });
  }
});

/**
 * GET /api/admin/users
 * Search and filter users by role with pagination
 */
router.get('/users', async (req, res) => {
  try {
    const { search, role, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          address: true,
          createdAt: true,
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: users,
      meta: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading users.' });
  }
});

/**
 * GET /api/admin/users/:id
 * Get single user details (includes store info if user is STORE_OWNER)
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let store = null;
    if (user.role === 'STORE_OWNER') {
      const ownedStore = await prisma.store.findFirst({
        where: { ownerId: user.id },
      });
      if (ownedStore) {
        const stats = await prisma.rating.aggregate({
          where: { storeId: ownedStore.id },
          _avg: { rating: true },
          _count: { rating: true },
        });
        store = {
          id: ownedStore.id,
          name: ownedStore.name,
          email: ownedStore.email,
          address: ownedStore.address,
          averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
          totalRatings: stats._count.rating || 0,
        };
      }
    }

    return res.json({
      success: true,
      data: { ...user, store },
    });
  } catch (error) {
    console.error('Admin user detail error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading user details.' });
  }
});

/**
 * POST /api/admin/users
 * Create user with any role: NORMAL_USER, STORE_OWNER, or SYSTEM_ADMIN
 */
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 20 and 60 characters.',
      });
    }

    if (!password || password.length < 8 || password.length > 16) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 16 characters.',
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        address: address ? address.trim() : null,
        role: role || 'NORMAL_USER',
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating user.' });
  }
});

/**
 * GET /api/admin/stores
 * Search stores and view associated store owner information with pagination
 */
router.get('/stores', async (req, res) => {
  try {
    const { search, ownerId, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
        orderBy: sortBy !== 'rating' ? { [sortBy]: sortOrder } : undefined,
      }),
      prisma.store.count({ where }),
    ]);

    // Compute live average rating and count for each store
    const storeIds = stores.map((s) => s.id);
    const ratingStats = await prisma.rating.groupBy({
      by: ['storeId'],
      where: { storeId: { in: storeIds } },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const statsMap = new Map();
    for (const r of ratingStats) {
      statsMap.set(r.storeId, {
        average: r._avg.rating ? Math.round(r._avg.rating * 10) / 10 : 0,
        count: r._count.rating || 0,
      });
    }

    const result = stores.map((s) => {
      const stats = statsMap.get(s.id) || { average: 0, count: 0 };
      return {
        ...s,
        averageRating: stats.average,
        totalRatings: stats.count,
      };
    });

    if (sortBy === 'rating') {
      result.sort((a, b) =>
        sortOrder === 'asc'
          ? a.averageRating - b.averageRating
          : b.averageRating - a.averageRating
      );
    }

    return res.json({
      success: true,
      data: result,
      meta: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error('Admin stores error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading stores.' });
  }
});

/**
 * POST /api/admin/stores
 * Create a new store assigned to a STORE_OWNER
 */
router.post('/stores', async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Store name must be between 20 and 60 characters.',
      });
    }

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Store owner is required.',
      });
    }

    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== 'STORE_OWNER') {
      return res.status(400).json({
        success: false,
        message: 'The selected user must have the STORE_OWNER role.',
      });
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        address: address ? address.trim() : null,
        ownerId,
      },
    });

    return res.status(201).json({ success: true, data: store });
  } catch (error) {
    console.error('Admin create store error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating store.' });
  }
});

module.exports = router;
