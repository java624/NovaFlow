'use client';

import React from 'react';

interface LessonRoomHeaderProps {
  safeChannel: string;
  isConnected: boolean;
  networkQuality: number;
  remoteUsersCount: number;
  layoutMode: 'grid' | 'focus';
  onToggleLayoutMode: () => void;
}

export default function LessonRoomHeader({
  safeChannel,
  isConnected,
  networkQuality,
  remoteUsersCount,
  layoutMode,
  onToggleLayoutMode,
}: LessonRoomHeaderProps) {
  return (
    <header className="h-16 px-6 flex items-center justify-between backdrop-blur-xl bg-zinc-900/60 border-b border-white/10 z-30 shrink-0 shadow-lg shadow-black/40">
      {/* Left: Brand & Connection Status */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center font-black text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            NF
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-wide text-zinc-100">
              Урок: <span className="text-indigo-400 font-medium">{safeChannel}</span>
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                isConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {isConnected ? 'В ефірі' : 'Підключення...'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Room Stats, Network Quality & Layout Switcher */}
      <div className="flex items-center gap-3">
        {/* Signal Indicator */}
        <NetworkSignalBadge quality={networkQuality} />

        {/* Participant count */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{remoteUsersCount + 1} у кімнаті</span>
        </div>

        {/* Layout Mode Switcher */}
        <button
          onClick={onToggleLayoutMode}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
          title={layoutMode === 'focus' ? 'Переключити на Сітку' : 'Переключити на Фокус'}
        >
          {layoutMode === 'focus' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

function NetworkSignalBadge({ quality }: { quality: number }) {
  let color = 'text-emerald-400';
  let label = 'Відмінно';
  if (quality === 2) {
    color = 'text-emerald-400';
    label = 'Добре';
  } else if (quality >= 3 && quality <= 4) {
    color = 'text-amber-400';
    label = 'Слабкий зв’язок';
  } else if (quality >= 5) {
    color = 'text-rose-400';
    label = 'Поганий зв’язок';
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs" title={`Якість мережі: ${label}`}>
      <div className="flex items-end gap-0.5 h-3">
        <span className={`w-0.5 rounded-full ${quality <= 4 ? 'h-1 bg-current' : 'h-1 bg-zinc-600'} ${color}`} />
        <span className={`w-0.5 rounded-full ${quality <= 3 ? 'h-2 bg-current' : 'h-2 bg-zinc-600'} ${color}`} />
        <span className={`w-0.5 rounded-full ${quality <= 2 ? 'h-3 bg-current' : 'h-3 bg-zinc-600'} ${color}`} />
      </div>
      <span className="hidden md:inline text-[11px] text-zinc-300 font-medium">{label}</span>
    </div>
  );
}
