-- Migration: Create comments table for reviews/feedback system
-- Description: This table stores reviews from real users that appear on the landing page
-- and are manageable by teachers in their personal dashboard.

CREATE TABLE IF NOT EXISTS comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    teacher_reply TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read comments (for landing page display)
CREATE POLICY "Anyone can read comments"
    ON comments
    FOR SELECT
    USING (true);

-- Policy: Anyone can insert comments (for the review form on landing page)
CREATE POLICY "Anyone can insert comments"
    ON comments
    FOR INSERT
    WITH CHECK (true);

-- Policy: Only authenticated users (teachers) can update comments (for teacher reply)
CREATE POLICY "Authenticated users can update comments"
    ON comments
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users (teachers) can delete comments
CREATE POLICY "Authenticated users can delete comments"
    ON comments
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Index for ordering by creation date (used in both vanilla and Next.js versions)
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at DESC);
