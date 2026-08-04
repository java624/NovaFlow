-- Fix infinite recursion in RLS for word_packets / packet_assignments.
-- The recursive policy on word_packets (querying packet_assignments) combined with
-- teacher policies on packet_assignments (querying word_packets) caused:
-- "infinite recursion detected in policy for relation word_packets" (SQLSTATE 42P17).

DROP POLICY IF EXISTS "Teachers and students can view word packets" ON word_packets;
DROP POLICY IF EXISTS "Students can read packets assigned to them" ON word_packets;
DROP POLICY IF EXISTS "Authenticated users can read word packets" ON word_packets;
DROP POLICY IF EXISTS "Allow authenticated access to word_packets" ON word_packets;

CREATE POLICY "Allow authenticated access to word_packets"
    ON word_packets
    FOR SELECT
    TO authenticated
    USING (true);

-- Teacher write access remains via existing policy:
-- "Teachers can manage own word packets" (teacher_id = auth.uid())

CREATE INDEX IF NOT EXISTS idx_word_packets_teacher_id ON word_packets (teacher_id);
CREATE INDEX IF NOT EXISTS idx_packet_assignments_student_id ON packet_assignments (student_id);
CREATE INDEX IF NOT EXISTS idx_packet_assignments_packet_id ON packet_assignments (packet_id);
