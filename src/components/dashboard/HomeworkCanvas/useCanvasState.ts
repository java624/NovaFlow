'use client';

import { useRef, useEffect, useCallback } from 'react';
import { STORAGE_KEY_PREFIX, CANVAS_MAX_WIDTH } from './types';

interface UseCanvasStateOptions {
  imageUrl: string;
  homeworkId: string;
}

/**
 * Хук відповідає за:
 * - ініціалізацію canvas та завантаження фонового зображення
 * - undo / redo стек
 * - збереження стану в localStorage (після кожної дії, при закритті вкладки)
 * - відновлення стану при відкритті
 */
export function useCanvasState({ imageUrl, homeworkId }: UseCanvasStateOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(new Image());
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

  const storageKey = `${STORAGE_KEY_PREFIX}${homeworkId}`;

  // ─── Зберегти поточний стан canvas в localStorage + undo-стек ───────────────
  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (undoStack.current.length > 20) undoStack.current.shift();
    const dataUrl = canvas.toDataURL();
    undoStack.current.push(dataUrl);
    redoStack.current = [];
    try {
      localStorage.setItem(storageKey, dataUrl);
    } catch {
      // ignore quota errors
    }
  }, [storageKey]);

  // ─── Просто зберегти без зміни undo-стеку (для beforeunload) ────────────────
  const persistCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      localStorage.setItem(storageKey, canvas.toDataURL('image/png'));
    } catch {
      // ignore quota errors
    }
  }, [storageKey]);

  // ─── Відновити canvas з dataUrl ──────────────────────────────────────────────
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

  // ─── Ініціалізація: завантажити зображення + відновити з localStorage ────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = bgImageRef.current;
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width > CANVAS_MAX_WIDTH ? CANVAS_MAX_WIDTH : img.width;
      const scale = canvas.width / img.width;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedImg = new Image();
        savedImg.src = saved;
        savedImg.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(savedImg, 0, 0);
          undoStack.current = [saved];
          redoStack.current = [];
        };
      } else {
        undoStack.current = [];
        redoStack.current = [];
        saveCanvasState();
      }
    };

    return () => { img.onload = null; };
  }, [imageUrl, storageKey, saveCanvasState]);

  // ─── Зберігати при закритті вкладки / переході на іншу сторінку ─────────────
  useEffect(() => {
    const handleBeforeUnload = () => persistCanvasState();
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') persistCanvasState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [persistCanvasState]);

  // ─── Очистити canvas і localStorage ─────────────────────────────────────────
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
    saveCanvasState();
    localStorage.removeItem(storageKey);
  }, [saveCanvasState, storageKey]);

  return {
    canvasRef,
    bgImageRef,
    undoStack,
    redoStack,
    storageKey,
    saveCanvasState,
    persistCanvasState,
    restoreCanvasState,
    clearCanvas,
  };
}
