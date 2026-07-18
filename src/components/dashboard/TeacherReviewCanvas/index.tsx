'use client';

import { useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Tool, TeacherReviewCanvasProps } from './types';
import { useReviewCanvasState } from './useReviewCanvasState';
import { useReviewCanvasTools } from './useReviewCanvasTools';
import { ReviewToolbar } from './ReviewToolbar';

/**
 * TeacherReviewCanvas — полотно для перевірки та рецензування роботи учня.
 *
 * Складається з:
 *  - useReviewCanvasState  → ініціалізація, undo, localStorage
 *  - useReviewCanvasTools  → пензель, стерка, рука, текст (position:fixed), Ctrl+Z
 *  - ReviewToolbar         → UI панель інструментів
 */
export default function TeacherReviewCanvas({
  imageUrl,
  homeworkId,
  currentTitle,
  currentComment = '',
  onSave,
}: TeacherReviewCanvasProps) {
  const supabase = createClient();

  const wrapperRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentTool, setCurrentTool]     = useState<Tool>('brush');
  const [drawColor, setDrawColor]         = useState('#dc2626');
  const [brushSize, setBrushSize]         = useState(4);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [teacherFeedback, setTeacherFeedback] = useState(currentComment);

  // ─── Стан canvas: зображення, undo, localStorage ────────────────────────────
  const {
    canvasRef,
    bgImageRef,
    undoStack,
    storageKey,
    saveCanvasState,
    restoreCanvasState,
    clearCanvas,
  } = useReviewCanvasState({ imageUrl, homeworkId });

  // ─── Інструменти малювання ──────────────────────────────────────────────────
  const {
    activeTextarea,
    finalizeLiveText,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
  } = useReviewCanvasTools({
    canvasRef,
    bgImageRef,
    wrapperRef,
    undoStack,
    currentTool,
    drawColor,
    brushSize,
    saveCanvasState,
    restoreCanvasState,
  });

  // ─── Зміна інструменту ──────────────────────────────────────────────────────
  const handleToolChange = useCallback((tool: Tool) => {
    if (activeTextarea.current) finalizeLiveText();
    setCurrentTool(tool);
  }, [activeTextarea, finalizeLiveText]);

  // ─── Undo через кнопку ──────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (activeTextarea.current) finalizeLiveText();
    if (undoStack.current!.length > 1) {
      undoStack.current!.pop();
      restoreCanvasState(undoStack.current![undoStack.current!.length - 1]);
    }
  }, [activeTextarea, finalizeLiveText, undoStack, restoreCanvasState]);

  // ─── Очистити canvas ────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    if (activeTextarea.current) {
      activeTextarea.current.remove();
      activeTextarea.current = null;
    }
    if (confirm('Скасувати всі виправлення?')) {
      clearCanvas();
    }
  }, [activeTextarea, clearCanvas]);

  // ─── Надіслати рецензію учню ────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (activeTextarea.current) finalizeLiveText();

    setIsSaving(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('Не вдалося згенерувати зображення');

      const fileName = `reviews/${homeworkId}_reviewed_${Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from('homework-attachments')
        .upload(fileName, blob, { contentType: 'image/png', upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('homework-attachments')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('homeworks')
        .update({
          status: 'reviewed',
          student_response_url: publicUrl,
          teacher_comment: teacherFeedback,
          updated_at: new Date().toISOString(),
        })
        .eq('id', homeworkId);
      if (dbError) throw dbError;

      localStorage.removeItem(storageKey);
      alert('✅ Завдання успішно перевірено! Учень побачить ваші виправлення та коментар.');
      onSave();
    } catch (err: unknown) {
      console.error('Save review error:', err);
      alert(`❌ Помилка: ${err instanceof Error ? err.message : 'Невідома помилка'}`);
    } finally {
      setIsSaving(false);
    }
  }, [canvasRef, activeTextarea, finalizeLiveText, homeworkId, teacherFeedback, storageKey, supabase, onSave]);

  const cursorStyle = currentTool === 'hand' ? 'grab'
    : currentTool === 'text' ? 'text'
    : 'crosshair';

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm ${
        isFullscreen
          ? '!fixed !inset-0 !z-[9999] !rounded-none !flex !flex-col'
          : ''
      }`}
    >
      {/* ── Заголовок ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50/50 border-b border-gray-200">
        <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2">
          <span>📋</span> Перевірка та рецензування роботи учня
          {currentTitle && (
            <span className="text-xs font-normal text-gray-500 ml-1">
              — {currentTitle}
            </span>
          )}
        </h3>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isFullscreen ? '🔽 Згорнути' : '⛶ Повний екран'}
        </button>
      </div>

      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-[10000] w-10 h-10 rounded-full bg-black/40 text-white text-2xl flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          ✕
        </button>
      )}

      {/* ── Панель інструментів ────────────────────────────────────────────── */}
      <ReviewToolbar
        currentTool={currentTool}
        drawColor={drawColor}
        brushSize={brushSize}
        onToolChange={handleToolChange}
        onColorChange={setDrawColor}
        onSizeChange={setBrushSize}
        onUndo={handleUndo}
        onClear={handleClear}
      />

      {/* ── Підказка для текстового інструменту ───────────────────────────── */}
      {currentTool === 'text' && (
        <div className="px-4 py-1.5 bg-indigo-50 border-b border-indigo-100 text-xs text-indigo-600 flex items-center gap-1.5">
          💡 Клікніть у будь-яке місце зображення щоб залишити текстовий коментар.
          Enter — зафіксувати, Esc — скасувати.
        </div>
      )}

      {/* ── Canvas ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          ref={wrapperRef}
          className="relative overflow-auto bg-gray-100/50 touch-none"
          style={{ cursor: cursorStyle }}
        >
          <canvas
            ref={canvasRef}
            className="block mx-auto shadow-sm"
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
          />
        </div>

        {/* ── Текстовий коментар вчителя ─────────────────────────────────── */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <label className="block text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
            <span>💬</span> Текстовий коментар / Зауваження для учня:
          </label>
          <textarea
            value={teacherFeedback}
            onChange={(e) => setTeacherFeedback(e.target.value)}
            placeholder="Напишіть загальний відгук про виконання (наприклад: Чудова робота! Зверни увагу на помилку в третьому рядку...)"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-y"
          />
        </div>

        {/* ── Кнопка збереження ──────────────────────────────────────────── */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><span className="animate-spin">⏳</span> Зберігаю рецензію...</>
            ) : (
              <>✅ Надіслати перевірене завдання з коментарями</>
            )}
          </button>
        </div>
      </div>

      {/* ── Глобальні стилі textarea (position:fixed задається через JS) ── */}
      <style jsx global>{`
        .t-canvas-live-textarea {
          background: rgba(255, 255, 255, 0.04) !important;
          backdrop-filter: blur(1px);
          border: 1.5px dashed rgba(99, 102, 241, 0.6);
          border-radius: 5px;
          padding: 3px 7px;
          font-family: 'Inter', sans-serif;
          font-weight: bold;
          outline: none !important;
          box-shadow:
            0 0 0 3px rgba(99, 102, 241, 0.1),
            0 2px 12px rgba(0, 0, 0, 0.08);
          resize: none;
          overflow: hidden;
          z-index: 9999;
          line-height: 1.25;
          min-width: 80px;
          white-space: pre;
          transform: translateY(-2px);
        }
        .t-canvas-live-textarea:focus {
          outline: none !important;
          border: 1.5px dashed rgba(99, 102, 241, 0.9);
          box-shadow:
            0 0 0 3px rgba(99, 102, 241, 0.18),
            0 2px 16px rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.06) !important;
        }
      `}</style>
    </div>
  );
}
