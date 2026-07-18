// ─── Типи та константи для HomeworkCanvas ────────────────────────────────────

export type Tool = 'brush' | 'text' | 'eraser' | 'hand';

export interface Point {
  x: number;
  y: number;
}

export interface HomeworkCanvasProps {
  imageUrl: string;
  homeworkId: string;
  onSave?: () => void;
}

/** Префікс ключа в localStorage для збереження стану canvas */
export const STORAGE_KEY_PREFIX = 'novaflow_canvas_';

/** Максимальна ширина canvas (px) */
export const CANVAS_MAX_WIDTH = 850;

/** Розмір шрифту на canvas: brushSize 1..20 → fontSize 10..80px */
export function calcBaseFontSize(brushSize: number): number {
  return 10 + (brushSize - 1) * (70 / 19);
}
