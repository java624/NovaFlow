'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { VocabularyItem, WordPacket } from '@/types/vocabulary';
import { StudentProfile } from './types';

interface AssignVocabularyModalProps {
  students?: StudentProfile[];
  student?: StudentProfile;
  visible: boolean;
  onClose: () => void;
  onAssigned: (pack: WordPacket) => void;
  teacherId?: string;
}

const TARGET_LANGUAGES = [
  { value: 'English', label: '🇬🇧 Англійська' },
  { value: 'German', label: '🇩🇪 Німецька' },
  { value: 'French', label: '🇫🇷 Французька' },
  { value: 'Spanish', label: '🇪🇸 Іспанська' },
  { value: 'Polish', label: '🇵🇱 Польська' },
  { value: 'Italian', label: '🇮🇹 Італійська' },
  { value: 'Ukrainian', label: '🇺🇦 Українська' },
];

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function AssignVocabularyModal({
  students,
  student,
  visible,
  onClose,
  onAssigned,
  teacherId,
}: AssignVocabularyModalProps) {
  const supabase = useMemo(() => createClient(), []);
  const [rawInput, setRawInput] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [level, setLevel] = useState('B1');
  const [dueDate, setDueDate] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<VocabularyItem[] | null>(null);
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const availableStudents = useMemo(() => {
    if (students && students.length > 0) return students;
    return student ? [student] : [];
  }, [students, student]);

  const isSingleStudentMode = Boolean(student && (!students || students.length === 0));
  const noStudents = availableStudents.length === 0;

  useEffect(() => {
    if (isSingleStudentMode && availableStudents.length === 1) {
      setSelectedStudentIds([availableStudents[0].id]);
    }
  }, [availableStudents, isSingleStudentMode]);

  const handleGenerate = useCallback(async () => {
    if (!rawInput.trim()) {
      setError('Введіть список слів для генерації.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setPreviewItems(null);

    try {
      const res = await fetch('/api/vocabulary/generate-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput, targetLanguage, level }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Помилка генерації пакету слів.');
      }

      setPreviewItems(data.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не вдалося згенерувати пакет.');
    } finally {
      setIsGenerating(false);
    }
  }, [rawInput, targetLanguage, level]);

  const handleAssign = useCallback(async () => {
    if (!previewItems || previewItems.length === 0) return;
    if (selectedStudentIds.length === 0) {
      setError('Оберіть хоча б одного учня для призначення пакету.');
      return;
    }

    // Ensure we have teacherId: prefer prop, otherwise read from session
    let effectiveTeacherId = teacherId;
    if (!effectiveTeacherId) {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          setError('Не вдалося визначити ID вчителя з сесії.');
          return;
        }
        effectiveTeacherId = userData.user.id;
      } catch (err) {
        console.error('Failed to resolve teacher ID from session:', err);
        setError('Не вдалося визначити ID вчителя з сесії.');
        return;
      }
    }

    const autoTitle =
      title.trim() ||
      `Пакет: ${previewItems
        .slice(0, 3)
        .map((w) => w.primaryTranslation || w.word)
        .join(', ')}${previewItems.length > 3 ? '...' : ''}`;

    // 1) Insert packet (with RLS fallback to localStorage)
    let packetId = '';
    let packetData: any = null;
    try {
      const insertRes = await supabase
        .from('word_packets')
        .insert({
          teacher_id: effectiveTeacherId,
          title: autoTitle,
          target_language: targetLanguage,
          level,
        })
        .select()
        .single();

      if (insertRes.error || !insertRes.data) {
        throw insertRes.error || new Error('Unknown insert error');
      }

      packetData = insertRes.data;
      packetId = String(packetData.id);
    } catch (err: any) {
      console.error('Failed to insert word_packets:', err);
      const isRlsError =
        (err && (err.code === '42P17' || err.status === 500)) ||
        (err && typeof err.message === 'string' && err.message.toLowerCase().includes('infinite recursion'));

      if (isRlsError) {
        // Fallback: persist locally so UI remains usable while RLS is fixed.
        const localPackId = `pack_${Date.now()}`;
        const createdAt = new Date().toISOString();

        const localWords: VocabularyItem[] = previewItems.map((item, index) => ({
          ...item,
          id: `localword_${Date.now()}_${index}`,
          wordpackId: localPackId,
          addedBy: 'teacher',
          status: item.status || 'learning',
          boxLevel: item.boxLevel || 1,
          nextReviewDate: item.nextReviewDate || new Date().toISOString(),
          createdAt: item.createdAt || createdAt,
        }));

        const localPack: WordPacket = {
          id: localPackId,
          teacherId: effectiveTeacherId!,
          title: autoTitle,
          targetLanguage,
          level,
          createdAt,
          dueDate: dueDate || undefined,
          assignedStudentIds: selectedStudentIds,
          words: localWords,
        };

        try {
          const existingPacks = JSON.parse(localStorage.getItem('novaflow_assigned_packs_v1') || '[]');
          existingPacks.push(localPack);
          localStorage.setItem('novaflow_assigned_packs_v1', JSON.stringify(existingPacks));

          const existingWords = JSON.parse(localStorage.getItem('novaflow_vocabulary_items_v1') || '[]');
          const toSaveWords = localWords.map((w) => ({ ...w }));
          localStorage.setItem('novaflow_vocabulary_items_v1', JSON.stringify(existingWords.concat(toSaveWords)));
        } catch (e) {
          console.error('Failed to save local pack/words', e);
        }

        try {
          // notify user and parent via toast
          toast.success('✨ Пакет призначено (збережено локально)');
        } catch (e) {
          console.error('Toast notify failed', e);
        }

        onAssigned(localPack);
        onClose();
        setRawInput('');
        setTitle('');
        setDueDate('');
        setPreviewItems(null);
        setExpandedPreviewId(null);
        setSelectedStudentIds([]);
        return;
      }

      setError('Не вдалося створити пакет у базі даних.');
      return;
    }

    // 2) Insert words (single batch)
    const wordsToInsert = previewItems.map((item) => ({
      packet_id: packetId,
      owner_student_id: null,
      word: item.word,
      phonetic: item.phonetic || '',
      part_of_speech: item.partOfSpeech,
      cefr_level: item.cefrLevel,
      primary_translation: item.primaryTranslation,
      alternative_translations: item.alternativeTranslations || [],
      definition: item.definition || '',
      mnemonic_hint: item.mnemonicHint || '',
      collocations: item.collocations || [],
      context_examples: item.contextExamples || [],
      synonyms: item.synonyms || [],
      antonyms: item.antonyms || [],
      quiz: item.quiz || { question: '', options: [], correctIndex: 0 },
    }));

    const { data: createdWords, error: wordsError } = await supabase
      .from('words')
      .insert(wordsToInsert)
      .select('id');

    if (wordsError || !createdWords) {
      console.error('Failed to insert words:', wordsError);
      setError('Пакет створено, але слова не вдалося зберегти.');
      return;
    }

    // 3) Insert assignments. Try bulk first; on failure try per-student to find failures.
    const assignments = selectedStudentIds.map((studentId) => ({
      packet_id: packetId,
      student_id: studentId,
      due_date: dueDate || null,
    }));

    const { error: assignmentError } = await supabase.from('packet_assignments').insert(assignments);

    let failedStudentIds: string[] = [];
    if (assignmentError) {
      console.error('Failed to insert packet_assignments (bulk):', assignmentError);
      // Try per-student to collect which failed
      for (const studentId of selectedStudentIds) {
        try {
          const { error: singleErr } = await supabase.from('packet_assignments').insert({
            packet_id: packetId,
            student_id: studentId,
            due_date: dueDate || null,
          });
          if (singleErr) {
            console.error(`Failed to assign packet to student ${studentId}:`, singleErr);
            failedStudentIds.push(studentId);
          }
        } catch (e) {
          console.error(`Failed to assign packet to student ${studentId}:`, e);
          failedStudentIds.push(studentId);
        }
      }
    }

    // Build packet object to return
    const packet: WordPacket = {
      id: packetId,
      teacherId: effectiveTeacherId!,
      title: autoTitle,
      targetLanguage,
      level,
      createdAt: packetData.created_at || new Date().toISOString(),
      dueDate: dueDate || undefined,
      assignedStudentIds: selectedStudentIds.filter((id) => !failedStudentIds.includes(id)),
      words: previewItems.map((item, index) => ({
        ...item,
        id: String(createdWords[index]?.id || item.id),
        wordpackId: packetId,
        addedBy: 'teacher' as const,
      })),
    };

    if (failedStudentIds.length > 0) {
      const idToName = new Map(availableStudents.map((s) => [s.id, s.full_name]));
      const failedNames = failedStudentIds.map((id) => idToName.get(id) || id);
      setError(`Пакет створено, але не вдалося призначити наступним учням: ${failedNames.join(', ')}`);
      // still notify parent about partial success
      onAssigned(packet);
      return;
    }

    // Success
    onAssigned(packet);
    onClose();
    setRawInput('');
    setTitle('');
    setDueDate('');
    setPreviewItems(null);
    setExpandedPreviewId(null);
    setSelectedStudentIds([]);
  }, [previewItems, title, targetLanguage, level, dueDate, selectedStudentIds, teacherId, onAssigned, onClose, supabase, availableStudents]);

  const handleBackToEdit = () => {
    setPreviewItems(null);
    setExpandedPreviewId(null);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isGenerating) onClose();
      }}
    >
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none disabled:opacity-40"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">📦</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Задати пакет слів</h2>
            <p className="text-sm text-gray-500">
              {isSingleStudentMode ? (
                <>Учень: <span className="font-semibold text-purple-700">{availableStudents[0]?.full_name}</span></>
              ) : (
                'Оберіть учнів для пакету'
              )}
            </p>
          </div>
        </div>

        {noStudents ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Не знайдено жодного учня для призначення. Закрийте модальне вікно та виберіть учня.
          </div>
        ) : null}

        {!previewItems ? (
          <>
            {isSingleStudentMode ? (
              <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Учитель призначає пакет одному учню: <span className="font-semibold text-purple-700">{availableStudents[0]?.full_name}</span>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  👥 Обрати учнів
                </label>
                <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 p-3 bg-gray-50">
                  {availableStudents.map((studentItem) => {
                    const checked = selectedStudentIds.includes(studentItem.id);
                    return (
                      <button
                        key={studentItem.id}
                        type="button"
                        onClick={() =>
                          setSelectedStudentIds((prev) =>
                            checked ? prev.filter((id) => id !== studentItem.id) : [...prev, studentItem.id]
                          )
                        }
                        className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-all ${
                          checked ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {studentItem.full_name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                📝 Слова українською (через кому, пробіл або новий рядок)
              </label>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                rows={4}
                placeholder="наприклад: літак, затримка рейсу, посадковий талон багаж"
                disabled={isGenerating}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-y disabled:opacity-50"
              />
              <p className="text-xs text-gray-400 mt-1">
                ШІ розбере кожне слово, згенерує переклад, приклади речень та пояснення. Максимум 30 слів.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  🌍 Мова, якою учень вивчає
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all disabled:opacity-50"
                >
                  {TARGET_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">📊 Рівень</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all disabled:opacity-50"
                >
                  {CEFR_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
              <h3 className="text-sm font-bold text-purple-900 mb-1">
                ✨ Пакет сформовано — {previewItems.length} слів ({targetLanguage})
              </h3>
              <p className="text-xs text-purple-700">
                Перевірте картки перед надсиланням. Натисніть на слово, щоб побачити деталі.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto mb-4">
              {previewItems.map((item) => {
                const isExpanded = expandedPreviewId === item.id;
                return (
                  <div key={item.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedPreviewId(isExpanded ? null : item.id)}
                      className="w-full flex items-center justify-between gap-2 bg-white px-3 py-2.5 text-left hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-900 text-sm">{item.word}</span>
                        <span className="text-purple-700 text-sm ml-2">{item.primaryTranslation}</span>
                      </div>
                      <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 bg-gray-50 text-xs space-y-2 border-t border-gray-100">
                        {item.definition && (
                          <p className="text-gray-600">
                            <span className="font-semibold">Пояснення:</span> {item.definition}
                          </p>
                        )}
                        {item.contextExamples?.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-700">Приклади:</span>
                            {item.contextExamples.slice(0, 2).map((ex, i) => (
                              <p key={i} className="text-gray-600 mt-0.5 pl-2 border-l-2 border-purple-200">
                                {ex.sentence}
                                <br />
                                <span className="text-gray-400">{ex.translation}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  📅 Вивчити до (необов&apos;язково)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  🏷️ Назва пакету (необов&apos;язково)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ШІ згенерує назву автоматично"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                />
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200 mb-4">
            ❌ {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={previewItems ? handleBackToEdit : onClose}
            disabled={isGenerating}
            className="flex-1 px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {previewItems ? '← Редагувати список' : 'Скасувати'}
          </button>
          {!previewItems ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !rawInput.trim() || selectedStudentIds.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ШІ розбирає слова...
                </>
              ) : (
                '🪄 Сформувати пакет'
              )}
            </button>
          ) : (
            <button
              onClick={handleAssign}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
            >
              📤 Надіслати {selectedStudentIds.length} учням
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
