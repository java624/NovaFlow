'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { PdfTool, PdfHomeworkCanvasProps, PdfTextAnnotation } from './types';
import { PdfCanvasToolbar } from './PdfCanvasToolbar';
import { renderPdfPageToCanvas } from '@/lib/pdf-utils';

const BASE_RENDER_SCALE = 1.5; // Fixed high-res base render scale

export default function PdfHomeworkCanvas({ pdfUrl, homeworkId, onSave }: PdfHomeworkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const activeInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.0); // CSS zoom factor
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  const [currentTool, setCurrentTool] = useState<PdfTool>('brush');
  const [drawColor, setDrawColor] = useState('#dc2626');
  const [brushSize, setBrushSize] = useState(4);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Unscaled page base dimensions in CSS pixels
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 1100,
  });

  // Interactive Text Annotations per page
  const [textAnnotations, setTextAnnotations] = useState<{ [page: number]: PdfTextAnnotation[] }>({});
  const [activeTextId, setActiveTextId] = useState<string | null>(null);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Page drawings data URLs (png)
  const pageDrawingsRef = useRef<{ [page: number]: string }>({});
  const pageUndoStacksRef = useRef<{ [page: number]: string[] }>({});
  const pageRedoStacksRef = useRef<{ [page: number]: string[] }>({});

  const storageKey = `pdf_hw_draft_v5_${homeworkId}`;

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

  // ─── Auto-Fit Width Helper ──────────────────────────────────────────────────
  const handleFitWidth = useCallback(() => {
    if (!containerRef.current || !pageDimensions.width) return;
    const availableWidth = containerRef.current.clientWidth - (showSidebar ? 180 : 48);
    if (availableWidth > 200) {
      const fitZoom = Math.max(0.4, Math.min(2.0, Math.floor((availableWidth / pageDimensions.width) * 100) / 100));
      setZoomScale(fitZoom);
    }
  }, [pageDimensions.width, showSidebar]);

  // ─── 3. Render Current Page at Fixed Base Resolution ───────────────────────
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !pdfCanvasRef.current || !drawCanvasRef.current) return;

    try {
      const pdfCanvas = pdfCanvasRef.current;
      const drawCanvas = drawCanvasRef.current;

      // Render at constant BASE_RENDER_SCALE for 100% crispness & zero shift!
      const dimensions = await renderPdfPageToCanvas(
        pdfDoc,
        currentPage,
        pdfCanvas,
        BASE_RENDER_SCALE
      );

      setPageDimensions(dimensions);

      // Auto-fit initial zoom for landscape or large pages so they fit screen
      if (containerRef.current && dimensions.width > 0) {
        const availableWidth = containerRef.current.clientWidth - (showSidebar ? 180 : 48);
        if (availableWidth > 200 && dimensions.width > availableWidth) {
          const fitZoom = Math.max(0.4, Math.min(1.0, Math.floor((availableWidth / dimensions.width) * 100) / 100));
          setZoomScale((prev) => (prev === 1.0 ? fitZoom : prev));
        }
      }

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
  }, [pdfDoc, currentPage, showSidebar, saveCurrentPageState]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // ─── Instant Keyboard Focus on Single Click ────────────────────────────────
  useEffect(() => {
    if (activeTextId && activeInputRef.current) {
      const el = activeInputRef.current;
      el.focus();
      // Position cursor at end of text
      try {
        el.setSelectionRange(el.value.length, el.value.length);
      } catch (e) {}
    }
  }, [activeTextId]);

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
      ctx.font = `bold ${brushSize * 8 + 20}px sans-serif`;
      ctx.fillText('✔', x - 10, y + 10);
    } else if (type === 'stamp_cross') {
      ctx.font = `bold ${brushSize * 8 + 20}px sans-serif`;
      ctx.fillText('✖', x - 10, y + 10);
    } else if (type === 'stamp_circle') {
      const radiusX = brushSize * 6 + 18;
      const radiusY = brushSize * 4 + 12;
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

  // ─── Canvas Pointer Handling (Drawing & Stamps) ───────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (currentTool === 'hand' || currentTool === 'text') return;
    const coords = getCanvasCoords(e);

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

  // ─── Page Container Click (Exact Click Position & Immediate Text Creation) ─
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentTool !== 'text' || !pageContainerRef.current) {
      setActiveTextId(null);
      return;
    }

    const rect = pageContainerRef.current.getBoundingClientRect();
    // Account for CSS transform scaling:
    const clickX = (e.clientX - rect.left) / zoomScale;
    const clickY = (e.clientY - rect.top) / zoomScale;

    // Offset clickY by 10px so text baseline aligns EXACTLY where clicked!
    const xRatio = Math.max(0.01, Math.min(0.92, clickX / pageDimensions.width));
    const yRatio = Math.max(0.01, Math.min(0.92, (clickY - 10) / pageDimensions.height));

    const newAnn: PdfTextAnnotation = {
      id: `txt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      xRatio,
      yRatio,
      text: '',
      color: drawColor,
      fontSize: Math.max(16, brushSize * 4),
    };

    setTextAnnotations((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newAnn],
    }));
    setActiveTextId(newAnn.id);
  };

  // ─── Text Helpers ──────────────────────────────────────────────────────────
  const updateTextAnnotation = (id: string, text: string) => {
    setTextAnnotations((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map((ann) =>
        ann.id === id ? { ...ann, text } : ann
      ),
    }));
  };

  const updateTextFontSize = (id: string, delta: number) => {
    setTextAnnotations((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map((ann) =>
        ann.id === id ? { ...ann, fontSize: Math.max(12, Math.min(60, ann.fontSize + delta)) } : ann
      ),
    }));
  };

  const updateTextColor = (id: string, color: string) => {
    setTextAnnotations((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map((ann) =>
        ann.id === id ? { ...ann, color } : ann
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

  // ─── 6. Save & Submit Response as true PDF File ─────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);

    try {
      saveCurrentPageState();

      const { generateAnnotatedPdf } = await import('@/lib/pdf-utils');
      const pdfBlob = await generateAnnotatedPdf(
        pdfUrl,
        pageDrawingsRef.current,
        textAnnotations
      );

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const fileName = `results/pdf_hw_${homeworkId}_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('homework-attachments')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf', upsert: true });

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
        toast.success('🎉 Виконане PDF-завдання успішно збережено та надіслано вчителю!');
      onSave?.();
    } catch (err: any) {
      console.error('PDF save error:', err);
        toast.error(`❌ Помилка збереження: ${err?.message || err}`);
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
        onToolChange={(tool) => {
          setActiveTextId(null);
          setCurrentTool(tool);
        }}
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
        onFitWidth={handleFitWidth}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
      />

      {/* ── Підказка для тексту ─────────────────────────────────────────────── */}
      {currentTool === 'text' && (
        <div className="px-4 py-2 bg-purple-50 border-b border-purple-100 text-xs font-semibold text-purple-700 flex items-center gap-2">
          <span>💬</span> Клацніть у будь-якому місці PDF-сторінки, щоб миттєво ввести відповідь.
        </div>
      )}

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

        {/* Outer Scroll Container */}
        <div
          className="relative flex-1 overflow-auto p-6 flex justify-center items-start"
          onClick={() => setActiveTextId(null)}
          style={{ cursor: currentTool === 'hand' ? 'grab' : currentTool === 'text' ? 'text' : 'crosshair' }}
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm font-semibold text-gray-600">Завантаження PDF документа...</p>
            </div>
          )}

          {/* Sizing Container to preserve scroll bounds when CSS zoomed */}
          <div
            style={{
              width: pageDimensions.width * zoomScale,
              height: pageDimensions.height * zoomScale,
            }}
            className="flex items-start justify-center transition-all duration-150"
          >
            {/* Wrapper container for PDF page & annotation layers scaled seamlessly via CSS transform */}
            <div
              ref={pageContainerRef}
              onClick={handlePageClick}
              className="relative shadow-2xl border border-gray-300 rounded-lg bg-white select-none origin-top-left transition-transform duration-150"
              style={{
                width: pageDimensions.width,
                height: pageDimensions.height,
                transform: `scale(${zoomScale})`,
              }}
            >
              {/* Background PDF Canvas */}
              <canvas ref={pdfCanvasRef} className="block w-full h-full" />

              {/* Drawing Layer Canvas */}
              <canvas
                ref={drawCanvasRef}
                className={`absolute top-0 left-0 block w-full h-full ${
                  currentTool === 'text' ? 'pointer-events-none' : 'pointer-events-auto'
                }`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />

              {/* Interactive Text Box Annotations Overlay */}
              <div className="absolute inset-0 pointer-events-none z-30">
                {pageTexts.map((ann) => {
                  const isActive = activeTextId === ann.id;
                  const leftPercent = ann.xRatio * 100;
                  const topPercent = ann.yRatio * 100;

                  return (
                    <div
                      key={ann.id}
                      className="absolute pointer-events-auto -translate-y-1"
                      style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTextId(ann.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {isActive ? (
                        <div className="relative flex flex-col bg-white border-2 border-purple-600 rounded-xl p-2 shadow-2xl ring-4 ring-purple-500/20 min-w-[200px] z-50">
                          {/* Control toolbar for active text box */}
                          <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-gray-100 text-xs select-none">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTextFontSize(ann.id, -2);
                                }}
                                className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center text-gray-700"
                                title="Зменшити шрифт"
                              >
                                -
                              </button>
                              <span className="text-[10px] font-semibold text-gray-500">
                                {ann.fontSize}px
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTextFontSize(ann.id, 2);
                                }}
                                className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center text-gray-700"
                                title="Збільшити шрифт"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              {['#dc2626', '#2563eb', '#16a34a', '#000000'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTextColor(ann.id, c);
                                  }}
                                  className={`w-3.5 h-3.5 rounded-full border ${
                                    ann.color === c ? 'scale-125 ring-1 ring-purple-500' : ''
                                  }`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTextAnnotation(ann.id);
                              }}
                              className="w-5 h-5 bg-red-50 text-red-600 rounded-full font-bold flex items-center justify-center hover:bg-red-100"
                              title="Видалити"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Textarea with active input ref for instant keyboard focus */}
                          <textarea
                            ref={activeInputRef}
                            value={ann.text}
                            placeholder="Введіть відповідь..."
                            onChange={(e) => updateTextAnnotation(ann.id, e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="w-full bg-transparent font-bold outline-none resize-y text-gray-900 leading-snug"
                            style={{
                              color: ann.color,
                              fontSize: `${ann.fontSize}px`,
                            }}
                            rows={Math.max(1, ann.text.split('\n').length)}
                          />

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!ann.text.trim()) {
                                deleteTextAnnotation(ann.id);
                              } else {
                                setActiveTextId(null);
                              }
                            }}
                            className="mt-1 w-full py-1 text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
                          >
                            ✓ Готово
                          </button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer group flex items-start"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTextId(ann.id);
                          }}
                        >
                          <p
                            className="font-bold whitespace-pre-wrap leading-snug px-1 py-0.5 rounded border border-transparent group-hover:border-purple-300/50 group-hover:bg-purple-50/20"
                            style={{
                              color: ann.color,
                              fontSize: `${ann.fontSize}px`,
                            }}
                          >
                            {ann.text || <span className="italic text-gray-400 text-xs">(порожньо)</span>}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
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
