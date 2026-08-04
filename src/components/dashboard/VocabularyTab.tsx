'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  VocabularyItem,
  CEFRLevel,
  StudyMode,
  MasteryStatus,
  WordPacket,
} from '@/types/vocabulary';
import {
  calculateVocabularyStats,
  calculateAssignedProgress,
} from '@/lib/mockVocabularyData';
import PackStudyView from '@/components/vocabulary/PackStudyView';

interface VocabularyTabProps {
  studentId?: string;
}
// Alias available to all components in this module
type AssignedWordpack = WordPacket;

export default function VocabularyTab({ studentId }: VocabularyTabProps) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [assignedPacks, setAssignedPacks] = useState<WordPacket[]>([]);
  const [activeMode, setActiveMode] = useState<StudyMode>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedWordCard, setSelectedWordCard] = useState<VocabularyItem | null>(null);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(null);
  const [studyPack, setStudyPack] = useState<WordPacket | null>(null);

  const activeStudyItems = useMemo(() => {
    if (!selectedPacketId) return items;
    return items.filter((item) => item.wordpackId === selectedPacketId);
  }, [items, selectedPacketId]);

  const handleStartStudyPacket = (packId: string, mode: StudyMode) => {
    const pack = assignedPacks.find((p) => p.id === packId);
    if (pack) {
      setStudyPack(pack);
      setSelectedPacketId(packId);
      setActiveMode(mode);
    }
  };

  const handleCloseStudyPack = () => {
    setStudyPack(null);
    setSelectedPacketId(null);
    setActiveMode('browse');
  };

  const handleStudyWordsUpdated = useCallback(
    (updatedWords: VocabularyItem[]) => {
      setAssignedPacks((prev) =>
        prev.map((p) =>
          p.id === studyPack?.id ? { ...p, words: updatedWords } : p
        )
      );
      setItems((prev) => {
        const updatedById = new Map(updatedWords.map((w) => [w.id, w]));
        return prev.map((item) => updatedById.get(item.id) || item);
      });
    },
    [studyPack?.id]
  );

  const handleSaveProgress = useCallback(
    async (wordId: string, status: MasteryStatus, boxLevel: number = 1) => {
      if (!studentId) return;
      const wordIdNum = Number(wordId);
      if (Number.isNaN(wordIdNum)) return;

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
        console.error('Failed to update student word progress', error);
      }
    },
    [studentId, supabase]
  );

  

  // Modal State for adding new word
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWordInput, setNewWordInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const loadVocabulary = useCallback(async () => {
    if (!studentId) return;

    const { data: assignments, error: assignError } = await supabase
      .from('packet_assignments')
      .select('packet_id, due_date')
      .eq('student_id', studentId);

    if (assignError) {
      console.error('Failed to load vocabulary assignments', assignError);
      return;
    }

    if (!assignments?.length) {
      setItems([]);
      setAssignedPacks([]);
      return;
    }

    const packetIds = assignments.map((a) => a.packet_id);
    const dueDateByPacket = new Map(assignments.map((a) => [a.packet_id, a.due_date]));

    const { data: packets, error: packetError } = await supabase
      .from('word_packets')
      .select('id, teacher_id, title, target_language, level, created_at')
      .in('id', packetIds);

    if (packetError) {
      console.error('Failed to load word packets', packetError);
      return;
    }

    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, packet_id, word, phonetic, part_of_speech, cefr_level, primary_translation, alternative_translations, definition, mnemonic_hint, collocations, context_examples, synonyms, antonyms, quiz, created_at')
      .in('packet_id', packetIds);

    if (wordsError) {
      console.error('Failed to load words', wordsError);
      return;
    }

    const progressRows = await supabase
      .from('student_word_progress')
      .select('word_id, status, box_level, next_review_date')
      .eq('student_id', studentId);

    const progressMap = new Map<string, { status: MasteryStatus; boxLevel: number; nextReviewDate: string }>();
    if (!progressRows.error && progressRows.data) {
      progressRows.data.forEach((row) => {
        progressMap.set(String(row.word_id), {
          status: (row.status as MasteryStatus) || 'learning',
          boxLevel: row.box_level || 1,
          nextReviewDate: row.next_review_date || new Date().toISOString(),
        });
      });
    }

    const wordsByPacket = new Map<number, NonNullable<typeof words>>();
    (words || []).forEach((w) => {
      const list = wordsByPacket.get(w.packet_id) || [];
      list.push(w);
      wordsByPacket.set(w.packet_id, list);
    });

    const fetchedItems: VocabularyItem[] = [];
    const assigned: WordPacket[] = [];

    (packets || []).forEach((packet) => {
      const packetWords = (wordsByPacket.get(packet.id) || []).map((word) => {
        const progress = progressMap.get(String(word.id)) || {
          status: 'learning' as MasteryStatus,
          boxLevel: 1,
          nextReviewDate: new Date().toISOString(),
        };
        return {
          id: String(word.id),
          word: word.word,
          phonetic: word.phonetic || '',
          partOfSpeech: word.part_of_speech || 'noun',
          cefrLevel: word.cefr_level || 'B1',
          primaryTranslation: word.primary_translation || '',
          alternativeTranslations: word.alternative_translations || [],
          definition: word.definition || '',
          mnemonicHint: word.mnemonic_hint || '',
          collocations: word.collocations || [],
          contextExamples: word.context_examples || [],
          synonyms: word.synonyms || [],
          antonyms: word.antonyms || [],
          quiz: word.quiz || { question: '', options: [], correctIndex: 0 },
          status: progress.status,
          boxLevel: progress.boxLevel,
          nextReviewDate: progress.nextReviewDate,
          addedBy: 'teacher',
          wordpackId: String(packet.id),
          createdAt: word.created_at || new Date().toISOString(),
        } as VocabularyItem;
      });

      fetchedItems.push(...packetWords);
      assigned.push({
        id: String(packet.id),
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

    setItems(fetchedItems);
    setAssignedPacks(assigned);
  }, [studentId, supabase]);

  useEffect(() => {
    loadVocabulary();
  }, [loadVocabulary]);

  const updateItems = (newItems: VocabularyItem[]) => {
    setItems(newItems);
  };

  const updateAssignedPacks = (packs: WordPacket[]) => {
    setAssignedPacks(packs);
  };

  // Calculated Statistics
  const stats = useMemo(() => calculateVocabularyStats(items), [items]);
  const assignedProgress = useMemo(
    () => calculateAssignedProgress(assignedPacks),
    [assignedPacks]
  );

  // Filtered vocabulary list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.primaryTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mnemonicHint.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'ALL' || item.cefrLevel === selectedLevel;
      const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [items, searchQuery, selectedLevel, selectedStatus]);

  // Handle Speech Synthesis
  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Add word with AI Generation
  const handleAddWordAI = async () => {
    if (!newWordInput.trim()) return;
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch('/api/vocabulary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: newWordInput,
          targetLanguage: 'English',
          nativeLanguage: 'Ukrainian'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Помилка при генерації картки слова.');
      }

      const newItem: VocabularyItem = data.item;
      updateItems([newItem, ...items]);
      setSelectedWordCard(newItem);
      setNewWordInput('');
      setShowAddModal(false);
    } catch (err: any) {
      setGenerateError(err.message || 'Не вдалося додати слово');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update mastery status
  const handleToggleMastery = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = items.find((item) => item.id === id);
    if (!target || !studentId) return;

    const newStatus: MasteryStatus = target.status === 'mastered' ? 'learning' : 'mastered';
    const toggledItem: VocabularyItem = {
      ...target,
      status: newStatus,
      boxLevel: newStatus === 'mastered' ? 5 : 1,
    };

    const nextItems = items.map((item) => (item.id === id ? toggledItem : item));
    updateItems(nextItems);

    const { error } = await supabase.from('student_word_progress').upsert({
      student_id: studentId,
      word_id: id,
      status: newStatus,
      box_level: toggledItem.boxLevel,
      next_review_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'student_id,word_id' });

    if (error) {
      console.error('Failed to update progress', error);
    }
  };

  // Delete word
  const handleDeleteWord = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateItems(items.filter((item) => item.id !== id));
    if (selectedWordCard?.id === id) setSelectedWordCard(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-purple-200 mb-3 border border-white/10">
              <span>🧠 Smart Vocabulary Engine</span>
              <span>•</span>
              <span>Spaced Repetition (SRS)</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Мій словник
            </h1>
            <p className="text-purple-200 mt-2 max-w-xl text-sm md:text-base">
              Ваш особистий словник і завдання від вчителя. Вивчайте слова з прикладами, поясненнями та тренуваннями!
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
          >
            <span className="text-xl">+</span>
            <span>Додати слово через ШІ</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-xs text-purple-300 font-medium">У моєму словнику</span>
            <div className="text-2xl font-bold mt-1 text-white">{stats.totalWords}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-xs text-emerald-300 font-medium">Вивчено</span>
            <div className="text-2xl font-bold mt-1 text-emerald-400">{stats.masteredWords}</div>
          </div>
          {assignedProgress.total > 0 && (
            <>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-sky-300 font-medium">Задано вчителем</span>
                <div className="text-2xl font-bold mt-1 text-sky-300">{assignedProgress.total}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-amber-300 font-medium">Залишилось</span>
                <div className="text-2xl font-bold mt-1 text-amber-400">{assignedProgress.remaining}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-pink-300 font-medium">Прогрес завдань</span>
                <div className="text-2xl font-bold mt-1 text-pink-300">{assignedProgress.percent}%</div>
              </div>
            </>
          )}
          {assignedProgress.total === 0 && (
            <>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-amber-300 font-medium">Потрібно повторити</span>
                <div className="text-2xl font-bold mt-1 text-amber-400">{stats.dueForReview}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-pink-300 font-medium">На вивченні</span>
                <div className="text-2xl font-bold mt-1 text-pink-300">{stats.learningWords}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Assigned Packs from Teacher */}
      {assignedPacks.length > 0 && (
        <AssignedPacksSection
          packs={assignedPacks}
          personalItems={items}
          onUpdatePacks={updateAssignedPacks}
          onSyncPersonalItems={updateItems}
          onToggleMastery={handleToggleMastery}
          onStartStudyPacket={handleStartStudyPacket}
        />
      )}

      {/* Selected Packet Banner */}
      {selectedPacketId && activeMode !== 'browse' && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-purple-950 font-medium shadow-2xs">
          <div className="flex items-center gap-2">
            <span>📚</span>
            <span>
              Режим вивчення пакета: <strong>{assignedPacks.find((p) => p.id === selectedPacketId)?.title || 'Пакет'}</strong> ({activeStudyItems.length} слів)
            </span>
          </div>
          <button
            onClick={() => setSelectedPacketId(null)}
            className="px-3 py-1 bg-white hover:bg-purple-100 rounded-lg text-purple-700 font-bold border border-purple-200 transition-colors text-xs"
          >
            Показати всі слова
          </button>
        </div>
      )}

      {/* Mastered Vocabulary Archive */}
      <MasteredArchiveSection
        items={items}
        searchQuery={archiveSearch}
        setSearchQuery={setArchiveSearch}
      />

      {/* Navigation & Study Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 md:p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'browse', label: '📖 Мої слова', icon: '📖' },
            { id: 'flashcards', label: '🗂 Картки (3D)', icon: '🗂' },
            { id: 'match', label: '⚡ З’єднай пари', icon: '⚡' },
            { id: 'quiz', label: '✍️ Практика / Тест', icon: '✍️' },
            { id: 'ai_chat', label: '💬 AI-Практика', icon: '💬' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id as StudyMode)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs md:text-sm whitespace-nowrap transition-all ${
                activeMode === mode.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {activeMode === 'browse' && (
          <div className="text-xs text-gray-500 font-medium px-2">
            Знайдено слів: <span className="font-bold text-gray-900">{filteredItems.length}</span>
          </div>
        )}
      </div>

      {/* RENDER MODES */}
      {activeMode === 'browse' && (
        <BrowseModeSection
          items={filteredItems}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          onSelectCard={(item) => setSelectedWordCard(item)}
          onSpeak={handleSpeak}
          onToggleMastery={handleToggleMastery}
          onDeleteWord={handleDeleteWord}
          onOpenAddModal={() => setShowAddModal(true)}
        />
      )}

      {activeMode === 'flashcards' && (
        <FlashcardsStudyMode
          items={activeStudyItems}
          onUpdateItems={updateItems}
          onSpeak={handleSpeak}
          onSaveProgress={handleSaveProgress}
          onBack={() => {
            setActiveMode('browse');
            setSelectedPacketId(null);
          }}
        />
      )}

      {activeMode === 'match' && (
        <MatchPairsStudyMode items={activeStudyItems} onBack={() => setActiveMode('browse')} />
      )}

      {activeMode === 'quiz' && (
        <QuizStudyMode
          items={activeStudyItems}
          onSaveProgress={handleSaveProgress}
          onBack={() => {
            setActiveMode('browse');
            setSelectedPacketId(null);
          }}
        />
      )}

      {activeMode === 'ai_chat' && (
        <AIChatPracticeMode items={items} onBack={() => setActiveMode('browse')} />
      )}

      {/* RICH WORD DETAIL MODAL */}
      {selectedWordCard && (
        <WordDetailModal
          item={selectedWordCard}
          onClose={() => setSelectedWordCard(null)}
          onSpeak={handleSpeak}
          onToggleMastery={handleToggleMastery}
          onDeleteWord={handleDeleteWord}
        />
      )}

      {/* PACK STUDY MODAL (from Assigned Packs — Знаю / Ще вчу + Практика) */}
      {studyPack && studentId && (
        <PackStudyView
          pack={studyPack}
          studentId={studentId}
          onClose={handleCloseStudyPack}
          onWordsUpdated={handleStudyWordsUpdated}
        />
      )}

      {/* ADD WORD MODAL WITH AI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scaleUp border border-purple-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>✨</span> Додати нове слово
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Введіть будь-яке слово або фразу англійською. ШІ сам згенерує переклад, мнемоніку, транскрипцію, контекстні речення та тест!
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Слово або фраза (English)
                </label>
                <input
                  type="text"
                  placeholder="наприклад: Resilience, Pivot, Breakthrough..."
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWordAI()}
                  disabled={isGenerating}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm font-medium"
                />
              </div>

              {generateError && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium">
                  ⚠️ {generateError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isGenerating}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-xs"
                >
                  Скасувати
                </button>

                <button
                  onClick={handleAddWordAI}
                  disabled={isGenerating || !newWordInput.trim()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md shadow-purple-500/20 text-xs flex items-center gap-2 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Генеруємо ШІ...
                    </>
                  ) : (
                    <>
                      <span>🪄 Згенерувати картку</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   ASSIGNED PACKS SECTION (from teacher)
============================================================================ */
function AssignedPacksSection({
  packs,
  personalItems,
  onUpdatePacks,
  onSyncPersonalItems,
  onToggleMastery,
  onStartStudyPacket,
}: {
  packs: AssignedWordpack[];
  personalItems: VocabularyItem[];
  onUpdatePacks: (packs: AssignedWordpack[]) => void;
  onSyncPersonalItems: (items: VocabularyItem[]) => void;
  onToggleMastery: (wordId: string, e?: React.MouseEvent) => void;
  onStartStudyPacket?: (packId: string, mode: StudyMode) => void;
}) {
  const [expandedPackId, setExpandedPackId] = useState<string | null>(null);

  const handleToggleWord = (packId: string, wordId: string, e?: React.MouseEvent) => {
    const pack = packs.find((p) => p.id === packId);
    const target = pack?.words.find((w) => w.id === wordId);
    if (!target) return;

    const newStatus: MasteryStatus = target.status === 'mastered' ? 'learning' : 'mastered';
    const toggledWord: VocabularyItem = {
      ...target,
      status: newStatus,
      boxLevel: newStatus === 'mastered' ? 5 : 1,
    };

    const updated = packs.map((p) => {
      if (p.id !== packId) return p;
      return {
        ...p,
        words: p.words.map((w) => (w.id === wordId ? toggledWord : w)),
      };
    });
    onUpdatePacks(updated);

    const wordText = toggledWord.word.toLowerCase();
    const synced = personalItems.map((item) =>
      item.word.toLowerCase() === wordText
        ? { ...item, status: toggledWord.status, boxLevel: toggledWord.boxLevel }
        : item
    );
    onSyncPersonalItems(synced);

    // Persist via parent handler (which upserts to student_word_progress)
    try {
      onToggleMastery(wordId, e);
    } catch (err) {
      // swallow — UI already updated optimistically
      console.error('Failed to persist mastery toggle', err);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return 'Без дедлайну';
    return new Date(d).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">📦 Завдання від вчителя</h2>
          <p className="text-xs text-gray-500 mt-0.5">Пакети слів, які вам задав викладач</p>
        </div>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
          {packs.length} пакетів
        </span>
      </div>

      <div className="space-y-3">
        {packs.map((pack) => {
          const masteredCount = pack.words.filter((w) => w.status === 'mastered').length;
          const progress = pack.words.length > 0 ? Math.round((masteredCount / pack.words.length) * 100) : 0;
          const isExpanded = expandedPackId === pack.id;

          return (
            <div key={pack.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedPackId(isExpanded ? null : pack.id)}
                className="w-full flex items-center justify-between gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg flex-shrink-0">📚</div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{pack.title}</h3>
                    <p className="text-xs text-gray-500">
                      {pack.targetLanguage} • {masteredCount}/{pack.words.length} слів • Дедлайн: {formatDate(pack.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${progress === 100 ? 'text-emerald-600' : 'text-purple-600'}`}>
                    {progress}%
                  </span>
                  <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                  {onStartStudyPacket && (
                    <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 mr-1">Режими вивчення:</span>
                      <button
                        onClick={() => onStartStudyPacket(pack.id, 'flashcards')}
                        className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        🗂 Флеш-картки
                      </button>
                      <button
                        onClick={() => onStartStudyPacket(pack.id, 'quiz')}
                        className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        ✍️ Практика / Тест
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pack.words.map((word) => (
                      <div
                        key={word.id}
                        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs border ${
                          word.status === 'mastered'
                            ? 'bg-emerald-50 border-emerald-100'
                            : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className={`font-semibold ${word.status === 'mastered' ? 'text-emerald-800 line-through' : 'text-gray-900'}`}>
                            {word.word}
                          </span>
                          <span className="text-gray-500 ml-2">{word.primaryTranslation}</span>
                        </div>
                        <button
                          onClick={(e) => handleToggleWord(pack.id, word.id, e)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                            word.status === 'mastered'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-200 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600'
                          }`}
                          title={word.status === 'mastered' ? 'Повернути у вивчення' : 'Позначити як вивчене'}
                        >
                          ✓
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   MASTERED VOCABULARY ARCHIVE
============================================================================ */
function MasteredArchiveSection({
  items,
  searchQuery,
  setSearchQuery
}: {
  items: VocabularyItem[];
  searchQuery: string;
  setSearchQuery: (s: string) => void;
}) {
  const masteredItems = useMemo(() => {
    return items.filter((item) => item.status === 'mastered');
  }, [items]);

  const filteredMastered = useMemo(() => {
    if (!searchQuery.trim()) return masteredItems;
    const q = searchQuery.toLowerCase();
    return masteredItems.filter(
      (item) =>
        item.word.toLowerCase().includes(q) ||
        item.primaryTranslation.toLowerCase().includes(q)
    );
  }, [masteredItems, searchQuery]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">📋 Вивчені слова</h2>
          <p className="text-xs text-gray-500 mt-0.5">Слово і переклад — без пояснень та прикладів</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Пошук в архіві..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 pl-8 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-medium text-gray-900"
          />
        </div>
      </div>

      {filteredMastered.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm">Поки немає вивчених слів. Позначте слова як вивчені, щоб вони з'явилися тут.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredMastered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-emerald-50/50 border border-emerald-100/50 hover:bg-emerald-50 transition-colors"
            >
              <div className="min-w-0">
                <span className="font-semibold text-gray-900 text-sm">{item.word}</span>
                <span className="text-gray-500 text-xs ml-2">— {item.primaryTranslation}</span>
              </div>
              <span className="flex-shrink-0 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                {item.cefrLevel}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   BROWSE MODE COMPONENT
============================================================================ */
function BrowseModeSection({
  items,
  searchQuery,
  setSearchQuery,
  selectedLevel,
  setSelectedLevel,
  selectedStatus,
  setSelectedStatus,
  onSelectCard,
  onSpeak,
  onToggleMastery,
  onDeleteWord,
  onOpenAddModal
}: {
  items: VocabularyItem[];
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  selectedLevel: string;
  setSelectedLevel: (l: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  onSelectCard: (item: VocabularyItem) => void;
  onSpeak: (text: string, e?: React.MouseEvent) => void;
  onToggleMastery: (id: string, e?: React.MouseEvent) => void;
  onDeleteWord: (id: string, e?: React.MouseEvent) => void;
  onOpenAddModal: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Пошук за словом чи перекладом..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-medium text-gray-900"
          />
        </div>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-3 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-medium text-gray-700"
        >
          <option value="ALL">Всі рівні (A1 – C2)</option>
          <option value="A1">A1 - Beginner</option>
          <option value="A2">A2 - Elementary</option>
          <option value="B1">B1 - Intermediate</option>
          <option value="B2">B2 - Upper Intermediate</option>
          <option value="C1">C1 - Advanced</option>
          <option value="C2">C2 - Proficiency</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-medium text-gray-700"
        >
          <option value="ALL">Всі статуси</option>
          <option value="learning">⏳ У процесі вивчення</option>
          <option value="mastered">✅ Вивчено</option>
          <option value="review_needed">⚠️ Потребує повторення</option>
        </select>
      </div>

      {/* Grid of Cards */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="text-5xl mb-3">📚</div>
          <h3 className="text-lg font-bold text-gray-900">Слів не знайдено</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Спробуйте змінити фільтри або додайте нове слово за допомогою ШІ.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-xs shadow-md"
          >
            + Додати слово
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCard(item)}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full pointer-events-none opacity-10 ${
                  item.cefrLevel.startsWith('C')
                    ? 'bg-purple-600'
                    : item.cefrLevel.startsWith('B')
                    ? 'bg-indigo-600'
                    : 'bg-emerald-600'
                }`}
              />

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                      item.cefrLevel.startsWith('C')
                        ? 'bg-purple-100 text-purple-700'
                        : item.cefrLevel.startsWith('B')
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.cefrLevel} • {item.partOfSpeech}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => onSpeak(item.word, e)}
                      title="Озвучити вимову"
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      🔊
                    </button>
                    <button
                      onClick={(e) => onToggleMastery(item.id, e)}
                      title={item.status === 'mastered' ? 'Повернути у вивчення' : 'Позначити як вивчене'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.status === 'mastered'
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'text-gray-300 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      ✓
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <h4 className="text-xl font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {item.word}
                  </h4>
                  <span className="text-xs text-gray-400 font-mono">{item.phonetic}</span>
                </div>

                <p className="text-sm font-semibold text-purple-700 mt-1">
                  {item.primaryTranslation}
                </p>

                {item.mnemonicHint && (
                  <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-100 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                    <span>💡</span>
                    <span className="line-clamp-2 leading-relaxed">{item.mnemonicHint}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <span>Рівень пам’яті: Box {item.boxLevel}/5</span>
                <span className="text-purple-600 group-hover:underline">Деталі →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   FLASHCARDS STUDY MODE
============================================================================ */
function FlashcardsStudyMode({
  items,
  onUpdateItems,
  onSpeak,
  onSaveProgress,
  onBack
}: {
  items: VocabularyItem[];
  onUpdateItems: (items: VocabularyItem[]) => void;
  onSpeak: (text: string) => void;
  onSaveProgress: (wordId: string, status: MasteryStatus, boxLevel?: number) => Promise<void>;
  onBack: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Немає слів для картки</h3>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">
          Повернутися
        </button>
      </div>
    );
  }

  // Only cycle through words that are not yet mastered, so the learner
  // focuses on remaining items. When everything is mastered the whole pack
  // is used so the UI can show completion.
  const studyPool = useMemo(() => {
    const remaining = items.filter((it) => it.status !== 'mastered');
    return remaining.length > 0 ? remaining : items;
  }, [items]);

  const currentItem = studyPool[currentIndex % studyPool.length];

  const handleNext = (remembered: boolean) => {
    setIsFlipped(false);
    // Update Leitner Box level (persist via student_word_progress)
    const newBox = remembered ? Math.min(5, currentItem.boxLevel + 1) : Math.max(1, currentItem.boxLevel - 1);
    const newStatus: MasteryStatus = newBox === 5 ? 'mastered' : 'learning';

    const updated = items.map((it) => {
      if (it.id === currentItem.id) {
        return {
          ...it,
          boxLevel: newBox,
          status: newStatus
        };
      }
      return it;
    });
    onUpdateItems(updated);
    onSaveProgress(currentItem.id, newStatus, newBox);

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % studyPool.length);
    }, 150);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-xs font-semibold text-purple-600 hover:underline">
          ← Назад до словника
        </button>
        <span className="text-xs font-bold text-gray-400">
          Картка {currentIndex + 1} з {studyPool.length}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[320px] bg-white rounded-3xl p-8 border border-purple-100 shadow-xl cursor-pointer hover:border-purple-300 transition-all flex flex-col justify-between relative text-center select-none"
      >
        <div className="flex justify-between items-center w-full">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
            {currentItem.cefrLevel}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSpeak(currentItem.word);
            }}
            className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-full text-sm"
          >
            🔊 Вимова
          </button>
        </div>

        {!isFlipped ? (
          <div className="my-auto space-y-2">
            <h2 className="text-4xl font-extrabold text-gray-900">{currentItem.word}</h2>
            <p className="text-sm font-mono text-gray-400">{currentItem.phonetic}</p>
            <p className="text-xs text-purple-600 font-semibold mt-4">Клікніть, щоб перевернути 🔄</p>
          </div>
        ) : (
          <div className="my-auto space-y-3">
            <h3 className="text-2xl font-extrabold text-purple-700">
              {currentItem.primaryTranslation}
            </h3>
            <p className="text-xs text-gray-600 italic">"{currentItem.definition}"</p>
            {currentItem.mnemonicHint && (
              <div className="p-3 bg-amber-50 text-amber-900 rounded-2xl text-xs border border-amber-200">
                💡 Мнемоніка: {currentItem.mnemonicHint}
              </div>
            )}
          </div>
        )}

        <div className="text-[11px] text-gray-400 font-medium">
          Рівень коробки SRS: <span className="font-bold text-gray-800">Box {currentItem.boxLevel}/5</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleNext(false)}
          className="py-3.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-2xl border border-amber-200 text-sm shadow-sm transition-all"
        >
          🔄 Ще вчу
        </button>
        <button
          onClick={() => handleNext(true)}
          className="py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-md text-sm transition-all"
        >
          ✅ Знаю ✓
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   MATCH PAIRS STUDY MODE
============================================================================ */
function MatchPairsStudyMode({ items, onBack }: { items: VocabularyItem[]; onBack: () => void }) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const sampleItems = useMemo(() => items.slice(0, 6), [items]);

  const shuffledWords = useMemo(() => {
    return [...sampleItems].sort(() => Math.random() - 0.5);
  }, [sampleItems]);

  const shuffledTranslations = useMemo(() => {
    return [...sampleItems].sort(() => Math.random() - 0.5);
  }, [sampleItems]);

  useEffect(() => {
    if (selectedWord && selectedTranslation) {
      if (selectedWord === selectedTranslation) {
        setMatchedIds((prev) => [...prev, selectedWord]);
        setScore((prev) => prev + 10);
      }
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedTranslation(null);
      }, 300);
    }
  }, [selectedWord, selectedTranslation]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-xs font-semibold text-purple-600 hover:underline">
          ← Назад до словника
        </button>
        <div className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
          ⚡ Очки: {score}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-gray-900 text-center">
          З’єднайте англійські слова з їхніми перекладами
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Column 1: Words */}
          <div className="space-y-3">
            {shuffledWords.map((it) => {
              const isMatched = matchedIds.includes(it.id);
              const isSelected = selectedWord === it.id;
              return (
                <button
                  key={`w-${it.id}`}
                  disabled={isMatched}
                  onClick={() => setSelectedWord(it.id)}
                  className={`w-full p-4 rounded-2xl font-bold text-sm text-left transition-all border ${
                    isMatched
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 opacity-50'
                      : isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {it.word}
                </button>
              );
            })}
          </div>

          {/* Column 2: Translations */}
          <div className="space-y-3">
            {shuffledTranslations.map((it) => {
              const isMatched = matchedIds.includes(it.id);
              const isSelected = selectedTranslation === it.id;
              return (
                <button
                  key={`t-${it.id}`}
                  disabled={isMatched}
                  onClick={() => setSelectedTranslation(it.id)}
                  className={`w-full p-4 rounded-2xl font-bold text-sm text-left transition-all border ${
                    isMatched
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 opacity-50'
                      : isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {it.primaryTranslation}
                </button>
              );
            })}
          </div>
        </div>

        {matchedIds.length === sampleItems.length && (
          <div className="text-center py-6 bg-emerald-50 rounded-2xl border border-emerald-200 mt-4">
            <div className="text-3xl mb-1">🎉</div>
            <h4 className="text-lg font-bold text-emerald-800">Чудова робота! Усі пари знайдені!</h4>
            <button
              onClick={() => {
                setMatchedIds([]);
                setScore(0);
              }}
              className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md"
            >
              Зіграти ще раз
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   QUIZ STUDY MODE
============================================================================ */
function QuizStudyMode({ items, onSaveProgress, onBack }: { items: VocabularyItem[]; onSaveProgress: (wordId: string, status: MasteryStatus, boxLevel?: number) => Promise<void>; onBack: () => void }) {
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  if (items.length === 0) return null;

  const currentItem = items[quizIndex % items.length];
  const quiz = currentItem.quiz;

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === quiz.correctIndex) {
      setScore((prev) => prev + 1);
      // Correct answer → mark word as mastered and persist progress
      onSaveProgress(currentItem.id, 'mastered', 5);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    setQuizIndex((prev) => prev + 1);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-xs font-semibold text-purple-600 hover:underline">
          ← Назад до словника
        </button>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Правильно: {score}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-purple-100 shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold">
            {currentItem.word}
          </span>
          <span className="text-xs text-gray-400">Питання {quizIndex + 1}</span>
        </div>

        <h3 className="text-lg font-extrabold text-gray-900 leading-snug">
          {quiz.question}
        </h3>

        <div className="space-y-3">
          {quiz.options.map((option, idx) => {
            const isCorrect = idx === quiz.correctIndex;
            const isSelected = selectedOption === idx;

            let btnStyle = 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-purple-50';
            if (selectedOption !== null) {
              if (isCorrect) btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
              else if (isSelected) btnStyle = 'bg-rose-100 border-rose-500 text-rose-900 font-bold';
              else btnStyle = 'bg-gray-50 border-gray-100 text-gray-400 opacity-60';
            }

            return (
              <button
                key={idx}
                disabled={selectedOption !== null}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-2xl border text-left font-medium text-sm transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{option}</span>
                {selectedOption !== null && isCorrect && <span>✅</span>}
                {selectedOption !== null && isSelected && !isCorrect && <span>❌</span>}
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <button
            onClick={handleNextQuiz}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all"
          >
            Наступне питання →
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   AI CHAT PRACTICE MODE
============================================================================ */
function AIChatPracticeMode({ items, onBack }: { items: VocabularyItem[]; onBack: () => void }) {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your NovaFlow AI Tutor. Try to use words like "Resilience", "Pivot" or "Fulfill" in your reply!'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    const userText = inputMsg;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputMsg('');

    // AI Response simulation
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Great sentence! You used strong vocabulary correctly. How would you apply this in a real business context?`
        }
      ]);
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-xs font-semibold text-purple-600 hover:underline">
          ← Назад до словника
        </button>
        <span className="text-xs font-medium text-gray-500">🤖 AI Conversation Simulator</span>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-xl overflow-hidden flex flex-col h-[480px]">
        {/* Messages list */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Напишіть речення англійською..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-xs text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-sm hover:bg-purple-700"
          >
            Надіслати
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   WORD DETAIL MODAL
============================================================================ */
function WordDetailModal({
  item,
  onClose,
  onSpeak,
  onToggleMastery,
  onDeleteWord
}: {
  item: VocabularyItem;
  onClose: () => void;
  onSpeak: (text: string) => void;
  onToggleMastery: (id: string) => void;
  onDeleteWord: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl animate-scaleUp border border-purple-100 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
            {item.cefrLevel} • {item.partOfSpeech}
          </span>
          <span className="text-xs text-gray-400 font-medium">Box {item.boxLevel}/5</span>
        </div>

        <div className="flex items-baseline gap-3 mt-3">
          <h2 className="text-3xl font-extrabold text-gray-900">{item.word}</h2>
          <span className="text-sm font-mono text-gray-400">{item.phonetic}</span>
          <button
            onClick={() => onSpeak(item.word)}
            className="p-2 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 text-sm"
          >
            🔊
          </button>
        </div>

        <p className="text-lg font-bold text-purple-700 mt-1">{item.primaryTranslation}</p>

        {item.definition && (
          <p className="text-xs text-gray-600 mt-2 italic leading-relaxed">"{item.definition}"</p>
        )}

        {/* Mnemonic Hint */}
        {item.mnemonicHint && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950">
            <span className="font-bold block mb-1">💡 Мнемонічна асоціація від ШІ:</span>
            {item.mnemonicHint}
          </div>
        )}

        {/* Context Examples */}
        {item.contextExamples && item.contextExamples.length > 0 && (
          <div className="mt-5 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              💬 Приклади вживання:
            </h4>
            {item.contextExamples.map((ex, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                <p className="font-medium text-gray-900">"{ex.sentence}"</p>
                <p className="text-gray-500">{ex.translation}</p>
              </div>
            ))}
          </div>
        )}

        {/* Collocations & Synonyms */}
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
          {item.collocations && item.collocations.length > 0 && (
            <div className="p-3 bg-purple-50/50 rounded-xl">
              <span className="font-bold text-purple-900 block mb-1">🔗 Словосполучення:</span>
              <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                {item.collocations.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {item.synonyms && item.synonyms.length > 0 && (
            <div className="p-3 bg-indigo-50/50 rounded-xl">
              <span className="font-bold text-indigo-900 block mb-1">🔄 Синоніми:</span>
              <p className="text-gray-700">{item.synonyms.join(', ')}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => onDeleteWord(item.id)}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700"
          >
            🗑 Видалити слово
          </button>

          <button
            onClick={() => onToggleMastery(item.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              item.status === 'mastered'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {item.status === 'mastered' ? '✅ Засвоєно' : 'Позначити як вивчене'}
          </button>
        </div>
      </div>
    </div>
  );
}
