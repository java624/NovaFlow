import { SupabaseClient } from '@supabase/supabase-js';
import { MasteryStatus, VocabularyItem, WordPacket } from '@/types/vocabulary';

type DbWord = {
  id: number;
  packet_id: number;
  word: string;
  phonetic: string | null;
  part_of_speech: string;
  cefr_level: string;
  primary_translation: string;
  alternative_translations: string[] | null;
  definition: string | null;
  mnemonic_hint: string | null;
  collocations: string[] | null;
  context_examples: VocabularyItem['contextExamples'] | null;
  synonyms: string[] | null;
  antonyms: string[] | null;
  quiz: VocabularyItem['quiz'] | null;
  created_at: string | null;
};

type ProgressRow = {
  word_id: number;
  status: string;
  box_level: number;
  next_review_date: string;
};

export function getWordStatusEmoji(status: string | null): string {
  if (!status || status === 'not_started') return '⚪';
  if (status === 'mastered') return '🟢';
  return '🟡';
}

export function getWordStatusLabel(status: string | null): string {
  if (!status || status === 'not_started') return 'Не розпочато';
  if (status === 'mastered') return 'Вивчено';
  if (status === 'review_needed') return 'Потребує повторення';
  return 'В процесі';
}

function mapDbWordToItem(
  word: DbWord,
  packetId: string,
  progress: { status: MasteryStatus; boxLevel: number; nextReviewDate: string } | null
): VocabularyItem {
  const p = progress || {
    status: 'learning' as MasteryStatus,
    boxLevel: 1,
    nextReviewDate: new Date().toISOString(),
  };
  return {
    id: String(word.id),
    word: word.word,
    phonetic: word.phonetic || '',
    partOfSpeech: (word.part_of_speech as VocabularyItem['partOfSpeech']) || 'noun',
    cefrLevel: (word.cefr_level as VocabularyItem['cefrLevel']) || 'B1',
    primaryTranslation: word.primary_translation || '',
    alternativeTranslations: word.alternative_translations || [],
    definition: word.definition || '',
    mnemonicHint: word.mnemonic_hint || '',
    collocations: word.collocations || [],
    contextExamples: word.context_examples || [],
    synonyms: word.synonyms || [],
    antonyms: word.antonyms || [],
    quiz: word.quiz || { question: '', options: [], correctIndex: 0 },
    status: p.status,
    boxLevel: p.boxLevel,
    nextReviewDate: p.nextReviewDate,
    addedBy: 'teacher',
    wordpackId: packetId,
    createdAt: word.created_at || new Date().toISOString(),
  };
}

export async function loadStudentProgressMap(
  supabase: SupabaseClient,
  studentId: string
): Promise<Map<string, { status: MasteryStatus; boxLevel: number; nextReviewDate: string }>> {
  const { data, error } = await supabase
    .from('student_word_progress')
    .select('word_id, status, box_level, next_review_date')
    .eq('student_id', studentId);

  const map = new Map<string, { status: MasteryStatus; boxLevel: number; nextReviewDate: string }>();
  if (error) {
    console.error('loadStudentProgressMap: failed to load student progress:', error);
    return map;
  }
  if (!data) return map;

  (data as ProgressRow[]).forEach((row) => {
    map.set(String(row.word_id), {
      status: (row.status as MasteryStatus) || 'learning',
      boxLevel: row.box_level || 1,
      nextReviewDate: row.next_review_date || new Date().toISOString(),
    });
  });
  return map;
}

export async function upsertWordProgress(
  supabase: SupabaseClient,
  studentId: string,
  wordId: string,
  status: MasteryStatus,
  boxLevel: number
): Promise<{ error: Error | null }> {
  const wordIdNum = Number(wordId);
  if (Number.isNaN(wordIdNum)) {
    return { error: new Error('Invalid word id') };
  }

  const { error } = await supabase.from('student_word_progress').upsert(
    {
      student_id: studentId,
      word_id: wordIdNum,
      status,
      box_level: boxLevel,
      next_review_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'student_id,word_id' }
  );

  if (error) {
    console.error('upsertWordProgress: failed to upsert word progress:', error);
  }
  return { error: error ? new Error(error.message) : null };
}

export async function loadStudentAssignedPacks(
  supabase: SupabaseClient,
  studentId: string
): Promise<{ items: VocabularyItem[]; packs: WordPacket[] }> {
  const { data: assignments, error: assignError } = await supabase
    .from('packet_assignments')
    .select('packet_id, due_date')
    .eq('student_id', studentId);

  if (assignError) {
    console.error('loadStudentAssignedPacks: failed to load assignments:', assignError);
    return { items: [], packs: [] };
  }
  if (!assignments?.length) {
    return { items: [], packs: [] };
  }

  const packetIds = assignments.map((a) => a.packet_id);
  const dueDateByPacket = new Map(assignments.map((a) => [a.packet_id, a.due_date]));

  const { data: packets, error: packetError } = await supabase
    .from('word_packets')
    .select('id, teacher_id, title, target_language, level, created_at')
    .in('id', packetIds);

  if (packetError) {
    console.error('loadStudentAssignedPacks: failed to load packets:', packetError);
    return { items: [], packs: [] };
  }
  if (!packets?.length) {
    return { items: [], packs: [] };
  }

  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select(
      'id, packet_id, word, phonetic, part_of_speech, cefr_level, primary_translation, alternative_translations, definition, mnemonic_hint, collocations, context_examples, synonyms, antonyms, quiz, created_at'
    )
    .in('packet_id', packetIds);

  if (wordsError) {
    console.error('loadStudentAssignedPacks: failed to load words:', wordsError);
    return { items: [], packs: [] };
  }

  const progressMap = await loadStudentProgressMap(supabase, studentId);

  const wordsByPacket = new Map<number, DbWord[]>();
  ((words || []) as DbWord[]).forEach((w) => {
    const list = wordsByPacket.get(w.packet_id) || [];
    list.push(w);
    wordsByPacket.set(w.packet_id, list);
  });

  const fetchedItems: VocabularyItem[] = [];
  const assigned: WordPacket[] = [];

  packets.forEach((packet) => {
    const packetId = String(packet.id);
    const packetWords = (wordsByPacket.get(packet.id) || []).map((word) =>
      mapDbWordToItem(word, packetId, progressMap.get(String(word.id)) || null)
    );

    fetchedItems.push(...packetWords);
    assigned.push({
      id: packetId,
      teacherId: packet.teacher_id || '',
      title: packet.title,
      targetLanguage: packet.target_language,
      level: packet.level,
      createdAt: packet.created_at || new Date().toISOString(),
      dueDate: dueDateByPacket.get(packet.id) || undefined,
      assignedStudentIds: [studentId],
      words: packetWords,
    });
  });

  return { items: fetchedItems, packs: assigned };
}

export async function loadTeacherStudentPacks(
  supabase: SupabaseClient,
  studentId: string
): Promise<WordPacket[]> {
  const { data: assignments, error: assignError } = await supabase
    .from('packet_assignments')
    .select('packet_id, due_date')
    .eq('student_id', studentId);

  if (assignError) {
    console.error('loadTeacherStudentPacks: failed to load assignments:', assignError);
    return [];
  }
  if (!assignments?.length) return [];

  const packetIds = assignments.map((a) => a.packet_id);
  const dueDateByPacket = new Map(assignments.map((a) => [a.packet_id, a.due_date]));

  const { data: packets, error: packetsError } = await supabase
    .from('word_packets')
    .select('id, teacher_id, title, target_language, level, created_at')
    .in('id', packetIds);

  if (packetsError) {
    console.error('loadTeacherStudentPacks: failed to load packets:', packetsError);
    return [];
  }
  if (!packets?.length) return [];

  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('id, packet_id, word, primary_translation')
    .in('packet_id', packetIds);

  if (wordsError) {
    console.error('loadTeacherStudentPacks: failed to load words:', wordsError);
    return [];
  }

  const progressMap = await loadStudentProgressMap(supabase, studentId);

  const wordsByPacket = new Map<number, NonNullable<typeof words>>();
  (words || []).forEach((w) => {
    const list = wordsByPacket.get(w.packet_id) || [];
    list.push(w);
    wordsByPacket.set(w.packet_id, list);
  });

  return packets.map((packet) => {
    const packetId = String(packet.id);
    const packetWords = (wordsByPacket.get(packet.id) || []).map((word) => {
      const progress = progressMap.get(String(word.id));
      const status: MasteryStatus | 'not_started' = progress ? progress.status : 'not_started';
      return {
        id: String(word.id),
        word: word.word,
        primaryTranslation: word.primary_translation,
        status: status as MasteryStatus,
        boxLevel: progress?.boxLevel ?? 1,
        nextReviewDate: progress?.nextReviewDate ?? new Date().toISOString(),
        phonetic: '',
        partOfSpeech: 'noun' as const,
        cefrLevel: 'B1' as const,
        alternativeTranslations: [],
        definition: '',
        mnemonicHint: '',
        collocations: [],
        contextExamples: [],
        synonyms: [],
        antonyms: [],
        quiz: { question: '', options: [], correctIndex: 0 },
        addedBy: 'teacher' as const,
        wordpackId: packetId,
        createdAt: new Date().toISOString(),
      } satisfies VocabularyItem;
    });

    return {
      id: packetId,
      teacherId: packet.teacher_id,
      title: packet.title,
      targetLanguage: packet.target_language,
      level: packet.level,
      createdAt: packet.created_at,
      dueDate: dueDateByPacket.get(packet.id) || undefined,
      assignedStudentIds: [studentId],
      words: packetWords,
    };
  });
}

export interface TeacherLibraryPack {
  id: string;
  title: string;
  targetLanguage: string;
  level: string;
  createdAt: string;
  wordCount: number;
  assignedCount: number;
}

export async function loadTeacherPackLibrary(
  supabase: SupabaseClient,
  teacherId: string
): Promise<TeacherLibraryPack[]> {
  const { data: packets, error } = await supabase
    .from('word_packets')
    .select('id, title, target_language, level, created_at')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('loadTeacherPackLibrary: failed to load packets:', error);
    return [];
  }
  if (!packets?.length) return [];

  const packetIds = packets.map((p) => p.id);

  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('id, packet_id')
    .in('packet_id', packetIds);

  if (wordsError) {
    console.error('loadTeacherPackLibrary: failed to load words:', wordsError);
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from('packet_assignments')
    .select('packet_id, student_id')
    .in('packet_id', packetIds);

  if (assignmentsError) {
    console.error('loadTeacherPackLibrary: failed to load assignments:', assignmentsError);
  }

  const wordCountByPacket = new Map<number, number>();
  (words || []).forEach((w) => {
    wordCountByPacket.set(w.packet_id, (wordCountByPacket.get(w.packet_id) || 0) + 1);
  });

  const assignCountByPacket = new Map<number, Set<string>>();
  (assignments || []).forEach((a) => {
    const set = assignCountByPacket.get(a.packet_id) || new Set();
    set.add(a.student_id);
    assignCountByPacket.set(a.packet_id, set);
  });

  return packets.map((p) => ({
    id: String(p.id),
    title: p.title,
    targetLanguage: p.target_language,
    level: p.level || 'B1',
    createdAt: p.created_at,
    wordCount: wordCountByPacket.get(p.id) || 0,
    assignedCount: assignCountByPacket.get(p.id)?.size || 0,
  }));
}

export async function deletePacketAssignment(
  supabase: SupabaseClient,
  studentId: string,
  packetId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('packet_assignments')
    .delete()
    .eq('packet_id', packetId)
    .eq('student_id', studentId);

  if (error) {
    console.error('deletePacketAssignment: failed to delete assignment:', error);
    return { error: new Error(error.message) };
  }

  return { error: null };
}

export async function deleteWordPacket(
  supabase: SupabaseClient,
  packetId: string
): Promise<{ error: Error | null }> {
  // Deleting from word_packets cascades to packet_assignments and words via FK ON DELETE CASCADE,
  // but we also delete related rows explicitly for robustness.

  const { error: assignError } = await supabase
    .from('packet_assignments')
    .delete()
    .eq('packet_id', packetId);
  if (assignError) {
    console.error('deleteWordPacket: failed to delete assignments:', assignError);
    return { error: new Error(assignError.message) };
  }

  const { error: wordsError } = await supabase
    .from('words')
    .delete()
    .eq('packet_id', packetId);
  if (wordsError) {
    console.error('deleteWordPacket: failed to delete words:', wordsError);
    return { error: new Error(wordsError.message) };
  }

  const { error: packetError } = await supabase
    .from('word_packets')
    .delete()
    .eq('id', packetId);
  if (packetError) {
    console.error('deleteWordPacket: failed to delete packet:', packetError);
    return { error: new Error(packetError.message) };
  }

  return { error: null };
}
