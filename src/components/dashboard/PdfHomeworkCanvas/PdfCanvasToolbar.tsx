'use client';

import { PdfTool } from './types';

interface PdfCanvasToolbarProps {
  currentTool: PdfTool;
  drawColor: string;
  brushSize: number;
  currentPage: number;
  totalPages: number;
  zoomScale: number;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: PdfTool) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
  onZoomChange: (scale: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

const COLORS = [
  '#dc2626', // Red
  '#2563eb', // Blue
  '#16a34a', // Green
  '#eab308', // Yellow
  '#9333ea', // Purple
  '#000000', // Black
  '#ffffff', // White
];

const BRUSH_SIZES = [
  { label: 'S', size: 2 },
  { label: 'M', size: 5 },
  { label: 'L', size: 10 },
  { label: 'XL', size: 20 },
];

export function PdfCanvasToolbar({
  currentTool,
  drawColor,
  brushSize,
  currentPage,
  totalPages,
  zoomScale,
  canUndo,
  canRedo,
  onToolChange,
  onColorChange,
  onSizeChange,
  onPageChange,
  onZoomChange,
  onUndo,
  onRedo,
  onClear,
}: PdfCanvasToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 border-b border-gray-200 text-xs select-none">
      {/* ── Навігація по сторінках PDF ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-2.5 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition-colors"
          title="Попередня сторінка"
        >
          ◀
        </button>
        <span className="px-2 font-semibold text-gray-700 text-xs">
          {currentPage} / {totalPages || 1}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition-colors"
          title="Наступна сторінка"
        >
          ▶
        </button>
      </div>

      {/* ── Масштаб (Zoom) ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(0.75, zoomScale - 0.25))}
          className="px-2 py-1 rounded-lg hover:bg-gray-100 font-bold transition-colors"
          title="Зменшити"
        >
          -
        </button>
        <span className="px-1.5 font-semibold text-gray-600 min-w-[42px] text-center">
          {Math.round(zoomScale * 100)}%
        </span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(2.5, zoomScale + 0.25))}
          className="px-2 py-1 rounded-lg hover:bg-gray-100 font-bold transition-colors"
          title="Збільшити"
        >
          +
        </button>
        {zoomScale !== 1.25 && (
          <button
            type="button"
            onClick={() => onZoomChange(1.25)}
            className="px-2 py-1 text-[10px] text-purple-600 font-semibold hover:bg-purple-50 rounded-lg transition-colors"
          >
            100%
          </button>
        )}
      </div>

      {/* ── Інструменти малювання ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
        <button
          type="button"
          onClick={() => onToolChange('brush')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            currentTool === 'brush'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Пензель"
        >
          ✏️ <span className="hidden sm:inline">Пензель</span>
        </button>

        <button
          type="button"
          onClick={() => onToolChange('highlighter')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            currentTool === 'highlighter'
              ? 'bg-yellow-500 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Маркер"
        >
          🖊️ <span className="hidden sm:inline">Маркер</span>
        </button>

        <button
          type="button"
          onClick={() => onToolChange('text')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            currentTool === 'text'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Текст"
        >
          💬 <span className="hidden sm:inline">Текст</span>
        </button>

        <button
          type="button"
          onClick={() => onToolChange('eraser')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            currentTool === 'eraser'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Стерка"
        >
          🧽 <span className="hidden sm:inline">Стерка</span>
        </button>

        <button
          type="button"
          onClick={() => onToolChange('hand')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            currentTool === 'hand'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Рука"
        >
          🖐️ <span className="hidden sm:inline">Рука</span>
        </button>
      </div>

      {/* ── Палітра кольорів ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm">
        {COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            className={`w-5 h-5 rounded-full border transition-transform ${
              drawColor === color ? 'scale-125 ring-2 ring-purple-500 ring-offset-1' : 'hover:scale-110'
            }`}
            style={{ backgroundColor: color, borderColor: color === '#ffffff' ? '#e5e7eb' : color }}
            title={color}
          />
        ))}
      </div>

      {/* ── Розмір пензля ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
        {BRUSH_SIZES.map(({ label, size }) => (
          <button
            key={size}
            type="button"
            onClick={() => onSizeChange(size)}
            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] transition-all ${
              brushSize === size
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={`Розмір ${size}px`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Дії (Undo / Redo / Clear) ───────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
          title="Скасувати (Ctrl+Z)"
        >
          ↩️
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
          title="Повторити (Ctrl+Y)"
        >
          ↪️
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-2 py-1 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          title="Очистити сторінку"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
