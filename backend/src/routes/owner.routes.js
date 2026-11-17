const express = require('express');
const prisma = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/owner/dashboard
 * Summary stats for the logged-in Store Owner
 */
router.get('/dashboard', authenticate, requireRole('STORE_OWNER'), async (req, res) => {
  try {
    const store = await prisma.store.findFirst({
      where: { ownerId: req.user.id },
    });

    if (!store) {
      return res.json({
        success: true,
        data: { store: null, averageRating: 0, totalRatings: 0 },
      });
    }

    // Compute live average rating and review count
    const stats = await prisma.rating.aggregate({
      where: { storeId: store.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return res.json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
        },
        averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
        totalRatings: stats._count.rating || 0,
      },
    });
  } catch (error) {
    console.error('Owner dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading owner dashboard.' });
  }
});

/**
 * GET /api/owner/ratings
 * List of customer ratings with reviewer names and emails
 */
router.get('/ratings', authenticate, requireRole('STORE_OWNER'), async (req, res) => {
  try {
    const store = await prisma.store.findFirst({
      where: { ownerId: req.user.id },
    });

    if (!store) {
      return res.json({ success: true, data: [] });
    }

    const ratings = await prisma.rating.findMany({
      where: { storeId: store.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, address: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: ratings });
  } catch (error) {
    console.error('Owner ratings error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading store reviews.' });
  }
});

module.exports = router;
