'use client';

import { Tool } from './types';
import { calcBaseFontSize } from './types';
import type { RefObject } from 'react';

interface CanvasToolbarProps {
  currentTool: Tool;
  drawColor: string;
  brushSize: number;
  undoStack: RefObject<string[]>;
  redoStack: RefObject<string[]>;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: 'brush',  label: 'Пензель', icon: '🖌️' },
  { id: 'text',   label: 'Текст',   icon: '📝' },
  { id: 'eraser', label: 'Стерка',  icon: '🧹' },
  { id: 'hand',   label: 'Рука',    icon: '✋' },
];

/**
 * Панель інструментів canvas:
 * вибір інструменту, колір, розмір, undo/redo, очистити
 */
export function CanvasToolbar({
  currentTool,
  drawColor,
  brushSize,
  onToolChange,
  onColorChange,
  onSizeChange,
  onUndo,
  onRedo,
  onClear,
}: CanvasToolbarProps) {
  const sizeLabel = currentTool === 'text'
    ? `${Math.round(calcBaseFontSize(brushSize))}px`
    : `${brushSize}px`;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-100">

      {/* Інструменти */}
      <div className="flex gap-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => onToolChange(t.id)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentTool === t.id
                ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Undo / Redo */}
      <button
        onClick={onUndo}
        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Скасувати (Ctrl+Z)"
      >
        ↩️
      </button>
      <button
        onClick={onRedo}
        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Повернути (Ctrl+Shift+Z)"
      >
        ↪️
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Колір */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-gray-500">Колір:</label>
        <input
          type="color"
          value={drawColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200"
        />
      </div>

      {/* Розмір */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-gray-500">
          {currentTool === 'text' ? 'Шрифт:' : 'Товщина:'}
        </label>
        <input
          type="range"
          min={1}
          max={20}
          value={brushSize}
          onChange={(e) => onSizeChange(parseInt(e.target.value))}
          className="w-24"
        />
        <span className="text-xs text-gray-400 min-w-[36px]">{sizeLabel}</span>
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Очистити */}
      <button
        onClick={onClear}
        className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        🗑️ Очистити
      </button>
    </div>
  );
}
