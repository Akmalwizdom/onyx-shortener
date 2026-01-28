-- Neon PostgreSQL Database Schema for Onyx Protocol (Web3 Enhanced)
-- Run this script to initialize or update your database

-- 1. URLs table
CREATE TABLE IF NOT EXISTS urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- 2. Web3 Migration: Add columns safely if they don't exist
DO $$
BEGIN
    -- Add creator_wallet if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='urls' AND column_name='creator_wallet') THEN
        ALTER TABLE urls ADD COLUMN creator_wallet VARCHAR(42);
        CREATE INDEX idx_urls_creator_wallet ON urls(creator_wallet);
    END IF;

    -- Add title if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='urls' AND column_name='title') THEN
        ALTER TABLE urls ADD COLUMN title TEXT;
    END IF;

    -- Add access_policy (JSONB) for Token Gating
    -- Structure: { type: 'token', chainId: 8453, contract: '0x...', minAmount: '100' }
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='urls' AND column_name='access_policy') THEN
        ALTER TABLE urls ADD COLUMN access_policy JSONB;
        CREATE INDEX idx_urls_access_policy ON urls USING GIN (access_policy);
    END IF;
END $$;


-- 3. Analytics table
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
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_clicks_url_id ON clicks(url_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);

-- 4. Success message
SELECT 'Database schema updated for Onyx Protocol (Web3 Ready)!' AS status;