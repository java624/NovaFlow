'use client';

import { useState, useCallback } from 'react';
import { VocabularyItem, AssignedWordpack } from '@/types/vocabulary';
import { StudentProfile } from './types';
import {
  getStoredAssignedPacks,
  saveAssignedPacks,
  getStoredVocabulary,
  saveVocabulary,
} from '@/lib/mockVocabularyData';

interface AssignVocabularyModalProps {
  student: StudentProfile;
  visible: boolean;
  onClose: () => void;
  onAssigned: (pack: AssignedWordpack) => void;
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
  student,
  visible,
  onClose,
  onAssigned,
  teacherId = 'teacher',
}: AssignVocabularyModalProps) {
  const [rawInput, setRawInput] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [level, setLevel] = useState('B1');
  const [dueDate, setDueDate] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<VocabularyItem[] | null>(null);
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);

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

  const handleAssign = useCallback(() => {
    if (!previewItems || previewItems.length === 0) return;

    const now = new Date().toISOString();
    const packId = `pack-${Date.now()}`;
    const autoTitle =
      title.trim() ||
      `Пакет: ${previewItems
        .slice(0, 3)
        .map((w) => w.primaryTranslation || w.word)
        .join(', ')}${previewItems.length > 3 ? '...' : ''}`;

    const wordsWithPackId = previewItems.map((w) => ({
      ...w,
      wordpackId: packId,
      addedBy: 'teacher' as const,
    }));

    const pack: AssignedWordpack = {
      id: packId,
      title: autoTitle,
      targetLanguage,
      createdAt: now,
      dueDate: dueDate || undefined,
      assignedStudentIds: [student.id],
      createdByTeacherId: teacherId,
      words: wordsWithPackId,
    };

    const existingPacks = getStoredAssignedPacks();
    saveAssignedPacks([...existingPacks, pack]);

    const studentVocab = getStoredVocabulary(student.id);
    const existingWords = new Set(studentVocab.map((v) => v.word.toLowerCase()));
    const newWords = wordsWithPackId.filter((w) => !existingWords.has(w.word.toLowerCase()));
    if (newWords.length > 0) {
      saveVocabulary([...newWords, ...studentVocab], student.id);
    }

    onAssigned(pack);
    onClose();
    setRawInput('');
    setTitle('');
    setDueDate('');
    setPreviewItems(null);
    setExpandedPreviewId(null);
  }, [previewItems, title, targetLanguage, dueDate, student.id, teacherId, onAssigned, onClose]);

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
              Учень: <span className="font-semibold text-purple-700">{student.full_name}</span>
            </p>
          </div>
        </div>

        {!previewItems ? (
          <>
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
              disabled={isGenerating || !rawInput.trim()}
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
              📤 Надіслати учню
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
