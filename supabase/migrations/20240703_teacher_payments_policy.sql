-- ============================================================================
-- Migration: Grant Teachers SELECT access to payments_history
-- ============================================================================

-- Ensure teachers can view payment histories for all students
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments_history' 
    AND policyname = 'Teachers can view student payments'
  ) THEN
    CREATE POLICY "Teachers can view student payments"
      ON payments_history
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'teacher'
        )
      );
  END IF;
END $$;
