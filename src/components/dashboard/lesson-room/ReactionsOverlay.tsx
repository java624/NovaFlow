'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DraggableWidget from './DraggableWidget';

export interface FlyingReaction {
  id: string;
  emoji: string;
  x: number; // 0-100, horizontal position %
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '👏', '🎉', '❓'];

interface ReactionsOverlayProps {
  reactions: FlyingReaction[];
  onSendReaction: (emoji: string) => void;
}

export default function ReactionsOverlay({ reactions, onSendReaction }: ReactionsOverlayProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pickerOpen]);

  const handlePick = useCallback(
    (emoji: string) => {
      onSendReaction(emoji);
      setPickerOpen(false);
    },
    [onSendReaction]
  );

  const defaultPos =
    typeof window !== 'undefined'
      ? { x: Math.max(10, window.innerWidth - 70), y: Math.max(10, window.innerHeight - 150) }
      : { x: 320, y: 600 };

  return (
    <>
      {/* Flying reactions layer */}
      <div className="pointer-events-none fixed inset-0 z-[110] overflow-hidden">
        {reactions.map((r) => (
          <span
            key={r.id}
            className="absolute bottom-24 text-3xl select-none animate-[reaction-float_2.6s_ease-out_forwards]"
            style={{ left: `${r.x}%` }}
          >
            {r.emoji}
          </span>
        ))}
      </div>

      {/* Draggable Trigger + picker */}
      <DraggableWidget defaultPosition={defaultPos}>
        {({ dragHandleProps, popoverPositionClass }) => (
          <div ref={pickerRef} className="relative select-none">
            {pickerOpen && (
              <div
                className={`absolute ${popoverPositionClass} mb-2 flex items-center gap-1.5 rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur-xl p-2 shadow-2xl animate-[fade-in-up_0.15s_ease-out] z-[150]`}
              >
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handlePick(emoji)}
                    className="text-xl w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 hover:scale-110 transition-all"
                    aria-label={`Реакція ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <button
              {...dragHandleProps}
              onClick={() => setPickerOpen((p) => !p)}
              className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-xl transition-all ${
                pickerOpen
                  ? 'bg-indigo-600 border-indigo-400/50 text-white'
                  : 'bg-zinc-900/80 border-white/10 text-zinc-200 hover:bg-zinc-800/90'
              } backdrop-blur-xl`}
              aria-label="Надіслати реакцію"
              title="Перетягніть у будь-яке місце • Натисніть для реакцій"
            >
              <span className="text-lg">😊</span>
            </button>
          </div>
        )}
      </DraggableWidget>

      <style jsx global>{`
        @keyframes reaction-float {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-10px) scale(1.1);
          }
          100% {
            transform: translateY(-420px) scale(1);
            opacity: 0;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
