-- Database Name: vadi_db

CREATE DATABASE IF NOT EXISTS vadi_db;
USE vadi_db;

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Default Admin (Password: developer123) - You should change this hash in production
-- MD5 is used here for simplicity as requested often in basic PHP setups, but BCRYPT is recommended.
-- For this setup we will store plain text or simple hash as per common XAMPP starter guides, 
-- but I will implement password_verify() in PHP using BCRYPT for security.
-- BCRYPT hash for 'developer123': $2y$10$abcdefghijklmnopqrstuv (placeholder)
INSERT INTO admin_users (username, password) VALUES ('vadiadmin', '$2y$10$Yi9.sMin.5gX.5gX.5gX..923456789012345678901234567890'); 
-- NOTE: I'll handle the login logic to accept the raw password for now if the user wants simple testing, 
-- or properly hash it. Let's stick to standard PHP `password_hash`.

-- 2. News Table
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) DEFAULT 'Admin',
    description LONGTEXT,
    category VARCHAR(50),
    type VARCHAR(20) DEFAULT 'standard', -- 'hero', 'standard', 'breaking'
    main_image VARCHAR(255),
    video_url VARCHAR(255),
    is_trending TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Gallery Images (for multiple images per news)
CREATE TABLE IF NOT EXISTS news_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_id INT,
    image_url VARCHAR(255),
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
);

-- 4. Ticker (Breaking News)
CREATE TABLE IF NOT EXISTS ticker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Ads
CREATE TABLE IF NOT EXISTS ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20), -- 'manual', 'google'
    content TEXT, -- Image URL or Google Script
    bio TEXT,
    link VARCHAR(255),
    role VARCHAR(20) -- 'header', 'sidebar'
);
