'use client';

import { useState, useCallback } from 'react';
import { VocabularyItem, AssignedWordpack } from '@/types/vocabulary';
import { StudentProfile } from './types';
import { getStoredAssignedPacks, saveAssignedPacks, getStoredVocabulary, saveVocabulary } from '@/lib/mockVocabularyData';

interface AssignVocabularyModalProps {
  student: StudentProfile;
  visible: boolean;
  onClose: () => void;
  onAssigned: (pack: AssignedWordpack) => void;
}

const TARGET_LANGUAGES = [
  { value: 'English', label: '🇬🇧 Англійська' },
  { value: 'German', label: '🇩🇪 Німецька' },
  { value: 'French', label: '🇫🇷 Французька' },
  { value: 'Spanish', label: '🇪🇸 Іспанська' },
  { value: 'Polish', label: '🇵🇱 Польська' },
  { value: 'Italian', label: '🇮🇹 Італійська' },
];

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function AssignVocabularyModal({
  student,
  visible,
  onClose,
  onAssigned,
}: AssignVocabularyModalProps) {
  const [rawInput, setRawInput] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [level, setLevel] = useState('B1');
  const [dueDate, setDueDate] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<VocabularyItem[] | null>(null);

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
    const autoTitle = title.trim() || `Словник: ${previewItems.slice(0, 3).map((w) => w.word).join(', ')}${previewItems.length > 3 ? '...' : ''}`;

    const pack: AssignedWordpack = {
      id: `pack-${Date.now()}`,
      title: autoTitle,
      targetLanguage,
      createdAt: now,
      dueDate: dueDate || undefined,
      assignedStudentIds: [student.id],
      createdByTeacherId: 'teacher',
      words: previewItems,
    };

    // 1. Save to assigned packs library (localStorage)
    const existingPacks = getStoredAssignedPacks();
    const updatedPacks = [...existingPacks, pack];
    saveAssignedPacks(updatedPacks);

    // 2. Also merge the generated words into the student's personal vocabulary
    const existingVocab = getStoredVocabulary();
    const existingIds = new Set(existingVocab.map((v) => v.word.toLowerCase()));
    const newWords = previewItems.filter((w) => !existingIds.has(w.word.toLowerCase()));
    if (newWords.length > 0) {
      saveVocabulary([...newWords, ...existingVocab]);
    }

    // 3. Notify parent component to update UI state
    onAssigned(pack);
    onClose();
    setRawInput('');
    setTitle('');
    setDueDate('');
    setPreviewItems(null);
  }, [previewItems, title, targetLanguage, dueDate, student.id, onAssigned, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isGenerating) onClose(); }}
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
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">📚</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Задати модуль слів</h2>
            <p className="text-sm text-gray-500">Учень: <span className="font-semibold text-purple-700">{student.full_name}</span></p>
          </div>
        </div>

        {/* Words Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            📝 Список слів (через кому або новий рядок)
          </label>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={4}
            placeholder="наприклад: літак, затримка рейсу, посадковий талон, багаж"
            disabled={isGenerating}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-y disabled:opacity-50"
          />
          <p className="text-xs text-gray-400 mt-1">Максимум 30 слів за один пакет</p>
        </div>

        {/* Target Language + Level */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">🌍 Цільова мова</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              disabled={isGenerating}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all disabled:opacity-50"
            >
              {TARGET_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
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
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date + Title */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">📅 Дедлайн</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isGenerating}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">🏷️ Назва модуля (необов'язково)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ШІ згенерує назву автоматично"
              disabled={isGenerating}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200 mb-4">
            ❌ {error}
          </div>
        )}

        {/* Preview of generated words */}
        {previewItems && previewItems.length > 0 && (
          <div className="mb-4 p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
            <h3 className="text-sm font-bold text-purple-900 mb-2">
              ✨ Згенеровано {previewItems.length} слів:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {previewItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-xs">
                  <span className="font-semibold text-gray-900">{item.word}</span>
                  <span className="text-purple-700">{item.primaryTranslation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Скасувати
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
                  Генеруємо через ШІ...
                </>
              ) : (
                '🪄 Сформувати через AI'
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