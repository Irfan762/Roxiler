-- ============================================================
-- Database Schema for Store Rating System
-- Simple, Clean, Standard MySQL 8.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS store_rating;
USE store_rating;

-- 1. Users Table (Stores Admins, Store Owners, and Customers)
CREATE TABLE IF NOT EXISTS user (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  address VARCHAR(400) DEFAULT NULL,
  role ENUM('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER') NOT NULL DEFAULT 'NORMAL_USER',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email),
  INDEX idx_user_role (role)
);

-- 2. Stores Table (Stores registered shops and their owner)
CREATE TABLE IF NOT EXISTS store (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address VARCHAR(400) DEFAULT NULL,
  ownerId VARCHAR(64) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_store_owner (ownerId)
);

-- 3. Ratings Table (Stores 1 to 5 star ratings given by customers)
CREATE TABLE IF NOT EXISTS rating (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  storeId VARCHAR(64) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_store (userId, storeId),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (storeId) REFERENCES store(id) ON DELETE CASCADE,
  INDEX idx_rating_store (storeId),
  INDEX idx_rating_user (userId)
);
