'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { MasteryStatus, VocabularyItem, WordPacket } from '@/types/vocabulary';
import { upsertWordProgress } from '@/lib/vocabularySupabase';
import { createClient } from '@/lib/supabase/client';

type StudyMode = 'menu' | 'flashcards' | 'quiz';

interface PackStudyViewProps {
  pack: WordPacket;
  studentId: string;
  onClose: () => void;
  onWordsUpdated: (updatedWords: VocabularyItem[]) => void;
}

export default function PackStudyView({
  pack,
  studentId,
  onClose,
  onWordsUpdated,
}: PackStudyViewProps) {
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<StudyMode>('menu');
  const [words, setWords] = useState<VocabularyItem[]>(pack.words);

  const persistStatus = useCallback(
    async (wordId: string, status: MasteryStatus, boxLevel: number) => {
      const updated = words.map((w) =>
        w.id === wordId ? { ...w, status, boxLevel } : w
      );
      setWords(updated);
      onWordsUpdated(updated);

      const { error } = await upsertWordProgress(supabase, studentId, wordId, status, boxLevel);
      if (error) console.error('Failed to save progress', error);
    },
    [words, onWordsUpdated, supabase, studentId]
  );

  const masteredCount = words.filter((w) => w.status === 'mastered').length;
  const progressPct =
    words.length > 0 ? Math.round((masteredCount / words.length) * 100) : 0;

  if (mode === 'flashcards') {
    return (
      <PackFlashcards
        words={words}
        packTitle={pack.title}
        onBack={() => setMode('menu')}
        onKnow={(wordId) => persistStatus(wordId, 'mastered', 5)}
        onStillLearning={(wordId) => persistStatus(wordId, 'learning', 1)}
      />
    );
  }

  if (mode === 'quiz') {
    return (
      <PackQuiz
        words={words}
        packTitle={pack.title}
        onBack={() => setMode('menu')}
        onCorrect={(wordId) => persistStatus(wordId, 'mastered', 5)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 pr-8">{pack.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {pack.targetLanguage} • {masteredCount}/{words.length} вивчено ({progressPct}%)
          </p>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progressPct === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">Оберіть режим вивчення:</p>

        <div className="grid gap-3">
          <button
            onClick={() => setMode('flashcards')}
            className="flex items-center gap-4 p-4 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-colors text-left"
          >
            <span className="text-3xl">🗂</span>
            <div>
              <div className="font-bold text-gray-900">Флеш-картки</div>
              <div className="text-xs text-gray-500">Перевертайте картки, натискайте «Знаю» або «Ще вчу»</div>
            </div>
          </button>
          <button
            onClick={() => setMode('quiz')}
            className="flex items-center gap-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-colors text-left"
          >
            <span className="text-3xl">✍️</span>
            <div>
              <div className="font-bold text-gray-900">Практика / Тест</div>
              <div className="text-xs text-gray-500">Оберіть правильний переклад або введіть слово</div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
        >
          Закрити
        </button>
      </div>
    </div>
  );
}

function PackFlashcards({
  words,
  packTitle,
  onBack,
  onKnow,
  onStillLearning,
}: {
  words: VocabularyItem[];
  packTitle: string;
  onBack: () => void;
  onKnow: (wordId: string) => void;
  onStillLearning: (wordId: string) => void;
}) {
  const studyWords = useMemo(
    () => words.filter((w) => w.status !== 'mastered'),
    [words]
  );
  const pool = studyWords.length > 0 ? studyWords : words;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = pool[index % pool.length];

  const advance = (action: 'know' | 'learn') => {
    if (action === 'know') onKnow(current.id);
    else onStillLearning(current.id);
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i + 1) % pool.length), 200);
  };

  if (!current) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="font-bold text-gray-900">Усі слова вивчено!</h3>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold">
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-between items-center text-white text-xs">
          <button onClick={onBack} className="font-semibold hover:underline">
            ← {packTitle}
          </button>
          <span>
            {index + 1} / {pool.length}
          </span>
        </div>

        <div className="perspective-[1000px] w-full h-[340px]">
          <div
            onClick={() => setFlipped(!flipped)}
            className="relative w-full h-full cursor-pointer transition-transform duration-500"
            style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transformStyle: 'preserve-3d' }}
          >
            <div
              className="absolute inset-0 bg-white rounded-3xl p-8 border border-purple-100 shadow-xl flex flex-col items-center justify-center text-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="text-xs font-bold text-purple-600 mb-4">{current.cefrLevel}</span>
              <h2 className="text-4xl font-extrabold text-gray-900">{current.word}</h2>
              {current.phonetic && (
                <p className="text-sm text-gray-400 font-mono mt-2">{current.phonetic}</p>
              )}
              <p className="text-xs text-purple-500 mt-6">Натисніть, щоб перевернути</p>
            </div>
            <div
              className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 border border-purple-200 shadow-xl flex flex-col items-center justify-center text-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <h3 className="text-2xl font-extrabold text-purple-800">{current.primaryTranslation}</h3>
              {current.definition && (
                <p className="text-sm text-gray-600 mt-3 italic max-w-xs">{current.definition}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => advance('learn')}
            className="py-3.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-sm transition-colors"
          >
            Ще вчу
          </button>
          <button
            onClick={() => advance('know')}
            className="py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors"
          >
            Знаю ✓
          </button>
        </div>
      </div>
    </div>
  );
}

function PackQuiz({
  words,
  packTitle,
  onBack,
  onCorrect,
}: {
  words: VocabularyItem[];
  packTitle: string;
  onBack: () => void;
  onCorrect: (wordId: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [inputMode, setInputMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const pool = useMemo(() => words.filter((w) => w.status !== 'mastered'), [words]);
  const quizPool = pool.length > 0 ? pool : words;
  const current = quizPool[index % quizPool.length];

  const options = useMemo(() => {
    if (!current) return [];
    const distractors = words
      .filter((w) => w.id !== current.id)
      .map((w) => w.primaryTranslation)
      .filter(Boolean)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const all = [current.primaryTranslation, ...distractors];
    return all.sort(() => Math.random() - 0.5);
  }, [current, words, index]);

  const nextQuestion = () => {
    setSelected(null);
    setInputValue('');
    setFeedback(null);
    setIndex((i) => (i + 1) % quizPool.length);
  };

  const checkAnswer = (answer: string) => {
    const correct =
      answer.trim().toLowerCase() === current.primaryTranslation.trim().toLowerCase() ||
      answer.trim().toLowerCase() === current.word.trim().toLowerCase();
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) onCorrect(current.id);
    setTimeout(nextQuestion, correct ? 800 : 1200);
  };

  if (!current) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="font-bold text-gray-900">Тест завершено!</h3>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold">
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onBack} className="text-xs font-semibold text-purple-600 hover:underline">
            ← {packTitle}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => { setInputMode(false); setFeedback(null); }}
              className={`text-xs px-2 py-1 rounded-lg ${!inputMode ? 'bg-purple-100 text-purple-700 font-bold' : 'text-gray-500'}`}
            >
              Вибір
            </button>
            <button
              onClick={() => { setInputMode(true); setFeedback(null); }}
              className={`text-xs px-2 py-1 rounded-lg ${inputMode ? 'bg-purple-100 text-purple-700 font-bold' : 'text-gray-500'}`}
            >
              Введення
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-xs text-gray-500 mb-2">Який переклад слова:</p>
          <h2 className="text-3xl font-extrabold text-gray-900">{current.word}</h2>
        </div>

        {inputMode ? (
          <div className="space-y-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && inputValue.trim() && checkAnswer(inputValue)}
              placeholder="Введіть переклад..."
              disabled={feedback !== null}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
            />
            <button
              onClick={() => checkAnswer(inputValue)}
              disabled={!inputValue.trim() || feedback !== null}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold rounded-xl text-sm"
            >
              Перевірити
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {options.map((opt, i) => (
              <button
                key={i}
                disabled={feedback !== null}
                onClick={() => {
                  setSelected(i);
                  checkAnswer(opt);
                }}
                className={`py-3 px-4 rounded-xl text-sm font-semibold text-left border transition-colors ${
                  feedback !== null && opt === current.primaryTranslation
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : feedback !== null && selected === i
                    ? 'bg-red-100 border-red-300 text-red-800'
                    : 'bg-gray-50 border-gray-100 hover:bg-purple-50 hover:border-purple-200 text-gray-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {feedback === 'correct' && (
          <p className="text-center text-emerald-600 font-semibold text-sm mt-4">✓ Правильно!</p>
        )}
        {feedback === 'wrong' && (
          <p className="text-center text-red-600 font-semibold text-sm mt-4">
            ✗ Правильна відповідь: {current.primaryTranslation}
          </p>
        )}
      </div>
    </div>
  );
}
