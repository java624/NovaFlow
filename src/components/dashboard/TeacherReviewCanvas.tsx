'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TeacherReviewCanvasProps {
  imageUrl: string;
  homeworkId: string;
  currentTitle?: string;
  currentComment?: string;
  onSave: () => void;
}

type Tool = 'brush' | 'text' | 'eraser' | 'hand';

interface Point {
  x: number;
  y: number;
}

export default function TeacherReviewCanvas({
  imageUrl,
  homeworkId,
  currentTitle,
  currentComment = '',
  onSave,
}: TeacherReviewCanvasProps) {
  const supabase = createClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(new Image());
  const [currentTool, setCurrentTool] = useState<Tool>('brush');
  const [drawColor, setDrawColor] = useState('#dc2626');
  const [brushSize, setBrushSize] = useState(4);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [teacherFeedback, setTeacherFeedback] = useState(currentComment);

  // Drawing state refs
  const isDrawing = useRef(false);
  const isDragging = useRef(false);
  const lastPos = useRef<Point>({ x: 0, y: 0 });
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const offset = useRef<Point>({ x: 0, y: 0 });
  const undoStack = useRef<string[]>([]);
  const activeTextarea = useRef<HTMLTextAreaElement | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = bgImageRef.current;
    img.crossOrigin = 'anonymous';

    const hasImage = imageUrl && imageUrl !== 'null' && imageUrl.trim() !== '';

    if (!hasImage) {
      canvas.width = 850;
      canvas.height = 600;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      undoStack.current = [];
      saveCanvasState();
      return;
    }

    img.src = imageUrl;

    img.onload = () => {
      const maxWidth = 850;
      canvas.width = img.width > maxWidth ? maxWidth : img.width;
      const scale = canvas.width / img.width;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      undoStack.current = [];
      saveCanvasState();
    };

    img.onerror = () => {
      canvas.width = 850;
      canvas.height = 600;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      undoStack.current = [];
      saveCanvasState();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (undoStack.current.length > 20) undoStack.current.shift();
    undoStack.current.push(canvas.toDataURL());
  }, []);

  const restoreCanvasState = useCallback((dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }, []);

  const getCanvasPos = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const getDisplayPos = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  /** Returns coordinates relative to the wrapper container (for textarea/absolute positioning) */
  const getWrapperPos = useCallback((clientX: number, clientY: number): Point => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return { x: 0, y: 0 };
    const rect = wrapper.getBoundingClientRect();
    return {
      x: clientX - rect.left + wrapper.scrollLeft,
      y: clientY - rect.top + wrapper.scrollTop,
    };
  }, []);

  const finalizeLiveText = useCallback(() => {
    const ta = activeTextarea.current;
    if (!ta) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const text = ta.value.trim();
    if (text) {
      const x = parseFloat(ta.dataset.canvasX || '0');
      const y = parseFloat(ta.dataset.canvasY || '0');
      const fontSize = parseFloat(ta.dataset.canvasFontSize || '18');
      const color = ta.dataset.canvasColor || '#dc2626';

      ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';

      const lines = text.split('\n');
      let currentY = y;
      lines.forEach((line) => {
        ctx.fillText(line, x, currentY);
        currentY += fontSize * 1.2;
      });

      saveCanvasState();
    }
    ta.remove();
    activeTextarea.current = null;
  }, [saveCanvasState]);

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (activeTextarea.current) {
        finalizeLiveText();
        return;
      }

      if (currentTool === 'text') {
        const rect = canvas.getBoundingClientRect();
        // Use wrapper-relative coordinates for textarea position (position: absolute inside wrapper)
        const wrapperPos = getWrapperPos(e.clientX, e.clientY);
        const canvasPos = getCanvasPos(e.clientX, e.clientY);
        const fontSize = parseInt(brushSize.toString()) * 2 + 14;
        const scaleX = canvas.width / rect.width;

        const textarea = document.createElement('textarea');
        textarea.className = 't-canvas-live-textarea';
        textarea.style.left = `${wrapperPos.x}px`;
        textarea.style.top = `${wrapperPos.y}px`;
        textarea.style.fontSize = `${fontSize / scaleX}px`;
        textarea.style.color = drawColor;
        textarea.style.width = '160px';
        textarea.style.height = `${(fontSize / scaleX) * 1.4}px`;
        textarea.dataset.canvasX = canvasPos.x.toString();
        textarea.dataset.canvasY = canvasPos.y.toString();
        textarea.dataset.canvasFontSize = fontSize.toString();
        textarea.dataset.canvasColor = drawColor;

        const wrapper = wrapperRef.current;
        if (wrapper) wrapper.appendChild(textarea);
        setTimeout(() => textarea.focus(), 10);

        textarea.addEventListener('input', () => {
          textarea.style.width = 'auto';
          textarea.style.width = `${textarea.scrollWidth + 20}px`;
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        });

        textarea.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' && !ev.shiftKey) {
            ev.preventDefault();
            finalizeLiveText();
          }
          if (ev.key === 'Escape') {
            ev.preventDefault();
            textarea.remove();
            activeTextarea.current = null;
          }
        });

        textarea.addEventListener('blur', () => {
          if (textarea.value.trim() !== '') {
            finalizeLiveText();
          } else {
            textarea.remove();
            activeTextarea.current = null;
          }
        });

        activeTextarea.current = textarea;
        return;
      }

      if (currentTool === 'hand') {
        isDragging.current = true;
        dragStart.current = { x: e.clientX - offset.current.x, y: e.clientY - offset.current.y };
        const wrapper = wrapperRef.current;
        if (wrapper) wrapper.style.cursor = 'grabbing';
        return;
      }

      const pos = getCanvasPos(e.clientX, e.clientY);
      isDrawing.current = true;
      lastPos.current = pos;
    },
    [currentTool, brushSize, drawColor, getCanvasPos, getDisplayPos, getWrapperPos, finalizeLiveText]
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (currentTool === 'hand' && isDragging.current) {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        offset.current = { x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y };
        wrapper.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px)`;
        return;
      }

      if (!isDrawing.current) return;

      const pos = getCanvasPos(e.clientX, e.clientY);

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);

      if (currentTool === 'eraser') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, brushSize * 1.5, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = brushSize;
        ctx.stroke();
      }

      lastPos.current = pos;
    },
    [currentTool, brushSize, drawColor, getCanvasPos]
  );

  const handleCanvasPointerUp = useCallback(() => {
    if (isDrawing.current) {
      isDrawing.current = false;
      saveCanvasState();
    }
    if (isDragging.current) {
      isDragging.current = false;
      const wrapper = wrapperRef.current;
      if (wrapper) wrapper.style.cursor = currentTool === 'hand' ? 'grab' : 'crosshair';
    }
  }, [currentTool, saveCanvasState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (activeTextarea.current) finalizeLiveText();
        if (undoStack.current.length > 1) {
          undoStack.current.pop();
          const prev = undoStack.current[undoStack.current.length - 1];
          restoreCanvasState(prev);
        }
      }
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [finalizeLiveText, restoreCanvasState, isFullscreen]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (activeTextarea.current) {
      activeTextarea.current.remove();
      activeTextarea.current = null;
    }
    if (confirm('Скасувати всі виправлення?')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
      saveCanvasState();
    }
  }, [saveCanvasState]);

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

      const {
        data: { publicUrl },
      } = supabase.storage.from('homework-attachments').getPublicUrl(fileName);

      const updatePayload: Record<string, unknown> = {
        status: 'reviewed',
        student_response_url: publicUrl,
        teacher_comment: teacherFeedback,
        updated_at: new Date().toISOString(),
      };

      const { error: dbError } = await supabase
        .from('homeworks')
        .update(updatePayload)
        .eq('id', homeworkId);

      if (dbError) throw dbError;

      alert('✅ Завдання успішно перевірено! Учень побачить ваші виправлення та коментар.');
      onSave();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Невідома помилка';
      console.error('Save review error:', err);
      alert(`❌ Помилка: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  }, [homeworkId, teacherFeedback, finalizeLiveText, supabase, onSave]);

  const tools: { id: Tool; label: string; icon: string }[] = [
    { id: 'brush', label: 'Червона ручка', icon: '🖊️' },
    { id: 'text', label: 'Текст коментаря', icon: '📝' },
    { id: 'eraser', label: 'Гумка', icon: '🧹' },
    { id: 'hand', label: 'Рука', icon: '✋' },
  ];

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm ${
        isFullscreen
          ? '!fixed !inset-0 !z-[9999] !rounded-none !flex !flex-col'
          : ''
      }`}
    >
      {/* Header */}
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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-100">
        {/* Tools */}
        <div className="flex gap-1 flex-wrap">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (activeTextarea.current) finalizeLiveText();
                setCurrentTool(t.id);
              }}
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
          onClick={() => {
            if (activeTextarea.current) finalizeLiveText();
            if (undoStack.current.length > 1) {
              undoStack.current.pop();
              restoreCanvasState(undoStack.current[undoStack.current.length - 1]);
            }
          }}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Скасувати (Ctrl+Z)"
        >
          ↩️
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

        {/* Color */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500">Колір:</label>
          <input
            type="color"
            value={drawColor}
            onChange={(e) => setDrawColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-gray-200"
          />
        </div>

        {/* Size */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500">Товщина:</label>
          <input
            type="range"
            min={2}
            max={20}
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-20"
          />
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

        {/* Clear */}
        <button
          onClick={handleClear}
          className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          🗑️ Очистити
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          ref={wrapperRef}
          className="relative overflow-auto bg-gray-100/50 touch-none"
          style={{ cursor: currentTool === 'hand' ? 'grab' : 'crosshair' }}
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

        {/* Teacher Feedback */}
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

        {/* Save Button */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="animate-spin">⏳</span>
                Зберігаю рецензію...
              </>
            ) : (
              <>
                ✅ Надіслати перевірене завдання з коментарями
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .t-canvas-live-textarea {
          position: absolute;
          background: transparent;
          border: 1px dashed #6366f1;
          border-radius: 4px;
          padding: 2px 4px;
          font-family: 'Inter', sans-serif;
          font-weight: bold;
          outline: none;
          resize: none;
          overflow: hidden;
          z-index: 10;
          line-height: 1.2;
          min-width: 60px;
        }
      `}</style>
    </div>
  );
}