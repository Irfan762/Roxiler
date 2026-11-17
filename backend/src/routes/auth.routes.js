const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Shared login endpoint using standard SQL
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Standard SQL: Query user by email
    const [rows] = await db.query('SELECT * FROM user WHERE email = ? LIMIT 1', [cleanEmail]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password hash with bcrypt
    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token valid for 7 days
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

/**
 * POST /api/auth/signup
 * Customer registration using standard SQL
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Validate name length (20 - 60 chars)
    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 20 and 60 characters long.',
      });
    }

    // Validate password (8 - 16 chars, 1 uppercase, 1 special character)
    if (!password || password.length < 8 || password.length > 16) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 16 characters.',
      });
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
    if (!hasUppercase || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 1 uppercase letter and 1 special character.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Standard SQL: Check if email already exists
    const [existing] = await db.query('SELECT id FROM user WHERE email = ? LIMIT 1', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password and insert user with standard SQL
    const userId = crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(password, 10);
    const cleanAddress = address ? address.trim() : null;

    await db.query(
      `INSERT INTO user (id, name, email, passwordHash, address, role, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, 'NORMAL_USER', NOW(), NOW())`,
      [userId, name.trim(), cleanEmail, passwordHash, cleanAddress]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, role: 'NORMAL_USER' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          name: name.trim(),
          email: cleanEmail,
          role: 'NORMAL_USER',
          address: cleanAddress,
        },
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
});

/**
 * POST /api/auth/change-password
 * Change password using standard SQL UPDATE
 */
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.',
      });
    }

    // Verify current password
    const isMatch = bcrypt.compareSync(currentPassword, req.user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Validate new password rules
    if (newPassword.length < 8 || newPassword.length > 16) {
      return res.status(400).json({
        success: false,
        message: 'New password must be between 8 and 16 characters.',
      });
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword);
    if (!hasUppercase || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 1 uppercase letter and 1 special character.',
      });
    }

    // Standard SQL: Update passwordHash
    const newHash = bcrypt.hashSync(newPassword, 10);
    await db.query('UPDATE user SET passwordHash = ?, updatedAt = NOW() WHERE id = ?', [
      newHash,
      req.user.id,
    ]);

    return res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Server error during password change.' });
  }
});

/**
 * GET /api/auth/me
 * Return current user profile
 */
router.get('/me', authenticate, async (req, res) => {
  return res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        address: req.user.address,
      },
    },
  });
});

module.exports = router;
