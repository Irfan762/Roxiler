const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Protect all admin routes with SYSTEM_ADMIN check
router.use(authenticate, requireRole('SYSTEM_ADMIN'));

/**
 * GET /api/admin/dashboard
 * Aggregated statistics using standard SQL COUNT and GROUP BY
 */
router.get('/dashboard', async (req, res) => {
  try {
    // 1. Total Users
    const [userCountRows] = await db.query('SELECT COUNT(*) AS total FROM user');
    const totalUsers = userCountRows[0].total;

    // 2. Total Stores
    const [storeCountRows] = await db.query('SELECT COUNT(*) AS total FROM store');
    const totalStores = storeCountRows[0].total;

    // 3. Total Ratings
    const [ratingCountRows] = await db.query('SELECT COUNT(*) AS total FROM rating');
    const totalRatings = ratingCountRows[0].total;

    // 4. Breakdown by Role using standard SQL GROUP BY
    const [roleRows] = await db.query('SELECT role, COUNT(*) AS count FROM user GROUP BY role');

    const usersByRole = roleRows.map((r) => ({
      role: r.role,
      count: Number(r.count),
    }));

    const roles = {};
    for (const r of roleRows) {
      roles[r.role] = Number(r.count);
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
 * Search and filter users by role with pagination using standard SQL
 */
router.get('/users', async (req, res) => {
  try {
    const { search, role, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Allowed sort columns to prevent SQL injection
    const allowedSort = ['name', 'email', 'role', 'createdAt'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];

    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR address LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Count query
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM user ${whereClause}`, params);
    const totalRecords = countRows[0].total;

    // Data query
    const dataSql = `
      SELECT id, name, email, role, address, createdAt 
      FROM user 
      ${whereClause} 
      ORDER BY ${safeSortBy} ${safeSortOrder} 
      LIMIT ? OFFSET ?
    `;
    const [users] = await db.query(dataSql, [...params, limitNum, offset]);

    return res.json({
      success: true,
      data: users,
      meta: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum) || 1,
        totalRecords,
      },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading users.' });
  }
});

/**
 * GET /api/admin/users/:id
 * Get single user details and their store info using standard SQL
 */
router.get('/users/:id', async (req, res) => {
  try {
    const [userRows] = await db.query(
      'SELECT id, name, email, role, address, createdAt FROM user WHERE id = ? LIMIT 1',
      [req.params.id]
    );

    const user = userRows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let store = null;
    if (user.role === 'STORE_OWNER') {
      const [storeRows] = await db.query(
        `SELECT s.id, s.name, s.email, s.address, 
                COALESCE(AVG(r.rating), 0) AS avgRating, 
                COUNT(r.id) AS totalRatings 
         FROM store s 
         LEFT JOIN rating r ON s.id = r.storeId 
         WHERE s.ownerId = ? 
         GROUP BY s.id 
         LIMIT 1`,
        [user.id]
      );

      if (storeRows.length > 0) {
        const s = storeRows[0];
        store = {
          id: s.id,
          name: s.name,
          email: s.email,
          address: s.address,
          averageRating: Math.round(Number(s.avgRating) * 10) / 10,
          totalRatings: Number(s.totalRatings),
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
 * Create user with any role using standard SQL INSERT
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

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email
    const [existing] = await db.query('SELECT id FROM user WHERE email = ? LIMIT 1', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const userId = crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(password, 10);
    const assignedRole = role || 'NORMAL_USER';
    const cleanAddress = address ? address.trim() : null;

    await db.query(
      `INSERT INTO user (id, name, email, passwordHash, address, role, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, name.trim(), cleanEmail, passwordHash, cleanAddress, assignedRole]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role: assignedRole,
        address: cleanAddress,
      },
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating user.' });
  }
});

/**
 * GET /api/admin/stores
 * Search stores, calculate average ratings and include owner details using SQL JOIN
 */
router.get('/stores', async (req, res) => {
  try {
    const { search, ownerId, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (ownerId) {
      conditions.push('s.ownerId = ?');
      params.push(ownerId);
    }

    if (search) {
      conditions.push('(s.name LIKE ? OR s.address LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Total count of stores
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM store s ${whereClause}`, params);
    const totalRecords = countRows[0].total;

    // Store listing with owner info and rating stats via standard SQL JOIN
    const dataSql = `
      SELECT 
        s.id, s.name, s.email, s.address, s.ownerId, s.createdAt,
        u.id AS ownerIdRef, u.name AS ownerName, u.email AS ownerEmail,
        COALESCE(AVG(r.rating), 0) AS avgRating,
        COUNT(r.id) AS totalRatings
      FROM store s
      LEFT JOIN user u ON s.ownerId = u.id
      LEFT JOIN rating r ON s.id = r.storeId
      ${whereClause}
      GROUP BY s.id, u.id
      ORDER BY ${sortBy === 'rating' ? 'avgRating' : 's.createdAt'} ${sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [...params, limitNum, offset]);

    const result = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      owner: {
        id: row.ownerIdRef,
        name: row.ownerName,
        email: row.ownerEmail,
      },
      averageRating: Math.round(Number(row.avgRating) * 10) / 10,
      totalRatings: Number(row.totalRatings),
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
    console.error('Admin stores error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading stores.' });
  }
});

/**
 * POST /api/admin/stores
 * Create new store assigned to a STORE_OWNER using standard SQL
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

    // Verify owner exists and has STORE_OWNER role
    const [ownerRows] = await db.query('SELECT id, role FROM user WHERE id = ? LIMIT 1', [ownerId]);
    const owner = ownerRows[0];

    if (!owner || owner.role !== 'STORE_OWNER') {
      return res.status(400).json({
        success: false,
        message: 'The selected user must have the STORE_OWNER role.',
      });
    }

    const storeId = crypto.randomUUID();
    const cleanEmail = email.toLowerCase().trim();
    const cleanAddress = address ? address.trim() : null;

    await db.query(
      `INSERT INTO store (id, name, email, address, ownerId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [storeId, name.trim(), cleanEmail, cleanAddress, ownerId]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: storeId,
        name: name.trim(),
        email: cleanEmail,
        address: cleanAddress,
        ownerId,
      },
    });
  } catch (error) {
    console.error('Admin create store error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating store.' });
  }
});

module.exports = router;
