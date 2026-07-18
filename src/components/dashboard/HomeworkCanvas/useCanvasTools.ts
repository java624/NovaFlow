'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';
import { Tool, Point, calcBaseFontSize } from './types';

interface UseCanvasToolsOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  bgImageRef: RefObject<HTMLImageElement>;
  wrapperRef: RefObject<HTMLDivElement | null>;
  undoStack: RefObject<string[]>;
  redoStack: RefObject<string[]>;
  currentTool: Tool;
  drawColor: string;
  brushSize: number;
  saveCanvasState: () => void;
  restoreCanvasState: (dataUrl: string) => void;
}

/**
 * Хук відповідає за всі інструменти малювання:
 * - brush (пензель)
 * - eraser (стерка)
 * - hand (переміщення полотна)
 * - text (текст — textarea з position:fixed, точно де клікнули)
 * - keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
 */
export function useCanvasTools({
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
}: UseCanvasToolsOptions) {
  const isDrawing = useRef(false);
  const isDragging = useRef(false);
  const lastPos = useRef<Point>({ x: 0, y: 0 });
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const offset = useRef<Point>({ x: 0, y: 0 });
  const activeTextarea = useRef<HTMLTextAreaElement | null>(null);

  // ─── Координати з pointer/touch події ────────────────────────────────────────
  const getEventCoords = useCallback((
    e: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const native = e.nativeEvent as any;
    if (native.touches?.length > 0)
      return { clientX: native.touches[0].clientX, clientY: native.touches[0].clientY };
    if (native.changedTouches?.length > 0)
      return { clientX: native.changedTouches[0].clientX, clientY: native.changedTouches[0].clientY };
    return { clientX: e.clientX, clientY: e.clientY };
  }, []);

  // ─── Viewport координати → логічні координати canvas ─────────────────────────
  const getCanvasPos = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / (rect.width || 1)) * canvas.width,
      y: ((clientY - rect.top) / (rect.height || 1)) * canvas.height,
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
      const x = parseFloat(ta.dataset.canvasX || '0');
      const y = parseFloat(ta.dataset.canvasY || '0');
      const baseFontSize = parseFloat(ta.dataset.baseFontSize || '16');
      const color = ta.dataset.color || ta.style.color;

      // Рендеримо кожен рядок окремо (підтримка Shift+Enter)
      const lines = text.split('\n');
      ctx.font = `bold ${baseFontSize}px 'Inter', sans-serif`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';
      const lineHeightPx = baseFontSize * 1.25;
      lines.forEach((line, i) => {
        ctx.fillText(line, x, y + i * lineHeightPx);
      });
      saveCanvasState();
    }
    ta.remove();
    activeTextarea.current = null;
  }, [canvasRef, saveCanvasState]);

  // ─── Створити текстове поле точно де клікнули ────────────────────────────────
  const spawnTextarea = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvasRect.width > 0 ? canvas.width / canvasRect.width : 1;
    const scaleY = canvasRect.height > 0 ? canvas.height / canvasRect.height : 1;

    // Координати на canvas для рендерингу тексту
    const canvasX = (clientX - canvasRect.left) * scaleX;
    const canvasY = (clientY - canvasRect.top) * scaleY;

    // Розмір шрифту на canvas та відображуваний розмір на екрані
    const baseFontSize = calcBaseFontSize(brushSize);
    const displayFontSize = Math.round(baseFontSize / Math.min(scaleX, scaleY));

    const textarea = document.createElement('textarea');
    textarea.className = 'canvas-live-textarea';

    // position:fixed → textarea з'являється ТОЧНО ТАМ ДЕ КЛІК
    // незалежно від будь-якого батьківського скролу або layout-у
    textarea.style.position = 'fixed';
    textarea.style.left = `${clientX}px`;
    textarea.style.top = `${clientY}px`;
    textarea.style.fontSize = `${displayFontSize}px`;
    textarea.style.color = drawColor;
    textarea.style.lineHeight = '1.25';
    textarea.style.minWidth = `${Math.max(80, displayFontSize * 3)}px`;
    textarea.style.height = `${displayFontSize * 1.5}px`;

    textarea.dataset.canvasX = canvasX.toString();
    textarea.dataset.canvasY = canvasY.toString();
    textarea.dataset.baseFontSize = baseFontSize.toString();
    textarea.dataset.color = drawColor;

    // В body — уникаємо будь-яких батьківських обмежень
    document.body.appendChild(textarea);
    setTimeout(() => textarea.focus(), 10);

    // Авторозширення по ширині та висоті під час введення
    const autoResize = () => {
      textarea.style.width = 'auto';
      textarea.style.width = `${textarea.scrollWidth + 4}px`;
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

    // Клік ЗА МЕЖАМИ textarea — зафіксуємо текст
    // (використовуємо pointerdown замість scroll, щоб не спрацьовувало
    //  при фокусуванні маленького поля — браузер робить мікро-скрол)
    const onOutsidePointerDown = (ev: PointerEvent) => {
      if (!textarea.contains(ev.target as Node)) {
        finalizeLiveText();
        document.removeEventListener('pointerdown', onOutsidePointerDown, true);
      }
    };
    // Невелика затримка щоб поточний pointerdown (на canvas) не зарахувався як "зовнішній"
    setTimeout(() => {
      document.addEventListener('pointerdown', onOutsidePointerDown, true);
    }, 50);

    activeTextarea.current = textarea;
  }, [canvasRef, brushSize, drawColor, finalizeLiveText]);

  // ─── Pointer Down ─────────────────────────────────────────────────────────────
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Якщо відкрите текстове поле — зафіксуємо його і виходимо
    if (activeTextarea.current) {
      finalizeLiveText();
      return;
    }

    const { clientX, clientY } = getEventCoords(e);

    if (currentTool === 'text') {
      e.preventDefault();
      spawnTextarea(clientX, clientY);
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
  }, [canvasRef, currentTool, wrapperRef, getEventCoords, getCanvasPos, finalizeLiveText, spawnTextarea]);

  // ─── Pointer Move ─────────────────────────────────────────────────────────────
  const handleCanvasPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { clientX, clientY } = getEventCoords(e);

    // Hand: переміщення полотна
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
      const bgImg = bgImageRef.current;
      if (bgImg) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
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
  }, [canvasRef, bgImageRef, wrapperRef, currentTool, brushSize, drawColor, getEventCoords, getCanvasPos]);

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

  // ─── Клавіатурні скорочення: Ctrl+Z / Ctrl+Shift+Z ──────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'z') return;
      e.preventDefault();

      if (activeTextarea.current) finalizeLiveText();

      if (e.shiftKey) {
        // Redo
        if (redoStack.current!.length > 0) {
          const state = redoStack.current!.pop()!;
          undoStack.current!.push(state);
          restoreCanvasState(state);
        }
      } else {
        // Undo
        if (undoStack.current!.length > 1) {
          redoStack.current!.push(undoStack.current!.pop()!);
          restoreCanvasState(undoStack.current![undoStack.current!.length - 1]);
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [finalizeLiveText, undoStack, redoStack, restoreCanvasState]);

  return {
    activeTextarea,
    finalizeLiveText,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
  };
}
