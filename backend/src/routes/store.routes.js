const express = require('express');
const crypto = require('crypto');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/stores
 * Browse all stores with average ratings and current user's rating using standard SQL
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, sortBy = 'rating', sortOrder = 'desc', page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(s.name LIKE ? OR s.address LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Count query
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM store s ${whereClause}`, params);
    const totalRecords = countRows[0].total;

    // Data query with subquery for logged in user's rating and AVG aggregate
    const dataSql = `
      SELECT 
        s.id, s.name, s.email, s.address, s.ownerId,
        COALESCE(AVG(r.rating), 0) AS avgRating,
        COUNT(r.id) AS totalRatings,
        (SELECT rating FROM rating WHERE storeId = s.id AND userId = ? LIMIT 1) AS userRating
      FROM store s
      LEFT JOIN rating r ON s.id = r.storeId
      ${whereClause}
      GROUP BY s.id
      ORDER BY ${sortBy === 'rating' ? 'avgRating' : 's.name'} ${sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [req.user.id, ...params, limitNum, offset]);

    const result = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      ownerId: row.ownerId,
      averageRating: Math.round(Number(row.avgRating) * 10) / 10,
      totalRatings: Number(row.totalRatings),
      userRating: row.userRating ? Number(row.userRating) : null,
    }));

    return res.json({
      success: true,
      data: result,
      meta: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum) || 1,
        totalRecords,
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
    const storeId = req.params.id;

    const dataSql = `
      SELECT 
        s.id, s.name, s.email, s.address, s.ownerId,
        COALESCE(AVG(r.rating), 0) AS avgRating,
        COUNT(r.id) AS totalRatings,
        (SELECT rating FROM rating WHERE storeId = s.id AND userId = ? LIMIT 1) AS userRating
      FROM store s
      LEFT JOIN rating r ON s.id = r.storeId
      WHERE s.id = ?
      GROUP BY s.id
      LIMIT 1
    `;

    const [rows] = await db.query(dataSql, [req.user.id, storeId]);
    const row = rows[0];

    if (!row) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    return res.json({
      success: true,
      data: {
        id: row.id,
        name: row.name,
        email: row.email,
        address: row.address,
        ownerId: row.ownerId,
        averageRating: Math.round(Number(row.avgRating) * 10) / 10,
        totalRatings: Number(row.totalRatings),
        userRating: row.userRating ? Number(row.userRating) : null,
      },
    });
  } catch (error) {
    console.error('Get store by id error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading store details.' });
  }
});

/**
 * POST /api/stores/:id/rating
 * Submit or modify star rating (1 to 5) using standard MySQL ON DUPLICATE KEY UPDATE
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

    // Verify store exists
    const [storeRows] = await db.query('SELECT id FROM store WHERE id = ? LIMIT 1', [storeId]);
    if (storeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const ratingId = crypto.randomUUID();

    // Standard MySQL Upsert: Insert new rating or update existing on duplicate (userId, storeId)
    await db.query(
      `INSERT INTO rating (id, userId, storeId, rating, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), updatedAt = NOW()`,
      [ratingId, req.user.id, storeId, ratingValue]
    );

    return res.json({
      success: true,
      data: {
        userId: req.user.id,
        storeId,
        rating: ratingValue,
      },
      message: 'Rating saved successfully.',
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    return res.status(500).json({ success: false, message: 'Server error while saving rating.' });
  }
});

module.exports = router;
