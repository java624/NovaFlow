'use client';

import { useEffect, useRef, useState } from 'react';
import type { VBMode } from './useVirtualBackground';
import DraggableWidget from './DraggableWidget';

const SAMPLE_BACKGROUNDS = [
  { label: 'Клас', url: '/backgrounds/classroom.jpg' },
  { label: 'Бібліотека', url: '/backgrounds/library.jpg' },
  { label: 'Абстракція', url: '/backgrounds/abstract.jpg' },
];

interface VirtualBackgroundControlsProps {
  mode: VBMode;
  isLoading: boolean;
  error: string | null;
  onBlur: () => void;
  onImage: (url: string) => void;
  onDisable: () => void;
}

export default function VirtualBackgroundControls({
  mode,
  isLoading,
  error,
  onBlur,
  onImage,
  onDisable,
}: VirtualBackgroundControlsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const defaultPos =
    typeof window !== 'undefined'
      ? { x: 20, y: Math.max(10, window.innerHeight - 150) }
      : { x: 20, y: 600 };

  return (
    <DraggableWidget defaultPosition={defaultPos}>
      {({ dragHandleProps, popoverPositionClass }) => (
        <div ref={ref} className="relative select-none">
          <button
            {...dragHandleProps}
            onClick={() => setOpen((p) => !p)}
            className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-xl backdrop-blur-xl transition-all ${
              mode !== 'none'
                ? 'bg-indigo-600 border-indigo-400/50 text-white'
                : 'bg-zinc-900/80 border-white/10 text-zinc-200 hover:bg-zinc-800/90'
            }`}
            title="Перетягніть у будь-яке місце • Натисніть для вибору фону"
            aria-label="Налаштування віртуального фону"
          >
            🖼️
          </button>

          {open && (
            <div
              className={`absolute ${popoverPositionClass} w-56 rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl p-3 shadow-2xl space-y-2 z-[150]`}
            >
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-medium text-zinc-300">Фон камери</p>
                <span className="text-[10px] text-zinc-500">✋ перетягується</span>
              </div>

              <button
                onClick={() => {
                  onDisable();
                  setOpen(false);
                }}
                className={`w-full text-left text-xs rounded-xl px-3 py-2 transition-colors ${
                  mode === 'none' ? 'bg-indigo-600 text-white' : 'text-zinc-200 hover:bg-white/10'
                }`}
              >
                Без ефекту
              </button>
              <button
                onClick={() => {
                  onBlur();
                  setOpen(false);
                }}
                disabled={isLoading}
                className={`w-full text-left text-xs rounded-xl px-3 py-2 transition-colors disabled:opacity-50 ${
                  mode === 'blur' ? 'bg-indigo-600 text-white' : 'text-zinc-200 hover:bg-white/10'
                }`}
              >
                Розмити фон
              </button>

              <div className="h-px bg-white/10 my-1" />

              {SAMPLE_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.url}
                  onClick={() => {
                    onImage(bg.url);
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className="w-full text-left text-xs rounded-xl px-3 py-2 text-zinc-200 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {bg.label}
                </button>
              ))}

              {isLoading && <p className="text-[11px] text-zinc-500 px-1">Завантаження…</p>}
              {error && <p className="text-[11px] text-rose-400 px-1">{error}</p>}
            </div>
          )}
        </div>
      )}
    </DraggableWidget>
  );
}
