'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';
import { Tool, Point, calcBaseFontSize } from './types';

interface UseReviewCanvasToolsOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  bgImageRef: RefObject<HTMLImageElement>;
  wrapperRef: RefObject<HTMLDivElement | null>;
  undoStack: RefObject<string[]>;
  currentTool: Tool;
  drawColor: string;
  brushSize: number;
  saveCanvasState: () => void;
  restoreCanvasState: (dataUrl: string) => void;
}

/**
 * Хук відповідає за всі інструменти малювання вчителя:
 * - brush (червона ручка / будь-який колір)
 * - eraser (гумка)
 * - hand (переміщення полотна)
 * - text (текст — textarea з position:fixed, точно де клікнули)
 * - keyboard shortcuts: Ctrl+Z, Escape (повний екран)
 */
export function useReviewCanvasTools({
  canvasRef,
  bgImageRef,
  wrapperRef,
  undoStack,
  currentTool,
  drawColor,
  brushSize,
  saveCanvasState,
  restoreCanvasState,
}: UseReviewCanvasToolsOptions) {
  const isDrawing  = useRef(false);
  const isDragging = useRef(false);
  const lastPos    = useRef<Point>({ x: 0, y: 0 });
  const dragStart  = useRef<Point>({ x: 0, y: 0 });
  const offset     = useRef<Point>({ x: 0, y: 0 });
  const activeTextarea = useRef<HTMLTextAreaElement | null>(null);

  // ─── Viewport координати → логічні координати canvas ─────────────────────────
  const getCanvasPos = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / (rect.width  || 1)) * canvas.width,
      y: ((clientY - rect.top)  / (rect.height || 1)) * canvas.height,
    };
  }, [canvasRef]);

  // ─── Зафіксувати текст з textarea на canvas ──────────────────────────────────
  const finalizeLiveText = useCallback(() => {
    const ta = activeTextarea.current;
    if (!ta) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const text = ta.value.trim();
    if (text) {
      const x          = parseFloat(ta.dataset.canvasX    || '0');
      const y          = parseFloat(ta.dataset.canvasY    || '0');
      const fontSize   = parseFloat(ta.dataset.canvasFontSize || '16');
      const color      = ta.dataset.canvasColor || drawColor;

      // Підтримка переносів рядків (Shift+Enter)
      const lines = text.split('\n');
      ctx.font          = `bold ${fontSize}px 'Inter', sans-serif`;
      ctx.fillStyle     = color;
      ctx.textBaseline  = 'top';
      const lineH       = fontSize * 1.25;
      lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineH));

      saveCanvasState();
    }
    ta.remove();
    activeTextarea.current = null;
  }, [canvasRef, drawColor, saveCanvasState]);

  // ─── Створити textarea точно де клікнув вчитель ───────────────────────────────
  const spawnTextarea = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvasRect.width  > 0 ? canvas.width  / canvasRect.width  : 1;
    const scaleY = canvasRect.height > 0 ? canvas.height / canvasRect.height : 1;

    // Координати на canvas для рендерингу тексту
    const canvasX = (clientX - canvasRect.left) * scaleX;
    const canvasY = (clientY - canvasRect.top)  * scaleY;

    // brushSize 1..20 → canvas fontSize 10..80px
    const baseFontSize    = calcBaseFontSize(brushSize);
    const displayFontSize = Math.round(baseFontSize / Math.min(scaleX, scaleY));

    const textarea = document.createElement('textarea');
    textarea.className = 't-canvas-live-textarea';

    // ── КЛЮЧОВЕ: position:fixed + clientX/clientY ─────────────────────────────
    // Гарантує появу ТОЧНО ТАМ ДЕ КЛІК — незалежно від будь-якого
    // батьківського скролу, overflow або layout-у сайдбару.
    textarea.style.position  = 'fixed';
    textarea.style.left      = `${clientX}px`;
    textarea.style.top       = `${clientY}px`;
    textarea.style.fontSize  = `${displayFontSize}px`;
    textarea.style.color     = drawColor;
    textarea.style.lineHeight = '1.25';
    textarea.style.minWidth  = `${Math.max(80, displayFontSize * 3)}px`;
    textarea.style.height    = `${displayFontSize * 1.5}px`;

    textarea.dataset.canvasX        = canvasX.toString();
    textarea.dataset.canvasY        = canvasY.toString();
    textarea.dataset.canvasFontSize = baseFontSize.toString();
    textarea.dataset.canvasColor    = drawColor;

    // В body — уникаємо обмежень будь-якого батьківського контейнера
    document.body.appendChild(textarea);
    setTimeout(() => textarea.focus(), 10);

    // Авторозширення по ширині та висоті
    const autoResize = () => {
      textarea.style.width  = 'auto';
      textarea.style.width  = `${textarea.scrollWidth + 4}px`;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };
    textarea.addEventListener('input', autoResize);

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

    // Клік ЗА МЕЖАМИ → зафіксуємо текст
    // (pointerdown замість blur/scroll — уникаємо зникання при фокусі малого поля)
    const onOutsidePointerDown = (ev: PointerEvent) => {
      if (!textarea.contains(ev.target as Node)) {
        finalizeLiveText();
        document.removeEventListener('pointerdown', onOutsidePointerDown, true);
      }
    };
    setTimeout(() => {
      document.addEventListener('pointerdown', onOutsidePointerDown, true);
    }, 50);

    activeTextarea.current = textarea;
  }, [canvasRef, brushSize, drawColor, finalizeLiveText]);

  // ─── Pointer Down ─────────────────────────────────────────────────────────────
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (activeTextarea.current) {
      finalizeLiveText();
      return;
    }

    if (currentTool === 'text') {
      e.preventDefault();
      spawnTextarea(e.clientX, e.clientY);
      return;
    }

    if (currentTool === 'hand') {
      isDragging.current = true;
      dragStart.current  = { x: e.clientX - offset.current.x, y: e.clientY - offset.current.y };
      const wrapper = wrapperRef.current;
      if (wrapper) wrapper.style.cursor = 'grabbing';
      return;
    }

    const pos = getCanvasPos(e.clientX, e.clientY);
    isDrawing.current  = true;
    lastPos.current    = pos;
  }, [canvasRef, currentTool, wrapperRef, getCanvasPos, finalizeLiveText, spawnTextarea]);

  // ─── Pointer Move ─────────────────────────────────────────────────────────────
  const handleCanvasPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
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

    if (currentTool === 'eraser') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize * 1.5, 0, Math.PI * 2);
      ctx.clip();
      const bgImg = bgImageRef.current;
      if (bgImg && bgImg.src) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      else { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.restore();
    } else {
      ctx.strokeStyle = drawColor;
      ctx.lineWidth   = brushSize;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    lastPos.current = pos;
  }, [canvasRef, bgImageRef, wrapperRef, currentTool, brushSize, drawColor, getCanvasPos]);

  // ─── Pointer Up ──────────────────────────────────────────────────────────────
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
  }, [currentTool, wrapperRef, saveCanvasState]);

  // ─── Клавіатурні скорочення: Ctrl+Z ──────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (activeTextarea.current) finalizeLiveText();
        if (undoStack.current!.length > 1) {
          undoStack.current!.pop();
          restoreCanvasState(undoStack.current![undoStack.current!.length - 1]);
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [finalizeLiveText, undoStack, restoreCanvasState]);

  return {
    activeTextarea,
    finalizeLiveText,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
  };
}
