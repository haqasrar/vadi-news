-- Run this in Vercel Storage -> Query Console

-- 1. News Table (Modified for Base64 Images)
CREATE TABLE IF NOT exists news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    main_image TEXT, -- Now stores Base64 string (Large Text)
    video_url TEXT,
    category VARCHAR(50),
    type VARCHAR(20) DEFAULT 'standard',
    is_trending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Gallery Table
CREATE TABLE IF NOT exists news_gallery (
    id SERIAL PRIMARY KEY,
    news_id INT REFERENCES news(id) ON DELETE CASCADE,
    image_url TEXT -- Now stores Base64 string
);

-- 3. Ticker (Breaking News)
CREATE TABLE IF NOT exists ticker (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ads
CREATE TABLE IF NOT exists ads (
    id SERIAL PRIMARY KEY,
    content TEXT, -- Base64 Image
    link TEXT,
    bio TEXT,
    type VARCHAR(20) DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
