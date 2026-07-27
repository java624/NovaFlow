'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { PdfTool, PdfHomeworkCanvasProps, PdfTextAnnotation } from './types';
import { PdfCanvasToolbar } from './PdfCanvasToolbar';
import { renderPdfPageToCanvas, renderPdfThumbnail } from '@/lib/pdf-utils';

export default function PdfHomeworkCanvas({ pdfUrl, homeworkId, onSave }: PdfHomeworkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.25);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  const [currentTool, setCurrentTool] = useState<PdfTool>('brush');
  const [drawColor, setDrawColor] = useState('#dc2626');
  const [brushSize, setBrushSize] = useState(4);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Interactive Text Annotations per page
  const [textAnnotations, setTextAnnotations] = useState<{ [page: number]: PdfTextAnnotation[] }>({});
  const [activeTextId, setActiveTextId] = useState<string | null>(null);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Page drawings data URLs (png)
  const pageDrawingsRef = useRef<{ [page: number]: string }>({});
  const pageUndoStacksRef = useRef<{ [page: number]: string[] }>({});
  const pageRedoStacksRef = useRef<{ [page: number]: string[] }>({});

  const storageKey = `pdf_hw_draft_v2_${homeworkId}`;

  // ─── 1. Load Draft ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed?.drawings) pageDrawingsRef.current = parsed.drawings;
        if (parsed?.texts) setTextAnnotations(parsed.texts);
      }
    } catch (e) {
      console.warn('Could not load draft:', e);
    }
  }, [storageKey]);

  // Save current page state
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
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          drawings: pageDrawingsRef.current,
          texts: textAnnotations,
        })
      );
    } catch (e) {}
  }, [currentPage, storageKey, textAnnotations]);

  // ─── 2. Load PDF Document ──────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadPdf() {
      try {
        const { loadPdfDocument } = await import('@/lib/pdf-utils');
        const doc = await loadPdfDocument(pdfUrl);
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

      const outputScale = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
      drawCanvas.width = Math.floor(dimensions.width * outputScale);
      drawCanvas.height = Math.floor(dimensions.height * outputScale);
      drawCanvas.style.width = dimensions.width + 'px';
      drawCanvas.style.height = dimensions.height + 'px';

      const ctx = drawCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        const savedPageData = pageDrawingsRef.current[currentPage];
        if (savedPageData) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0);
          img.src = savedPageData;
        } else {
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

  // ─── Coords Calculation ───────────────────────────────────────────────────
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

  // ─── Stamps Rendering Helper ──────────────────────────────────────────────
  const drawStamp = (type: string, x: number, y: number) => {
    const drawCanvas = drawCanvasRef.current;
    const ctx = drawCanvas?.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = drawColor;
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = Math.max(3, brushSize);

    if (type === 'stamp_check') {
      ctx.font = `bold ${brushSize * 8 + 16}px sans-serif`;
      ctx.fillText('✔', x - 10, y + 10);
    } else if (type === 'stamp_cross') {
      ctx.font = `bold ${brushSize * 8 + 16}px sans-serif`;
      ctx.fillText('✖', x - 10, y + 10);
    } else if (type === 'stamp_circle') {
      const radiusX = brushSize * 6 + 15;
      const radiusY = brushSize * 4 + 10;
      ctx.beginPath();
      ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (type === 'stamp_arrow') {
      const len = brushSize * 6 + 30;
      ctx.beginPath();
      ctx.moveTo(x - len, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x - 10, y - 8);
      ctx.moveTo(x, y);
      ctx.lineTo(x - 10, y + 8);
      ctx.stroke();
    }
    ctx.restore();
    saveCurrentPageState();
  };

  // ─── Pointer Handling ─────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (currentTool === 'hand') return;
    const coords = getCanvasCoords(e);

    // Text Tool
    if (currentTool === 'text') {
      const newAnn: PdfTextAnnotation = {
        id: `txt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        x: coords.x,
        y: coords.y,
        text: '',
        color: drawColor,
        fontSize: Math.max(16, brushSize * 4),
      };
      setTextAnnotations((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newAnn],
      }));
      setActiveTextId(newAnn.id);
      return;
    }

    // Stamps
    if (currentTool.startsWith('stamp_')) {
      drawStamp(currentTool, coords.x, coords.y);
      return;
    }

    // Drawing / Highlighter / Eraser
    isDrawingRef.current = true;
    lastPointRef.current = coords;

    const ctx = drawCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || currentTool === 'hand' || currentTool === 'text' || currentTool.startsWith('stamp_')) return;
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
      ctx.strokeStyle = drawColor.length === 7 ? `${drawColor}55` : drawColor;
      ctx.lineWidth = brushSize * 6;
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 8;
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

  // ─── Text Annotation Editing Helpers ─────────────────────────────────────
  const updateTextAnnotation = (id: string, text: string) => {
    setTextAnnotations((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map((ann) =>
        ann.id === id ? { ...ann, text } : ann
      ),
    }));
  };

  const deleteTextAnnotation = (id: string) => {
    setTextAnnotations((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter((ann) => ann.id !== id),
    }));
    setActiveTextId(null);
  };

  // ─── Undo / Redo / Clear Page ───────────────────────────────────────────────
  const handleUndo = () => {
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
    }
  };

  const handleRedo = () => {
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
      setTextAnnotations((prev) => ({ ...prev, [currentPage]: [] }));
    }
  };

  // ─── 6. Save & Submit Response ─────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);

    try {
      saveCurrentPageState();
      const pdfCanvas = pdfCanvasRef.current;
      const drawCanvas = drawCanvasRef.current;
      if (!pdfCanvas || !drawCanvas) throw new Error('Canvas error');

      // Burn text annotations onto draw canvas before export
      const drawCtx = drawCanvas.getContext('2d');
      if (drawCtx) {
        const pageTexts = textAnnotations[currentPage] || [];
        pageTexts.forEach((ann) => {
          drawCtx.font = `bold ${ann.fontSize}px sans-serif`;
          drawCtx.fillStyle = ann.color;
          drawCtx.textBaseline = 'top';
          const lines = ann.text.split('\n');
          lines.forEach((l, idx) => {
            drawCtx.fillText(l, ann.x, ann.y + idx * (ann.fontSize * 1.2));
          });
        });
      }

      // Create composite canvas of current view
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = pdfCanvas.width;
      tempCanvas.height = pdfCanvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) throw new Error('Context error');

      tCtx.fillStyle = '#ffffff';
      tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tCtx.drawImage(pdfCanvas, 0, 0);
      tCtx.drawImage(drawCanvas, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        tempCanvas.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('Failed to render output image');

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
      alert(`❌ Помилка збереження: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const undoStack = pageUndoStacksRef.current[currentPage] || [];
  const redoStack = pageRedoStacksRef.current[currentPage] || [];
  const pageTexts = textAnnotations[currentPage] || [];

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
          <span>📄</span> Професійний PDF-редактор завдань
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
        showSidebar={showSidebar}
        canUndo={undoStack.length > 1}
        canRedo={redoStack.length > 0}
        onToolChange={(tool) => setCurrentTool(tool)}
        onColorChange={setDrawColor}
        onSizeChange={setBrushSize}
        onPageChange={(page) => {
          saveCurrentPageState();
          setCurrentPage(page);
        }}
        onZoomChange={(zoom) => {
          saveCurrentPageState();
          setZoomScale(zoom);
        }}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
      />

      {/* ── Основна робоча область (Сайдбар + Canvas) ────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative bg-gray-100 min-h-[500px]">
        {/* Сайдбар мініатюр сторінок */}
        {showSidebar && pdfDoc && (
          <div className="w-36 bg-gray-50 border-r border-gray-200 p-2 overflow-y-auto flex flex-col gap-3 select-none">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center mb-1">
              Сторінки
            </p>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => {
                  saveCurrentPageState();
                  setCurrentPage(pageNum);
                }}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 hover:shadow-sm ${
                  currentPage === pageNum
                    ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500/20'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-xs font-bold text-gray-700">Стор. {pageNum}</span>
              </button>
            ))}
          </div>
        )}

        {/* Canvas Полотно PDF */}
        <div
          onClick={() => setActiveTextId(null)}
          className="relative flex-1 overflow-auto p-6 flex justify-center items-start touch-none"
          style={{ cursor: currentTool === 'hand' ? 'grab' : currentTool === 'text' ? 'text' : 'crosshair' }}
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm font-semibold text-gray-600">Завантаження PDF документа...</p>
            </div>
          )}

          <div className="relative shadow-xl border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Background PDF Canvas */}
            <canvas ref={pdfCanvasRef} className="block" />

            {/* Drawing Layer Canvas */}
            <canvas
              ref={drawCanvasRef}
              className="absolute top-0 left-0 block"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />

            {/* Interactive Text Box Annotations Layer */}
            {pageTexts.map((ann) => {
              const drawCanvas = drawCanvasRef.current;
              const scaleRatio = drawCanvas ? drawCanvas.offsetWidth / drawCanvas.width : 1;
              const leftPx = ann.x * scaleRatio;
              const topPx = ann.y * scaleRatio;
              const isActive = activeTextId === ann.id;

              return (
                <div
                  key={ann.id}
                  className="absolute z-30 group"
                  style={{ left: `${leftPx}px`, top: `${topPx}px` }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative flex items-center">
                    <textarea
                      autoFocus={isActive}
                      value={ann.text}
                      placeholder={isActive ? 'Введіть відповідь...' : ''}
                      onChange={(e) => updateTextAnnotation(ann.id, e.target.value)}
                      onFocus={() => setActiveTextId(ann.id)}
                      onBlur={() => {
                        if (!ann.text.trim()) {
                          deleteTextAnnotation(ann.id);
                        } else {
                          setActiveTextId(null);
                        }
                      }}
                      className={`font-bold transition-all outline-none resize-y ${
                        isActive
                          ? 'bg-white/95 border-2 border-dashed border-purple-600 rounded-lg px-2 py-1 shadow-xl ring-4 ring-purple-500/20 min-w-[140px]'
                          : 'bg-transparent border border-transparent rounded px-1 py-0.5 cursor-pointer hover:border-purple-300/40 min-w-[40px]'
                      }`}
                      style={{
                        color: ann.color,
                        fontSize: `${ann.fontSize * scaleRatio}px`,
                        lineHeight: 1.25,
                      }}
                      rows={Math.max(1, ann.text.split('\n').length)}
                    />
                    {isActive && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          deleteTextAnnotation(ann.id);
                        }}
                        className="ml-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                        title="Видалити цей текст"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Нижнє меню збереження ─────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <span className="text-xs text-gray-500 hidden sm:inline">
          💾 Чернетка зберігається автоматично у вашому браузері
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
    </div>
  );
}
