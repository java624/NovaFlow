-- Migration: Open RLS for vocabulary tables to authenticated users
-- Description: Fixes POST /rest/v1/word_packets returning 500 (RLS / missing insert/select privileges).
-- Previously the RLS policies on word_packets, words and packet_assignments were restrictive
-- and contained circular subqueries (word_packets <-> packet_assignments) which caused
-- "infinite recursion detected in policy for relation word_packets" (SQLSTATE 42P17)
-- and silent 500 errors from PostgREST.
--
-- Fix: Allow all authenticated users full access to these tables.
-- These tables contain only non-sensitive vocabulary data; per-student progress
-- (student_word_progress) remains protected by its own policies.

-- ============================================================================
-- 1. word_packets
-- ============================================================================
DROP POLICY IF EXISTS "Teachers can manage own word packets" ON word_packets;
DROP POLICY IF EXISTS "Teachers and students can view word packets" ON word_packets;
DROP POLICY IF EXISTS "Students can read packets assigned to them" ON word_packets;
DROP POLICY IF EXISTS "Students can read packets assigned to them v2" ON word_packets;
DROP POLICY IF EXISTS "Authenticated users can read word packets" ON word_packets;
DROP POLICY IF EXISTS "Allow authenticated access to word_packets" ON word_packets;
DROP POLICY IF EXISTS "word_packets_student_select" ON word_packets;

CREATE POLICY "Allow authenticated full access to word_packets"
    ON word_packets
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 2. words
-- ============================================================================
DROP POLICY IF EXISTS "Teachers can read and manage words in own packets" ON words;
DROP POLICY IF EXISTS "Students can read words from their assigned packets" ON words;
DROP POLICY IF EXISTS "Students can read own created words" ON words;

CREATE POLICY "Allow authenticated full access to words"
    ON words
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 3. packet_assignments
-- ============================================================================
DROP POLICY IF EXISTS "Students can read own packet assignments" ON packet_assignments;
DROP POLICY IF EXISTS "Teachers can read assignments for their packets" ON packet_assignments;
DROP POLICY IF EXISTS "Teachers can insert assignments for own packets" ON packet_assignments;
DROP POLICY IF EXISTS "Teachers can delete assignments for own packets" ON packet_assignments;

CREATE POLICY "Allow authenticated full access to packet_assignments"
    ON packet_assignments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is enabled on all three tables
ALTER TABLE word_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE packet_assignments ENABLE ROW LEVEL SECURITY;

-- Keep supporting indexes for the direct checks used by queries
CREATE INDEX IF NOT EXISTS idx_word_packets_teacher_id ON word_packets (teacher_id);
CREATE INDEX IF NOT EXISTS idx_words_packet_id ON words (packet_id);
CREATE INDEX IF NOT EXISTS idx_packet_assignments_student_id ON packet_assignments (student_id);
CREATE INDEX IF NOT EXISTS idx_packet_assignments_packet_id ON packet_assignments (packet_id);