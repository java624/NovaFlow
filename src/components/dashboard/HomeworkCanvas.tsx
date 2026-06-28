'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface HomeworkCanvasProps {
  imageUrl: string;
  homeworkId: string;
  onSave?: () => void;
}

type Tool = 'brush' | 'text' | 'eraser' | 'hand';

interface Point {
  x: number;
  y: number;
}

export default function HomeworkCanvas({ imageUrl, homeworkId, onSave }: HomeworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(new Image());
  const [currentTool, setCurrentTool] = useState<Tool>('brush');
  const [drawColor, setDrawColor] = useState('#dc2626');
  const [brushSize, setBrushSize] = useState(4);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Drawing state refs
  const isDrawing = useRef(false);
  const isDragging = useRef(false);
  const lastPos = useRef<Point>({ x: 0, y: 0 });
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const offset = useRef<Point>({ x: 0, y: 0 });
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const activeTextarea = useRef<HTMLTextAreaElement | null>(null);

  // Initialize canvas with background image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = bgImageRef.current;
    img.crossOrigin = 'anonymous';
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
      redoStack.current = [];
      saveCanvasState();
    };

    return () => {
      img.onload = null;
    };
  }, [imageUrl]);

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (undoStack.current.length > 20) undoStack.current.shift();
    undoStack.current.push(canvas.toDataURL());
    redoStack.current = [];
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

  const getEventCoords = useCallback((
    e: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const nativeEvent = e.nativeEvent as any;
    if (nativeEvent.touches && nativeEvent.touches.length > 0) {
      return { clientX: nativeEvent.touches[0].clientX, clientY: nativeEvent.touches[0].clientY };
    }
    if (nativeEvent.changedTouches && nativeEvent.changedTouches.length > 0) {
      return { clientX: nativeEvent.changedTouches[0].clientX, clientY: nativeEvent.changedTouches[0].clientY };
    }
    const pointerEvent = e as React.PointerEvent<HTMLCanvasElement>;
    return { clientX: pointerEvent.clientX, clientY: pointerEvent.clientY };
  }, []);

  const getCanvasPos = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 1;
    const height = rect.height || 1;
    return {
      x: ((clientX - rect.left) / width) * canvas.width,
      y: ((clientY - rect.top) / height) * canvas.height,
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
      const baseFontSize = parseFloat(ta.dataset.baseFontSize || ta.style.fontSize);
      const color = ta.style.color;

      ctx.font = `bold ${baseFontSize}px 'Inter', sans-serif`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';
      ctx.fillText(text, x, y);
      saveCanvasState();
    }
    ta.remove();
    activeTextarea.current = null;
  }, [saveCanvasState]);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Finalize any open text
    if (activeTextarea.current) {
      finalizeLiveText();
      return;
    }

    const { clientX, clientY } = getEventCoords(e);

    if (currentTool === 'text') {
      const rect = canvas.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      const canvasPos = getCanvasPos(clientX, clientY);

      const fontSize = parseInt(brushSize.toString()) * 2 + 14;
      const scaleX = rect.width ? (rect.width / canvas.width) : 1;
      const displayFontSize = fontSize * scaleX;

      const textarea = document.createElement('textarea');
      textarea.className = 'canvas-live-textarea';
      textarea.style.left = `${screenX}px`;
      textarea.style.top = `${screenY}px`;
      textarea.style.fontSize = `${displayFontSize}px`;
      textarea.style.color = drawColor;
      textarea.style.width = `${160 * scaleX}px`;
      textarea.style.height = `${displayFontSize * 1.4}px`;
      
      textarea.dataset.canvasX = canvasPos.x.toString();
      textarea.dataset.canvasY = canvasPos.y.toString();
      textarea.dataset.baseFontSize = fontSize.toString();

      const container = canvasContainerRef.current;
      if (container) container.appendChild(textarea);
      setTimeout(() => textarea.focus(), 10);

      textarea.addEventListener('input', () => {
        textarea.style.width = 'auto';
        textarea.style.width = `${textarea.scrollWidth + 20}px`;
      });
      textarea.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && !ev.shiftKey) {
          ev.preventDefault();
          finalizeLiveText();
        }
      });

      activeTextarea.current = textarea;
      return;
    }

    if (currentTool === 'hand') {
      isDragging.current = true;
      dragStart.current = { x: clientX - offset.current.x, y: clientY - offset.current.y };
      const wrapper = wrapperRef.current;
      if (wrapper) wrapper.style.cursor = 'grabbing';
      return;
    }

    const pos = getCanvasPos(clientX, clientY);
    isDrawing.current = true;
    lastPos.current = pos;
  }, [currentTool, brushSize, drawColor, getCanvasPos, getEventCoords, finalizeLiveText]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { clientX, clientY } = getEventCoords(e);

    // Hand panning
    if (currentTool === 'hand' && isDragging.current) {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      offset.current = { x: clientX - dragStart.current.x, y: clientY - dragStart.current.y };
      wrapper.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px)`;
      return;
    }

    if (!isDrawing.current) return;

    const pos = getCanvasPos(clientX, clientY);

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
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    lastPos.current = pos;
  }, [currentTool, brushSize, drawColor, getCanvasPos, getEventCoords]);

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
        if (e.shiftKey) {
          // Redo
          if (activeTextarea.current) finalizeLiveText();
          if (redoStack.current.length > 0) {
            const state = redoStack.current.pop()!;
            undoStack.current.push(state);
            restoreCanvasState(state);
          }
        } else {
          // Undo
          if (activeTextarea.current) finalizeLiveText();
          if (undoStack.current.length > 1) {
            redoStack.current.push(undoStack.current.pop()!);
            const prev = undoStack.current[undoStack.current.length - 1];
            restoreCanvasState(prev);
          }
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [finalizeLiveText, restoreCanvasState]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (activeTextarea.current) {
      activeTextarea.current.remove();
      activeTextarea.current = null;
    }
    if (confirm('Очистити всі записи на сторінці?')) {
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
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
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

      alert('🎉 Роботу успішно збережено та надіслано вчителю!');
      onSave?.();
    } catch (err: unknown) {
      console.error('Save error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`❌ Помилка: ${errMsg}`);
    } finally {
      setIsSaving(false);
    }
  }, [homeworkId, finalizeLiveText, onSave]);

  const tools: { id: Tool; label: string; icon: string }[] = [
    { id: 'brush', label: 'Пензель', icon: '🖌️' },
    { id: 'text', label: 'Текст', icon: '📝' },
    { id: 'eraser', label: 'Стерка', icon: '🧹' },
    { id: 'hand', label: 'Рука', icon: '✋' },
  ];

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Header */}
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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-100">
        {/* Tools */}
        <div className="flex gap-1">
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

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Undo / Redo */}
        <button
          onClick={() => {
            if (activeTextarea.current) finalizeLiveText();
            if (undoStack.current.length > 1) {
              redoStack.current.push(undoStack.current.pop()!);
              restoreCanvasState(undoStack.current[undoStack.current.length - 1]);
            }
          }}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Скасувати (Ctrl+Z)"
        >
          ↩️
        </button>
        <button
          onClick={() => {
            if (activeTextarea.current) finalizeLiveText();
            if (redoStack.current.length > 0) {
              const state = redoStack.current.pop()!;
              undoStack.current.push(state);
              restoreCanvasState(state);
            }
          }}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Повернути (Ctrl+Shift+Z)"
        >
          ↪️
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

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

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Clear */}
        <button
          onClick={handleClear}
          className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          🗑️ Очистити
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={wrapperRef}
        className="relative overflow-auto bg-gray-100/50 touch-none"
        style={{ cursor: currentTool === 'hand' ? 'grab' : 'crosshair' }}
      >
        <div
          ref={canvasContainerRef}
          className="relative mx-auto shadow-sm w-fit"
        >
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

      {/* Save Button */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <span className="animate-spin">⏳</span>
              Надсилаю...
            </>
          ) : (
            <>
              📤 Надіслати виконане завдання
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .canvas-live-textarea {
          position: absolute;
          background: transparent !important;
          border: 1px dashed rgba(99, 102, 241, 0.4);
          border-radius: 4px;
          padding: 2px 4px;
          font-family: 'Inter', sans-serif;
          font-weight: bold;
          outline: none !important;
          box-shadow: none !important;
          resize: none;
          overflow: hidden;
          z-index: 10;
          line-height: 1.2;
          min-width: 60px;
        }
        .canvas-live-textarea:focus {
          outline: none !important;
          border: 1px dashed rgba(99, 102, 241, 0.6);
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}