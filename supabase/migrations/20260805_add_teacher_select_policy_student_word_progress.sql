-- Migration: Add authenticated SELECT policy for student_word_progress
-- Description: Allows authenticated users (teachers & students) to read word progress rows without RLS policy recursion.

DROP POLICY IF EXISTS "Allow authenticated access to student_word_progress" ON student_word_progress;
DROP POLICY IF EXISTS "Teachers can read student word progress" ON student_word_progress;

CREATE POLICY "Allow authenticated access to student_word_progress"
    ON student_word_progress
    FOR SELECT
    TO authenticated
    USING (true);
