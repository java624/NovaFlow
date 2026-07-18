'use client';

import { useState, useRef, useCallback } from 'react';
import { Tool, HomeworkCanvasProps } from './types';
import { useCanvasState } from './useCanvasState';
import { useCanvasTools } from './useCanvasTools';
import { CanvasToolbar } from './CanvasToolbar';

/**
 * HomeworkCanvas — інтерактивний примітчик для виконання домашнього завдання.
 *
 * Складається з:
 *  - useCanvasState  → ініціалізація, undo/redo, localStorage
 *  - useCanvasTools  → пензель, стерка, рука, текст, клавіатурні скорочення
 *  - CanvasToolbar   → UI панель інструментів
 */
export default function HomeworkCanvas({ imageUrl, homeworkId, onSave }: HomeworkCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentTool, setCurrentTool] = useState<Tool>('brush');
  const [drawColor, setDrawColor]     = useState('#dc2626');
  const [brushSize, setBrushSize]     = useState(4);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving]       = useState(false);

  // ─── Стан canvas: зображення, undo/redo, localStorage ──────────────────────
  const {
    canvasRef,
    bgImageRef,
    undoStack,
    redoStack,
    storageKey,
    saveCanvasState,
    restoreCanvasState,
    clearCanvas,
  } = useCanvasState({ imageUrl, homeworkId });

  // ─── Інструменти малювання ──────────────────────────────────────────────────
  const {
    activeTextarea,
    finalizeLiveText,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
  } = useCanvasTools({
    canvasRef,
    bgImageRef,
    wrapperRef,
    undoStack,
    redoStack,
    currentTool,
    drawColor,
    brushSize,
    saveCanvasState,
    restoreCanvasState,
  });

  // ─── Зміна інструменту (зафіксувати текст якщо відкритий) ──────────────────
  const handleToolChange = useCallback((tool: Tool) => {
    if (activeTextarea.current) finalizeLiveText();
    setCurrentTool(tool);
  }, [activeTextarea, finalizeLiveText]);

  // ─── Undo / Redo через кнопки ───────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (activeTextarea.current) finalizeLiveText();
    if (undoStack.current.length > 1) {
      redoStack.current.push(undoStack.current.pop()!);
      restoreCanvasState(undoStack.current[undoStack.current.length - 1]);
    }
  }, [activeTextarea, finalizeLiveText, undoStack, redoStack, restoreCanvasState]);

  const handleRedo = useCallback(() => {
    if (activeTextarea.current) finalizeLiveText();
    if (redoStack.current.length > 0) {
      const state = redoStack.current.pop()!;
      undoStack.current.push(state);
      restoreCanvasState(state);
    }
  }, [activeTextarea, finalizeLiveText, undoStack, redoStack, restoreCanvasState]);

  // ─── Очистити canvas ────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    if (activeTextarea.current) {
      activeTextarea.current.remove();
      activeTextarea.current = null;
    }
    if (confirm('Очистити всі записи на сторінці?')) {
      clearCanvas();
    }
  }, [activeTextarea, clearCanvas]);

  // ─── Надіслати роботу вчителю ───────────────────────────────────────────────
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

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const fileName = `results/${homeworkId}_${Date.now()}.png`;

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
          status: 'completed',
          student_response_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', homeworkId);
      if (dbError) throw dbError;

      localStorage.removeItem(storageKey);
      alert('🎉 Роботу успішно збережено та надіслано вчителю!');
      onSave?.();
    } catch (err: unknown) {
      console.error('Save error:', err);
      alert(`❌ Помилка: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  }, [canvasRef, activeTextarea, finalizeLiveText, homeworkId, storageKey, onSave]);

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
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          📝 Інтерактивний примітчик завдання
        </h3>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isFullscreen ? '🔽 Згорнути' : '⛶ Повний екран'}
        </button>
      </div>

      {/* ── Панель інструментів ────────────────────────────────────────────── */}
      <CanvasToolbar
        currentTool={currentTool}
        drawColor={drawColor}
        brushSize={brushSize}
        undoStack={undoStack}
        redoStack={redoStack}
        onToolChange={handleToolChange}
        onColorChange={setDrawColor}
        onSizeChange={setBrushSize}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
      />

      {/* ── Підказка для текстового інструменту ───────────────────────────── */}
      {currentTool === 'text' && (
        <div className="px-4 py-1.5 bg-indigo-50 border-b border-indigo-100 text-xs text-indigo-600 flex items-center gap-1.5">
          💡 Клікніть у будь-яке місце зображення щоб написати текст.
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

      {/* ── Кнопка збереження ─────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <><span className="animate-spin">⏳</span> Надсилаю...</>
          ) : (
            <>📤 Надіслати виконане завдання</>
          )}
        </button>
      </div>

      {/* ── Глобальні стилі для текстового поля (position:fixed) ──────────── */}
      <style jsx global>{`
        .canvas-live-textarea {
          /* position та left/top задаються через JS як 'fixed' */
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
        .canvas-live-textarea:focus {
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
