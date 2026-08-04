-- Migration: Create vocabulary schema for teacher-assigned word packets
-- Description: Adds tables for word packets, packet assignments, vocabulary words,
-- and per-student progress. Applies RLS so teachers see тільки свої пакети та
-- учні бачать лише свої призначення і прогрес.

-- ============================================================================
-- 1. Word packets
-- ============================================================================
CREATE TABLE IF NOT EXISTS word_packets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_language TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'B1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE word_packets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own word packets"
    ON word_packets
    FOR ALL
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_word_packets_teacher_id ON word_packets (teacher_id);

-- ============================================================================
-- 2. Packet assignments
-- ============================================================================
CREATE TABLE IF NOT EXISTS packet_assignments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    packet_id BIGINT NOT NULL REFERENCES word_packets(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    due_date DATE DEFAULT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (packet_id, student_id)
);

ALTER TABLE packet_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own packet assignments"
    ON packet_assignments
    FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Teachers can read assignments for their packets"
    ON packet_assignments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM word_packets
            WHERE word_packets.id = packet_assignments.packet_id
            AND word_packets.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can insert assignments for own packets"
    ON packet_assignments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM word_packets
            WHERE word_packets.id = packet_assignments.packet_id
            AND word_packets.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can delete assignments for own packets"
    ON packet_assignments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM word_packets
            WHERE word_packets.id = packet_assignments.packet_id
            AND word_packets.teacher_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_packet_assignments_student_id ON packet_assignments (student_id);
CREATE INDEX IF NOT EXISTS idx_packet_assignments_packet_id ON packet_assignments (packet_id);

-- ============================================================================
-- 3. Words
-- ============================================================================
CREATE TABLE IF NOT EXISTS words (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    packet_id BIGINT NULL REFERENCES word_packets(id) ON DELETE CASCADE,
    owner_student_id UUID NULL REFERENCES profiles(id) ON DELETE SET NULL,
    word TEXT NOT NULL,
    phonetic TEXT NOT NULL DEFAULT '',
    part_of_speech TEXT NOT NULL,
    cefr_level TEXT NOT NULL,
    primary_translation TEXT NOT NULL,
    alternative_translations TEXT[] NOT NULL DEFAULT '{}',
    definition TEXT NOT NULL DEFAULT '',
    mnemonic_hint TEXT NOT NULL DEFAULT '',
    collocations TEXT[] NOT NULL DEFAULT '{}',
    context_examples JSONB NOT NULL DEFAULT '[]',
    synonyms TEXT[] NOT NULL DEFAULT '{}',
    antonyms TEXT[] NOT NULL DEFAULT '{}',
    quiz JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can read and manage words in own packets"
    ON words
    FOR ALL
    USING (
        packet_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM word_packets
            WHERE word_packets.id = words.packet_id
            AND word_packets.teacher_id = auth.uid()
        )
    )
    WITH CHECK (
        packet_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM word_packets
            WHERE word_packets.id = words.packet_id
            AND word_packets.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can read words from their assigned packets"
    ON words
    FOR SELECT
    USING (
        packet_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM packet_assignments
            WHERE packet_assignments.packet_id = words.packet_id
            AND packet_assignments.student_id = auth.uid()
        )
    );

CREATE POLICY "Students can read own created words"
    ON words
    FOR SELECT
    USING (owner_student_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_words_packet_id ON words (packet_id);
CREATE INDEX IF NOT EXISTS idx_words_owner_student_id ON words (owner_student_id);

-- ============================================================================
-- 4. Student word progress
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_word_progress (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'learning',
    box_level INTEGER NOT NULL DEFAULT 1,
    next_review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, word_id)
);

ALTER TABLE student_word_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own progress"
    ON student_word_progress
    FOR ALL
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_student_word_progress_student_id ON student_word_progress (student_id);
CREATE INDEX IF NOT EXISTS idx_student_word_progress_word_id ON student_word_progress (word_id);

-- ============================================================================
-- 5. Optional status constraint for progress values
-- ============================================================================
ALTER TABLE student_word_progress
    ADD CONSTRAINT chk_student_word_progress_status
    CHECK (status IN ('learning', 'mastered', 'review_needed'));
