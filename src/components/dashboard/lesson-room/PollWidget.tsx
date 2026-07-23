'use client';

import { useCallback, useState } from 'react';

export interface PollData {
  id: string;
  question: string;
  options: string[];
  counts: number[];
  totalVotes: number;
  isActive: boolean;
}

interface PollWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  isTeacher: boolean;
  currentPoll: PollData | null;
  hasVoted: boolean;
  onCreatePoll: (question: string, options: string[]) => void;
  onVote: (optionIndex: number) => void;
  onEndPoll: () => void;
}

/**
 * Side panel for polling / quick quizzes during a lesson.
 * - Teacher: sees a form to create a poll (question + 2-4 options) and, once a poll
 *   is live, sees real-time results + an "End poll" button.
 * - Student: sees the active poll with clickable options; after voting, sees the
 *   (optional) live results depending on teacher's poll.
 *
 * All broadcast/aggregation logic lives in the parent (LessonRoom.tsx) — this
 * component is purely presentational + local form state.
 */
export default function PollWidget({
  isOpen,
  onClose,
  isTeacher,
  currentPoll,
  hasVoted,
  onCreatePoll,
  onVote,
  onEndPoll,
}: PollWidgetProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const updateOption = useCallback((idx: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? value : o)));
  }, []);

  const addOption = useCallback(() => {
    setOptions((prev) => (prev.length < 4 ? [...prev, ''] : prev));
  }, []);

  const removeOption = useCallback((idx: number) => {
    setOptions((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== idx) : prev));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
      if (!question.trim() || cleanOptions.length < 2) return;
      onCreatePoll(question.trim(), cleanOptions);
      setQuestion('');
      setOptions(['', '']);
    },
    [question, options, onCreatePoll]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-full sm:w-96 z-[130] bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 flex flex-col shadow-2xl animate-[fade-in-up_0.2s_ease-out]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h3 className="font-semibold text-sm tracking-wide text-zinc-100">📊 Опитування</h3>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white text-lg leading-none px-1"
          aria-label="Закрити опитування"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Active poll display */}
        {currentPoll && currentPoll.isActive !== false && (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4 space-y-3">
            <p className="text-sm font-medium text-zinc-100">{currentPoll.question}</p>
            <div className="space-y-2">
              {currentPoll.options.map((opt, idx) => {
                const count = currentPoll.counts[idx] || 0;
                const pct = currentPoll.totalVotes > 0 ? Math.round((count / currentPoll.totalVotes) * 100) : 0;
                const showResults = isTeacher || hasVoted;

                return (
                  <button
                    key={idx}
                    disabled={!isTeacher && hasVoted}
                    onClick={() => !isTeacher && !hasVoted && onVote(idx)}
                    className={`relative w-full text-left rounded-xl border overflow-hidden transition-all ${
                      !isTeacher && !hasVoted
                        ? 'border-white/15 hover:border-indigo-400/50 hover:bg-white/5 cursor-pointer'
                        : 'border-white/10 cursor-default'
                    }`}
                  >
                    {showResults && (
                      <div
                        className="absolute inset-y-0 left-0 bg-indigo-500/25 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    <div className="relative flex items-center justify-between px-3 py-2.5 text-xs sm:text-sm">
                      <span className="text-zinc-100">{opt}</span>
                      {showResults && (
                        <span className="text-zinc-400 shrink-0 ml-2">
                          {pct}% · {count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-500">
              Всього голосів: {currentPoll.totalVotes}
              {!isTeacher && hasVoted && ' · Ви проголосували ✓'}
            </p>
            {isTeacher && (
              <button
                onClick={onEndPoll}
                className="w-full mt-1 rounded-xl bg-rose-700/80 hover:bg-rose-600 text-white text-xs font-medium py-2"
              >
                Завершити опитування
              </button>
            )}
          </div>
        )}

        {!currentPoll && !isTeacher && (
          <p className="text-sm text-zinc-500 text-center py-8">Опитування ще не розпочато</p>
        )}

        {/* Teacher: create new poll */}
        {isTeacher && !currentPoll && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Питання</label>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Напр.: Яка відповідь правильна?"
                className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-400/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400 block">Варіанти відповідей</label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`Варіант ${idx + 1}`}
                    className="flex-1 rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-400/50"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="text-zinc-500 hover:text-rose-400 px-1"
                      aria-label="Видалити варіант"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {options.length < 4 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  + Додати варіант
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 transition-colors"
            >
              Запустити опитування
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
