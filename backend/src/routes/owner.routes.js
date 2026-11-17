const express = require('express');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/owner/dashboard
 * Store Owner overview using standard SQL
 */
router.get('/dashboard', authenticate, requireRole('STORE_OWNER'), async (req, res) => {
  try {
    // 1. Find store belonging to logged-in owner
    const [storeRows] = await db.query(
      'SELECT id, name, email, address FROM store WHERE ownerId = ? LIMIT 1',
      [req.user.id]
    );

    const store = storeRows[0];
    if (!store) {
      return res.json({
        success: true,
        data: { store: null, averageRating: 0, totalRatings: 0 },
      });
    }

    // 2. Calculate average rating and total review count using standard SQL aggregate
    const [statRows] = await db.query(
      `SELECT COALESCE(AVG(rating), 0) AS avgRating, COUNT(id) AS totalRatings 
       FROM rating 
       WHERE storeId = ?`,
      [store.id]
    );

    const stats = statRows[0];

    return res.json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
        },
        averageRating: Math.round(Number(stats.avgRating) * 10) / 10,
        totalRatings: Number(stats.totalRatings),
      },
    });
  } catch (error) {
    console.error('Owner dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading owner dashboard.' });
  }
});

/**
 * GET /api/owner/ratings
 * List of customer ratings with user details via standard SQL JOIN
 */
router.get('/ratings', authenticate, requireRole('STORE_OWNER'), async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Find owner's store
    const [storeRows] = await db.query(
      'SELECT id FROM store WHERE ownerId = ? LIMIT 1',
      [req.user.id]
    );

    const store = storeRows[0];
    if (!store) {
      return res.json({
        success: true,
        data: [],
        meta: { currentPage: pageNum, totalPages: 1, totalRecords: 0 },
      });
    }

    // Allowed sort columns
    const safeSortBy = sortBy === 'rating' ? 'r.rating' : 'r.createdAt';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total ratings
    const [countRows] = await db.query(
      'SELECT COUNT(*) AS total FROM rating WHERE storeId = ?',
      [store.id]
    );
    const totalRecords = countRows[0].total;

    // Fetch ratings with customer details via SQL JOIN
    const dataSql = `
      SELECT 
        r.id, r.rating, r.createdAt,
        u.id AS userId, u.name AS userName, u.email AS userEmail, u.address AS userAddress
      FROM rating r
      JOIN user u ON r.userId = u.id
      WHERE r.storeId = ?
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [store.id, limitNum, offset]);

    const ratings = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      user: {
        id: r.userId,
        name: r.userName,
        email: r.userEmail,
        address: r.userAddress,
      },
    }));

    return res.json({
      success: true,
      data: ratings,
      meta: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum) || 1,
        totalRecords,
      },
    });
  } catch (error) {
    console.error('Owner ratings error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading store reviews.' });
  }
});

module.exports = router;
