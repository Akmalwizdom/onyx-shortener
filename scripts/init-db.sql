-- Neon PostgreSQL Database Schema for Xyno URL Shortener
-- Run this script once to initialize your database

-- URLs table (stores short code to original URL mapping)
CREATE TABLE IF NOT EXISTS urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Create index for fast lookups (CRITICAL for redirect performance)
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);

-- Analytics table (tracks individual clicks)
CREATE TABLE IF NOT EXISTS clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES urls(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  country VARCHAR(2),
  ip_hash VARCHAR(64)
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_clicks_url_id ON clicks(url_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);

-- Success message
SELECT 'Database schema initialized successfully!' AS status;
