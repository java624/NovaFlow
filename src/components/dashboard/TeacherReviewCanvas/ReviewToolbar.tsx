'use client';

import { Tool } from './types';
import { calcBaseFontSize } from './types';

interface ReviewToolbarProps {
  currentTool: Tool;
  drawColor: string;
  brushSize: number;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onUndo: () => void;
  onClear: () => void;
}

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: 'brush',  label: 'Червона ручка',   icon: '🖊️' },
  { id: 'text',   label: 'Текст коментаря', icon: '📝' },
  { id: 'eraser', label: 'Гумка',           icon: '🧹' },
  { id: 'hand',   label: 'Рука',            icon: '✋' },
];

/**
 * Панель інструментів вчителя для рецензування:
 * вибір інструменту, колір, розмір, undo, очистити
 */
export function ReviewToolbar({
  currentTool,
  drawColor,
  brushSize,
  onToolChange,
  onColorChange,
  onSizeChange,
  onUndo,
  onClear,
}: ReviewToolbarProps) {
  const sizeLabel = currentTool === 'text'
    ? `${Math.round(calcBaseFontSize(brushSize))}px`
    : `${brushSize}px`;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-100">

      {/* Інструменти */}
      <div className="flex gap-1 flex-wrap">
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

      <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

      {/* Undo */}
      <button
        onClick={onUndo}
        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Скасувати (Ctrl+Z)"
      >
        ↩️
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

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

      <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

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
