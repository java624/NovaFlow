'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { PdfTool, PdfHomeworkCanvasProps } from './types';
import { PdfCanvasToolbar } from './PdfCanvasToolbar';
import { isPdfUrl, renderPdfPageToCanvas } from '@/lib/pdf-utils';

export default function PdfHomeworkCanvas({ pdfUrl, homeworkId, onSave }: PdfHomeworkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.25);
  const [loading, setLoading] = useState(true);

  const [currentTool, setCurrentTool] = useState<PdfTool>('brush');
  const [drawColor, setDrawColor] = useState('#dc2626');
  const [brushSize, setBrushSize] = useState(4);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const activeTextarea = useRef<HTMLTextAreaElement | null>(null);

  // Per-page annotations storage (data URLs of drawing layer)
  const pageDrawingsRef = useRef<{ [page: number]: string }>({});
  const pageUndoStacksRef = useRef<{ [page: number]: string[] }>({});
  const pageRedoStacksRef = useRef<{ [page: number]: string[] }>({});

  const storageKey = `pdf_hw_draft_${homeworkId}`;

  // ─── 1. Load Draft from localStorage ───────────────────────────────────────
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          pageDrawingsRef.current = parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load draft:', e);
    }
  }, [storageKey]);

  // Save current page state to memory & localStorage
  const saveCurrentPageState = useCallback(() => {
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return;
    const dataUrl = drawCanvas.toDataURL('image/png');
    pageDrawingsRef.current[currentPage] = dataUrl;

    if (!pageUndoStacksRef.current[currentPage]) {
      pageUndoStacksRef.current[currentPage] = [];
    }
    const undoStack = pageUndoStacksRef.current[currentPage];
    if (undoStack[undoStack.length - 1] !== dataUrl) {
      undoStack.push(dataUrl);
      if (undoStack.length > 30) undoStack.shift();
    }
    pageRedoStacksRef.current[currentPage] = [];

    try {
      localStorage.setItem(storageKey, JSON.stringify(pageDrawingsRef.current));
    } catch (e) {
      console.warn('Storage full/error:', e);
    }
  }, [currentPage, storageKey]);

  // ─── 2. Load PDF Document ──────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadPdf() {
      try {
        const { getPdfJs } = await import('@/lib/pdf-utils');
        const pdfjsLib = await getPdfJs();
        const doc = await pdfjsLib.getDocument(pdfUrl).promise;
        if (isMounted) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load PDF document:', err);
        if (isMounted) setLoading(false);
      }
    }

    if (pdfUrl) loadPdf();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  // ─── 3. Render Current Page ────────────────────────────────────────────────
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !pdfCanvasRef.current || !drawCanvasRef.current) return;

    try {
      const pdfCanvas = pdfCanvasRef.current;
      const drawCanvas = drawCanvasRef.current;

      const dimensions = await renderPdfPageToCanvas(
        pdfDoc,
        currentPage,
        pdfCanvas,
        zoomScale
      );

      // Match drawing canvas size with PDF canvas
      const outputScale = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
      drawCanvas.width = Math.floor(dimensions.width * outputScale);
      drawCanvas.height = Math.floor(dimensions.height * outputScale);
      drawCanvas.style.width = dimensions.width + 'px';
      drawCanvas.style.height = dimensions.height + 'px';

      const ctx = drawCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        // Restore drawing for current page if exists
        const savedPageData = pageDrawingsRef.current[currentPage];
        if (savedPageData) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = savedPageData;
        } else {
          // Initial empty state for undo stack
          saveCurrentPageState();
        }
      }
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  }, [pdfDoc, currentPage, zoomScale, saveCurrentPageState]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // ─── 4. Drawing Logic ──────────────────────────────────────────────────────
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const finalizeLiveText = useCallback(() => {
    if (!activeTextarea.current || !drawCanvasRef.current) return;
    const textarea = activeTextarea.current;
    const text = textarea.value.trim();
    const x = parseFloat(textarea.dataset.canvasX || '0');
    const y = parseFloat(textarea.dataset.canvasY || '0');
    const color = textarea.dataset.color || '#dc2626';

    textarea.remove();
    activeTextarea.current = null;

    if (text) {
      const ctx = drawCanvasRef.current.getContext('2d');
      if (ctx) {
        const fontSize = Math.max(16, brushSize * 4);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';

        const lines = text.split('\n');
        lines.forEach((line, index) => {
          ctx.fillText(line, x, y + index * (fontSize * 1.2));
        });
        saveCurrentPageState();
      }
    }
  }, [brushSize, saveCurrentPageState]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (currentTool === 'hand') return;
    if (activeTextarea.current) {
      finalizeLiveText();
      return;
    }

    const coords = getCanvasCoords(e);

    if (currentTool === 'text') {
      const canvas = drawCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickClientX = e.clientX;
      const clickClientY = e.clientY;

      const textarea = document.createElement('textarea');
      textarea.className = 'pdf-live-textarea';
      textarea.style.position = 'fixed';
      textarea.style.left = `${clickClientX}px`;
      textarea.style.top = `${clickClientY}px`;
      textarea.style.color = drawColor;
      textarea.style.fontSize = `${Math.max(14, brushSize * 3)}px`;

      textarea.dataset.canvasX = String(coords.x);
      textarea.dataset.canvasY = String(coords.y);
      textarea.dataset.color = drawColor;

      textarea.onkeydown = (evt) => {
        if (evt.key === 'Enter' && !evt.shiftKey) {
          evt.preventDefault();
          finalizeLiveText();
        } else if (evt.key === 'Escape') {
          textarea.remove();
          activeTextarea.current = null;
        }
      };

      document.body.appendChild(textarea);
      textarea.focus();
      activeTextarea.current = textarea;
      return;
    }

    isDrawingRef.current = true;
    lastPointRef.current = coords;

    const ctx = drawCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || currentTool === 'hand' || currentTool === 'text') return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !lastPointRef.current) return;

    const coords = getCanvasCoords(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = brushSize * 2;
    } else if (currentTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      // Semi-transparent highlight
      ctx.strokeStyle = drawColor.length === 7 ? `${drawColor}66` : drawColor;
      ctx.lineWidth = brushSize * 5;
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 6;
    }

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPointRef.current = coords;
  };

  const handlePointerUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      saveCurrentPageState();
    }
  };

  // ─── 5. Undo / Redo / Clear Page ───────────────────────────────────────────
  const handleUndo = () => {
    if (activeTextarea.current) finalizeLiveText();
    const undoStack = pageUndoStacksRef.current[currentPage] || [];
    const redoStack = pageRedoStacksRef.current[currentPage] || [];

    if (undoStack.length > 1) {
      const current = undoStack.pop()!;
      redoStack.push(current);
      const prevState = undoStack[undoStack.length - 1];
      pageDrawingsRef.current[currentPage] = prevState;

      const drawCanvas = drawCanvasRef.current;
      const ctx = drawCanvas?.getContext('2d');
      if (drawCanvas && ctx) {
        ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = prevState;
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(pageDrawingsRef.current));
      } catch (e) {}
    }
  };

  const handleRedo = () => {
    if (activeTextarea.current) finalizeLiveText();
    const undoStack = pageUndoStacksRef.current[currentPage] || [];
    const redoStack = pageRedoStacksRef.current[currentPage] || [];

    if (redoStack.length > 0) {
      const state = redoStack.pop()!;
      undoStack.push(state);
      pageDrawingsRef.current[currentPage] = state;

      const drawCanvas = drawCanvasRef.current;
      const ctx = drawCanvas?.getContext('2d');
      if (drawCanvas && ctx) {
        ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = state;
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(pageDrawingsRef.current));
      } catch (e) {}
    }
  };

  const handleClear = () => {
    if (confirm('Очистити всі записи на цій сторінці?')) {
      const drawCanvas = drawCanvasRef.current;
      const ctx = drawCanvas?.getContext('2d');
      if (drawCanvas && ctx) {
        ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        saveCurrentPageState();
      }
    }
  };

  // ─── 6. Save & Submit Response ─────────────────────────────────────────────
  const handleSave = async () => {
    if (activeTextarea.current) finalizeLiveText();
    setIsSaving(true);

    try {
      saveCurrentPageState();
      const pdfCanvas = pdfCanvasRef.current;
      const drawCanvas = drawCanvasRef.current;
      if (!pdfCanvas || !drawCanvas) throw new Error('Canvas elements not available');

      // Create composite canvas of current active view
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = pdfCanvas.width;
      tempCanvas.height = pdfCanvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) throw new Error('Context error');

      // Fill white background
      tCtx.fillStyle = '#ffffff';
      tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw PDF page & drawing layer
      tCtx.drawImage(pdfCanvas, 0, 0);
      tCtx.drawImage(drawCanvas, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        tempCanvas.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('Failed to create composite image');

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const fileName = `results/pdf_hw_${homeworkId}_${Date.now()}.png`;

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
      alert('🎉 Виконане PDF-завдання успішно збережено та надіслано вчителю!');
      onSave?.();
    } catch (err: any) {
      console.error('PDF save error:', err);
      alert(`❌ Помилка при збереженні: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const undoStack = pageUndoStacksRef.current[currentPage] || [];
  const redoStack = pageRedoStacksRef.current[currentPage] || [];

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none flex flex-col' : ''
      }`}
    >
      {/* ── Заголовок ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span>📄</span> Інтерактивний PDF-примітчик
        </h3>
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isFullscreen ? '🔽 Згорнути' : '⛶ Повний екран'}
        </button>
      </div>

      {/* ── Панель інструментів ────────────────────────────────────────────── */}
      <PdfCanvasToolbar
        currentTool={currentTool}
        drawColor={drawColor}
        brushSize={brushSize}
        currentPage={currentPage}
        totalPages={totalPages}
        zoomScale={zoomScale}
        canUndo={undoStack.length > 1}
        canRedo={redoStack.length > 0}
        onToolChange={(tool) => {
          if (activeTextarea.current) finalizeLiveText();
          setCurrentTool(tool);
        }}
        onColorChange={setDrawColor}
        onSizeChange={setBrushSize}
        onPageChange={(page) => {
          if (activeTextarea.current) finalizeLiveText();
          saveCurrentPageState();
          setCurrentPage(page);
        }}
        onZoomChange={(zoom) => {
          saveCurrentPageState();
          setZoomScale(zoom);
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
      />

      {/* ── Текстова підказка ─────────────────────────────────────────────── */}
      {currentTool === 'text' && (
        <div className="px-4 py-1.5 bg-purple-50 border-b border-purple-100 text-xs text-purple-700 flex items-center gap-1.5">
          💡 Клацніть у будь-якому місці PDF сторінки, щоб ввести відповідь. Enter — зберегти.
        </div>
      )}

      {/* ── Canvas Полотно PDF ────────────────────────────────────────────── */}
      <div
        ref={wrapperRef}
        className="relative flex-1 overflow-auto bg-gray-100 p-4 min-h-[450px] flex justify-center items-start touch-none"
        style={{ cursor: currentTool === 'hand' ? 'grab' : currentTool === 'text' ? 'text' : 'crosshair' }}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm font-semibold text-gray-600">Завантаження PDF документа...</p>
          </div>
        )}

        <div className="relative shadow-lg border border-gray-300 rounded-lg overflow-hidden bg-white">
          {/* Canvas шари */}
          <canvas ref={pdfCanvasRef} className="block" />
          <canvas
            ref={drawCanvasRef}
            className="absolute top-0 left-0 block"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>
      </div>

      {/* ── Нижнє меню збереження ─────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <span className="text-xs text-gray-500 hidden sm:inline">
          💾 Зміни зберігаються автоматично на сторінці
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <><span className="animate-spin">⏳</span> Зберігаю PDF роботу...</>
          ) : (
            <>📤 Надіслати виконане завдання</>
          )}
        </button>
      </div>

      <style jsx global>{`
        .pdf-live-textarea {
          background: rgba(255, 255, 255, 0.95) !important;
          border: 1.5px dashed rgba(147, 51, 234, 0.8);
          border-radius: 6px;
          padding: 4px 8px;
          font-family: sans-serif;
          font-weight: bold;
          outline: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          resize: none;
          z-index: 9999;
          min-width: 100px;
        }
      `}</style>
    </div>
  );
}
