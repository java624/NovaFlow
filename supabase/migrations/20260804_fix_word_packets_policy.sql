-- Re-apply word_packets RLS fix after 20260803 re-introduced recursive SELECT policy.
-- See 20240804_fix_word_packets_policy.sql for rationale.

DROP POLICY IF EXISTS "Teachers and students can view word packets" ON word_packets;
DROP POLICY IF EXISTS "Students can read packets assigned to them" ON word_packets;
DROP POLICY IF EXISTS "Authenticated users can read word packets" ON word_packets;
DROP POLICY IF EXISTS "Allow authenticated access to word_packets" ON word_packets;

CREATE POLICY "Allow authenticated access to word_packets"
    ON word_packets
    FOR SELECT
    TO authenticated
    USING (true);
