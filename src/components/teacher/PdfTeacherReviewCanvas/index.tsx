'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PdfCanvasToolbar } from '@/components/dashboard/PdfHomeworkCanvas/PdfCanvasToolbar';
import { PdfTool } from '@/components/dashboard/PdfHomeworkCanvas/types';
import { renderPdfPageToCanvas } from '@/lib/pdf-utils';

const BASE_RENDER_SCALE = 1.5;

interface PdfTeacherReviewCanvasProps {
  pdfUrl: string;
  homeworkId: string;
  currentTitle?: string;
  currentComment?: string;
  onSave: () => void;
}

export default function PdfTeacherReviewCanvas({
  pdfUrl,
  homeworkId,
  currentTitle,
  currentComment = '',
  onSave,
}: PdfTeacherReviewCanvasProps) {
  const supabase = createClient();

  const containerRef = useRef<HTMLDivElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 1100,
  });

  const [currentTool, setCurrentTool] = useState<PdfTool>('brush');
  const [drawColor, setDrawColor] = useState('#dc2626');
  const [brushSize, setBrushSize] = useState(4);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [teacherFeedback, setTeacherFeedback] = useState(currentComment);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const activeTextarea = useRef<HTMLTextAreaElement | null>(null);

  const pageDrawingsRef = useRef<{ [page: number]: string }>({});
  const pageUndoStacksRef = useRef<{ [page: number]: string[] }>({});
  const pageRedoStacksRef = useRef<{ [page: number]: string[] }>({});
  /** Text annotations for teacher review — simple text drawn directly on canvas, but we abstract into annotations format for generateAnnotatedPdf */
  const textAnnotationsRef = useRef<{ [page: number]: any[] }>({});

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
    }
    pageRedoStacksRef.current[currentPage] = [];
  }, [currentPage]);

  // Load PDF
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
        console.error('Failed to load PDF in teacher review:', err);
        if (isMounted) setLoading(false);
      }
    }

    if (pdfUrl) loadPdf();
    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  // Auto-fit helper
  const handleFitWidth = useCallback(() => {
    if (!containerRef.current || !pageDimensions.width) return;
    const availableWidth = containerRef.current.clientWidth - 48;
    if (availableWidth > 200) {
      const fitZoom = Math.max(0.4, Math.min(2.0, Math.floor((availableWidth / pageDimensions.width) * 100) / 100));
      setZoomScale(fitZoom);
    }
  }, [pageDimensions.width]);

  // Render current page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !pdfCanvasRef.current || !drawCanvasRef.current) return;

    try {
      const pdfCanvas = pdfCanvasRef.current;
      const drawCanvas = drawCanvasRef.current;

      const dimensions = await renderPdfPageToCanvas(
        pdfDoc,
        currentPage,
        pdfCanvas,
        BASE_RENDER_SCALE
      );

      setPageDimensions(dimensions);

      // Auto-fit initial zoom for landscape or wide pages so they fit screen
      if (containerRef.current && dimensions.width > 0) {
        const availableWidth = containerRef.current.clientWidth - 48;
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
      console.error('Error rendering review page:', err);
    }
  }, [pdfDoc, currentPage, saveCurrentPageState]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Drawing coords
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
    }
  };

  const handleClear = () => {
    if (confirm('Скасувати виправлення на цій сторінці?')) {
      const drawCanvas = drawCanvasRef.current;
      const ctx = drawCanvas?.getContext('2d');
      if (drawCanvas && ctx) {
        ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        saveCurrentPageState();
      }
    }
  };

  // Save Teacher Review — generates proper annotated PDF instead of low-quality PNG
  const handleSave = async () => {
    if (activeTextarea.current) finalizeLiveText();
    setIsSaving(true);

    try {
      saveCurrentPageState();

      const { generateAnnotatedPdf } = await import('@/lib/pdf-utils');
      // The pdfUrl here is the STUDENT's submitted PDF. generateAnnotatedPdf will
      // load it, overlay the teacher's annotations on top, and produce a new PDF.
      const pdfBlob = await generateAnnotatedPdf(
        pdfUrl,
        pageDrawingsRef.current,
        textAnnotationsRef.current
      );

      const fileName = `reviews/pdf_review_${homeworkId}_${Date.now()}.pdf`;

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
          status: 'reviewed',
          student_response_url: publicUrl,
          teacher_comment: teacherFeedback,
          updated_at: new Date().toISOString(),
        })
        .eq('id', homeworkId);

      if (dbError) throw dbError;

      alert('✅ Рецензію PDF-завдання успішно збережено та відправлено учню!');
      onSave();
    } catch (err: any) {
      console.error('Save review error:', err);
      alert(`❌ Помилка збереження: ${err?.message || err}`);
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
        isFullscreen ? '!fixed !inset-0 !z-[9999] !rounded-none !flex !flex-col' : ''
      }`}
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
        <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2">
          <span>📋</span> Перевірка та рецензування PDF-роботи учня
          {currentTitle && <span className="text-xs font-normal text-gray-500">— {currentTitle}</span>}
        </h3>
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isFullscreen ? '🔽 Згорнути' : '⛶ Повний екран'}
        </button>
      </div>

      {/* Панель інструментів */}
      <PdfCanvasToolbar
        currentTool={currentTool}
        drawColor={drawColor}
        brushSize={brushSize}
        currentPage={currentPage}
        totalPages={totalPages}
        zoomScale={zoomScale}
        showSidebar={false}
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
        onFitWidth={handleFitWidth}
        onToggleSidebar={() => {}}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
      />

      {/* PDF Canvas */}
      <div
        className="relative flex-1 overflow-auto bg-gray-100 p-4 min-h-[450px] flex justify-center items-start touch-none"
        style={{ cursor: currentTool === 'hand' ? 'grab' : currentTool === 'text' ? 'text' : 'crosshair' }}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm font-semibold text-gray-600">Завантаження PDF документа...</p>
          </div>
        )}

        <div
          style={{
            width: pageDimensions.width * zoomScale,
            height: pageDimensions.height * zoomScale,
          }}
          className="flex items-start justify-center transition-all duration-150"
        >
          <div
            className="relative shadow-lg border border-gray-300 rounded-lg overflow-hidden bg-white origin-top-left transition-transform duration-150"
            style={{
              width: pageDimensions.width,
              height: pageDimensions.height,
              transform: `scale(${zoomScale})`,
            }}
          >
            <canvas ref={pdfCanvasRef} className="block w-full h-full" />
            <canvas
              ref={drawCanvasRef}
              className="absolute top-0 left-0 block w-full h-full"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>
        </div>
      </div>

      {/* Коментар вчителя */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <label className="block text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
          <span>💬</span> Текстовий коментар / Зауваження для учня:
        </label>
        <textarea
          value={teacherFeedback}
          onChange={(e) => setTeacherFeedback(e.target.value)}
          placeholder="Напишіть коментар до роботи..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-y"
        />
      </div>

      {/* Нижнє меню */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <><span className="animate-spin">⏳</span> Зберігаю рецензію...</>
          ) : (
            <>✅ Надіслати перевірене PDF завдання з коментарями</>
          )}
        </button>
      </div>
    </div>
  );
}