// Database connection using mysql2 with standard SQL queries
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Initialize MySQL Connection Pool
const pool = mysql.createPool(process.env.DATABASE_URL || {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'store_rating',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
