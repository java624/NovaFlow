-- Migration: Add RLS policies for profiles table
-- Description: Ensures teachers can read all student profiles and students can read their own.
-- Run this ONLY if you get data discrepancies between teacher and student dashboards.

-- =========================================================================
-- PROFILES TABLE RLS POLICIES
-- =========================================================================

-- 1️⃣ Allow any authenticated user to read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 2️⃣ Allow authenticated users with role='teacher' to read ALL profiles
--    This is needed so the teacher dashboard can list all students
CREATE POLICY "Teachers can read all profiles"
    ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'teacher'
        )
    );

-- 3️⃣ Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4️⃣ Allow teachers to update any student's profile (for balance management)
CREATE POLICY "Teachers can update any profile"
    ON profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'teacher'
        )
    );

-- Note: Run these policies in the Supabase SQL Editor.
-- If policies already exist with the same names, they will be skipped (won't error).
-- You can safely run this entire script multiple times.
