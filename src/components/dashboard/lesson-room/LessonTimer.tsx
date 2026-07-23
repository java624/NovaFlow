'use client';

import { useState } from 'react';

interface LessonTimerProps {
  isTeacher: boolean;
  remainingSeconds: number;
  isRunning: boolean;
  onStart: (durationMinutes: number) => void;
  onPauseResume: () => void;
  onReset: () => void;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(Math.max(totalSeconds, 0) / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.max(totalSeconds, 0) % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Compact lesson timer shown in the top area of the room.
 * The teacher controls start/pause/reset and sets the duration; students see a
 * read-only countdown. Actual ticking/sync logic lives in the parent component,
 * which passes down `remainingSeconds` / `isRunning` and periodically broadcasts
 * updates via the Agora data stream so all participants stay in sync.
 */
export default function LessonTimer({
  isTeacher,
  remainingSeconds,
  isRunning,
  onStart,
  onPauseResume,
  onReset,
}: LessonTimerProps) {
  const [minutesInput, setMinutesInput] = useState(15);
  const isLow = remainingSeconds > 0 && remainingSeconds <= 60;
  const isIdle = remainingSeconds === 0 && !isRunning;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl px-3 py-1.5">
      <span className="text-base">⏱️</span>

      {isIdle && isTeacher ? (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            max={180}
            value={minutesInput}
            onChange={(e) => setMinutesInput(Number(e.target.value) || 1)}
            className="w-12 bg-zinc-800 border border-white/10 rounded-lg px-1.5 py-0.5 text-xs text-zinc-100 text-center focus:outline-none focus:border-indigo-400/50"
          />
          <span className="text-[11px] text-zinc-500">хв</span>
          <button
            onClick={() => onStart(minutesInput)}
            className="text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-2.5 py-1 transition-colors"
          >
            Старт
          </button>
        </div>
      ) : (
        <>
          <span
            className={`text-sm font-mono tabular-nums ${
              isLow ? 'text-rose-400 animate-pulse' : 'text-zinc-100'
            }`}
          >
            {formatTime(remainingSeconds)}
          </span>
          {isTeacher && !isIdle && (
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={onPauseResume}
                className="text-[11px] bg-white/10 hover:bg-white/20 text-zinc-100 rounded-lg px-2 py-1 transition-colors"
                title={isRunning ? 'Пауза' : 'Продовжити'}
              >
                {isRunning ? '⏸' : '▶'}
              </button>
              <button
                onClick={onReset}
                className="text-[11px] bg-white/10 hover:bg-white/20 text-zinc-100 rounded-lg px-2 py-1 transition-colors"
                title="Скинути"
              >
                ↺
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
