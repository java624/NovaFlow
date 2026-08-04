-- Migration: Fix infinite recursion in RLS policies for word_packets
-- Description: The policy "Students can read packets assigned to them" on word_packets
-- queries packet_assignments, while packet_assignments' teacher policy queries word_packets.
-- This creates a circular dependency -> "infinite recursion detected in policy for relation word_packets"
-- (SQLSTATE 42P17).
--
-- Fix: Replace the student SELECT policy on word_packets with a simple
-- `auth.uid() IS NOT NULL` check. word_packets contains only non-sensitive metadata
-- (title, target_language, level, teacher_id), and actual per-student data access
-- is still controlled by the policies on packet_assignments, words, and student_word_progress.

-- 1. Drop the problematic recursive policy
DROP POLICY IF EXISTS "Students can read packets assigned to them" ON word_packets;

-- 2. Replace with a simple, non-recursive policy for authenticated users
CREATE POLICY "Authenticated users can read word packets"
    ON word_packets
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- 3. Keep the existing teacher policy intact (direct check, no recursion)
--    "Teachers can manage own word packets" (teacher_id = auth.uid())

-- 4. Safety net: drop any duplicate/invalid policies that could still chain
DROP POLICY IF EXISTS "Students can read packets assigned to them v2" ON word_packets;
DROP POLICY IF EXISTS "word_packets_student_select" ON word_packets;

-- 5. Indexes for the direct checks used in remaining policies
CREATE INDEX IF NOT EXISTS idx_word_packets_teacher_id ON word_packets (teacher_id);
CREATE INDEX IF NOT EXISTS idx_packet_assignments_student_id ON packet_assignments (student_id);
CREATE INDEX IF NOT EXISTS idx_packet_assignments_packet_id ON packet_assignments (packet_id);