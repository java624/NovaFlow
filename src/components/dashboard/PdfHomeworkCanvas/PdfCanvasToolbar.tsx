'use client';

import { PdfTool } from './types';

interface PdfCanvasToolbarProps {
  currentTool: PdfTool;
  drawColor: string;
  brushSize: number;
  currentPage: number;
  totalPages: number;
  zoomScale: number;
  showSidebar: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: PdfTool) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
  onZoomChange: (scale: number) => void;
  onToggleSidebar: () => void;
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
  { label: 'M', size: 4 },
  { label: 'L', size: 8 },
  { label: 'XL', size: 16 },
];

export function PdfCanvasToolbar({
  currentTool,
  drawColor,
  brushSize,
  currentPage,
  totalPages,
  zoomScale,
  showSidebar,
  canUndo,
  canRedo,
  onToolChange,
  onColorChange,
  onSizeChange,
  onPageChange,
  onZoomChange,
  onToggleSidebar,
  onUndo,
  onRedo,
  onClear,
}: PdfCanvasToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white border-b border-gray-200 text-xs select-none shadow-sm">
      {/* ── Ліва частина: Сайдбар та Навігація по сторінках ────────────────── */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
            showSidebar
              ? 'bg-purple-100 border-purple-300 text-purple-700'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
          title="Мініатюри сторінок"
        >
          📑 <span className="hidden sm:inline">Сторінки</span>
        </button>

        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-2 py-1 rounded-lg hover:bg-gray-200 disabled:opacity-30 font-bold transition-colors"
            title="Попередня сторінка"
          >
            ◀
          </button>
          <span className="px-2 font-bold text-gray-700 text-xs whitespace-nowrap">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="px-2 py-1 rounded-lg hover:bg-gray-200 disabled:opacity-30 font-bold transition-colors"
            title="Наступна сторінка"
          >
            ▶
          </button>
        </div>
      </div>

      {/* ── Масштаб (Zoom) ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(0.6, zoomScale - 0.2))}
          className="px-2 py-1 rounded-lg hover:bg-gray-200 font-bold transition-colors"
          title="Зменшити"
        >
          -
        </button>
        <span className="px-1.5 font-bold text-gray-600 min-w-[42px] text-center">
          {Math.round(zoomScale * 100)}%
        </span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(2.5, zoomScale + 0.2))}
          className="px-2 py-1 rounded-lg hover:bg-gray-200 font-bold transition-colors"
          title="Збільшити"
        >
          +
        </button>
        {zoomScale !== 1.2 && (
          <button
            type="button"
            onClick={() => onZoomChange(1.2)}
            className="px-2 py-1 text-[10px] text-purple-600 font-bold hover:bg-purple-50 rounded-lg transition-colors"
          >
            100%
          </button>
        )}
      </div>

      {/* ── Інструменти редагування ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 overflow-x-auto max-w-full">
        {/* Рука */}
        <button
          type="button"
          onClick={() => onToolChange('hand')}
          className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
            currentTool === 'hand'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
          title="Рука (прокрутка)"
        >
          🖐️ <span className="hidden md:inline">Рука</span>
        </button>

        {/* Пензель */}
        <button
          type="button"
          onClick={() => onToolChange('brush')}
          className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
            currentTool === 'brush'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
          title="Пензель для малювання"
        >
          ✏️ <span className="hidden md:inline">Пензель</span>
        </button>

        {/* Маркер */}
        <button
          type="button"
          onClick={() => onToolChange('highlighter')}
          className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
            currentTool === 'highlighter'
              ? 'bg-yellow-500 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
          title="Маркер (виділювач тексту)"
        >
          🖊️ <span className="hidden md:inline">Маркер</span>
        </button>

        {/* Текст */}
        <button
          type="button"
          onClick={() => onToolChange('text')}
          className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
            currentTool === 'text'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
          title="Ввести текст / відповідь"
        >
          💬 <span className="hidden md:inline">Текст</span>
        </button>

        {/* Штамп Гачка */}
        <button
          type="button"
          onClick={() => onToolChange('stamp_check')}
          className={`px-2 py-1.5 rounded-lg font-bold flex items-center transition-all ${
            currentTool === 'stamp_check'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
          title="Поставити гачку (✔)"
        >
          ✔
        </button>

        {/* Штамп Хрестик */}
        <button
          type="button"
          onClick={() => onToolChange('stamp_cross')}
          className={`px-2 py-1.5 rounded-lg font-bold flex items-center transition-all ${
            currentTool === 'stamp_cross'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
          title="Поставити хрестик (✖)"
        >
          ✖
        </button>

        {/* Штамп Коло */}
        <button
          type="button"
          onClick={() => onToolChange('stamp_circle')}
          className={`px-2 py-1.5 rounded-lg font-bold flex items-center transition-all ${
            currentTool === 'stamp_circle'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-blue-700 hover:bg-blue-50'
          }`}
          title="Обвести варіант (⭕)"
        >
          ⭕
        </button>

        {/* Стрілка */}
        <button
          type="button"
          onClick={() => onToolChange('stamp_arrow')}
          className={`px-2 py-1.5 rounded-lg font-bold flex items-center transition-all ${
            currentTool === 'stamp_arrow'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-purple-700 hover:bg-purple-50'
          }`}
          title="Намалювати стрілку (➜)"
        >
          ➔
        </button>

        {/* Стерка */}
        <button
          type="button"
          onClick={() => onToolChange('eraser')}
          className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
            currentTool === 'eraser'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
          title="Стерти малюнок чи штамп"
        >
          🧽 <span className="hidden md:inline">Стерка</span>
        </button>
      </div>

      {/* ── Палітра кольорів та розмір ──────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1.5">
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

        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
          {BRUSH_SIZES.map(({ label, size }) => (
            <button
              key={size}
              type="button"
              onClick={() => onSizeChange(size)}
              className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] transition-all ${
                brushSize === size
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title={`Товщина ${size}px`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Дії (Undo / Redo / Clear) ───────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="px-2 py-1 rounded-lg hover:bg-gray-200 disabled:opacity-30 font-semibold transition-colors"
          title="Скасувати (Ctrl+Z)"
        >
          ↩️
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="px-2 py-1 rounded-lg hover:bg-gray-200 disabled:opacity-30 font-semibold transition-colors"
          title="Повторити (Ctrl+Y)"
        >
          ↪️
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-2 py-1 rounded-lg hover:bg-red-100 text-red-600 font-semibold transition-colors"
          title="Очистити поточну сторінку"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
