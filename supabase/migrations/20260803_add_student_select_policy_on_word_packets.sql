-- Migration: Allow students to read word_packets assigned to them
-- Description: Adds a SELECT policy so students see packets assigned via packet_assignments.

ALTER TABLE word_packets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read packets assigned to them"
    ON word_packets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM packet_assignments
            WHERE packet_assignments.packet_id = word_packets.id
            AND packet_assignments.student_id = auth.uid()
        )
    );

-- No other privileges changed; this policy complements existing teacher policy.
