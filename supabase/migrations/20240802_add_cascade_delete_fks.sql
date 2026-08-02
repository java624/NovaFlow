-- ============================================================================
-- Migration: Add ON DELETE CASCADE foreign keys for student data integrity
-- Description: Ensures that when a student's auth user is deleted, all related
-- data (profiles, lessons, homeworks) is automatically removed.
-- The API route /api/teacher/delete-student also deletes explicitly, but this
-- provides a safety net at the database level.
-- ============================================================================

-- 1. profiles -> auth.users (ON DELETE CASCADE)
--    When the auth user is deleted, the profile row is automatically removed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_id_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. lessons.student_id -> profiles.id (ON DELETE CASCADE)
--    When a student profile is deleted, all their lessons are removed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lessons_student_id_fkey'
  ) THEN
    ALTER TABLE lessons
      ADD CONSTRAINT lessons_student_id_fkey
      FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. lessons.teacher_id -> profiles.id (ON DELETE CASCADE)
--    When a teacher profile is deleted, their lessons are removed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lessons_teacher_id_fkey'
  ) THEN
    ALTER TABLE lessons
      ADD CONSTRAINT lessons_teacher_id_fkey
      FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. homeworks.student_id -> profiles.id (ON DELETE CASCADE)
--    When a student profile is deleted, all their homeworks are removed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'homeworks_student_id_fkey'
  ) THEN
    ALTER TABLE homeworks
      ADD CONSTRAINT homeworks_student_id_fkey
      FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. payments_history.user_id -> auth.users(id) ON DELETE CASCADE
--    (Already exists from 20240701_create_payments_history.sql, but ensure it's there)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_user'
  ) THEN
    ALTER TABLE payments_history
      ADD CONSTRAINT fk_user
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Note: Run this migration in the Supabase SQL Editor.
-- If constraints already exist with the same names, they will be skipped (won't error).
-- You can safely run this entire script multiple times.