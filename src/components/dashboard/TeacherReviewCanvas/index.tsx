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

  // ─── Undo / Redo ────────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (activeTextarea.current) finalizeLiveText();
    if (undoStack.current.length > 1) {
      // redoStack не потрібен для викладача — просто відміна останньої дії
      undoStack.current.pop();
      restoreCanvasState(undoStack.current[undoStack.current.length - 1]);
    }
  }, [activeTextarea, finalizeLiveText, undoStack, restoreCanvasState]);

  // ─── Очистити canvas ────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    if (activeTextarea.current) {
      activeTextarea.current.remove();
      activeTextarea.current = null;
    }
    if (confirm('Скасувати виправлення?')) {
      clearCanvas();
    }
  }, [activeTextarea, clearCanvas]);

  // ─── Зберегти рецензію ──────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (activeTextarea.current) finalizeLiveText();

    setIsSaving(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('Failed to create image');

      const fileName = `reviews/review_${homeworkId}_${Date.now()}.png`;

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

      alert('✅ Рецензію збережено та відправлено учню!');
      onSave();
    } catch (err: unknown) {
      console.error('Save review error:', err);
      alert(`❌ Помилка: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  }, [canvasRef, activeTextarea, finalizeLiveText, supabase, homeworkId, teacherFeedback, onSave]);

  const cursorStyle = currentTool === 'hand' ? 'grab'
    : currentTool === 'text' ? 'text'
    : 'crosshair';

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* ── Заголовок ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
        <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2">
          📋 Перевірка роботи
          {currentTitle && <span className="text-xs font-normal text-gray-500">— {currentTitle}</span>}
        </h3>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isFullscreen ? '🔽 Згорнути' : '⛶ Повний екран'}
        </button>
      </div>

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
          💡 Клікніть у будь-яке місце зображення щоб залишити коментар.
          Enter — зафіксувати, Esc — скасувати.
        </div>
      )}

      {/* ── Canvas ────────────────────────────────────────────────────────── */}
      <div
        ref={wrapperRef}
        className="relative overflow-auto bg-gray-100/50 touch-none"
        style={{ cursor: cursorStyle }}
      >
        <div className="relative mx-auto shadow-sm w-fit">
          <canvas
            ref={canvasRef}
            className="block"
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
          />
        </div>
      </div>

      {/* ── Коментар вчителя ──────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <label className="block text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
          💬 Текстовий коментар / Зауваження для учня:
        </label>
        <textarea
          value={teacherFeedback}
          onChange={(e) => setTeacherFeedback(e.target.value)}
          placeholder="Напишіть коментар до роботи..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-y"
        />
      </div>

      {/* ── Кнопка збереження ─────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <><span className="animate-spin">⏳</span> Зберігаю рецензію...</>
          ) : (
            <>✅ Зберегти та надіслати перевірену роботу</>
          )}
        </button>
      </div>
    </div>
  );
}