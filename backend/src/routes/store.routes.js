const express = require('express');
const prisma = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/stores
 * List all stores for normal users with live ratings and pagination metadata
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, sortBy = 'rating', sortOrder = 'desc', page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
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
        orderBy: sortBy !== 'rating' ? { [sortBy]: sortOrder } : undefined,
      }),
      prisma.store.count({ where }),
    ]);

    const storeIds = stores.map((s) => s.id);

    // Compute live average rating & count per store
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

    // Fetch user's own ratings for these stores
    const userRatings = await prisma.rating.findMany({
      where: { userId: req.user.id, storeId: { in: storeIds } },
    });
    const userRatingsMap = new Map();
    for (const ur of userRatings) {
      userRatingsMap.set(ur.storeId, ur.rating);
    }

    // Build response array
    const storesWithRatings = stores.map((store) => {
      const stats = statsMap.get(store.id) || { average: 0, count: 0 };
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        averageRating: stats.average,
        totalRatings: stats.count,
        userRating: userRatingsMap.get(store.id) || null,
      };
    });

    // Apply sorting for ratings
    if (sortBy === 'rating') {
      storesWithRatings.sort((a, b) =>
        sortOrder === 'asc'
          ? a.averageRating - b.averageRating
          : b.averageRating - a.averageRating
      );
    }

    return res.json({
      success: true,
      data: storesWithRatings,
      meta: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error('Fetch stores error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching stores.' });
  }
});

/**
 * GET /api/stores/:id
 * Single store details with live rating stats
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const [stats, userRatingRow] = await Promise.all([
      prisma.rating.aggregate({
        where: { storeId: store.id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.rating.findUnique({
        where: {
          userId_storeId: {
            userId: req.user.id,
            storeId: store.id,
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
        totalRatings: stats._count.rating || 0,
        userRating: userRatingRow ? userRatingRow.rating : null,
      },
    });
  } catch (error) {
    console.error('Get store by id error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading store details.' });
  }
});

/**
 * POST /api/stores/:id/rating
 * Submit or modify star rating (1 to 5) for a store.
 * Restricted to NORMAL_USER role.
 */
router.post('/:id/rating', authenticate, requireRole('NORMAL_USER'), async (req, res) => {
  try {
    const storeId = req.params.id;
    const ratingValue = parseInt(req.body.rating, 10);

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer number between 1 and 5.',
      });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Save or update rating (one rating per user per store)
    const rating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
      update: { rating: ratingValue },
      create: {
        userId: req.user.id,
        storeId,
        rating: ratingValue,
      },
    });

    return res.json({
      success: true,
      data: rating,
      message: 'Rating saved successfully.',
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    return res.status(500).json({ success: false, message: 'Server error while saving rating.' });
  }
});

module.exports = router;
