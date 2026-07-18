// ─── Типи та константи для TeacherReviewCanvas ───────────────────────────────

export type Tool = 'brush' | 'text' | 'eraser' | 'hand';

export interface Point {
  x: number;
  y: number;
}

export interface TeacherReviewCanvasProps {
  imageUrl: string;
  homeworkId: string;
  currentTitle?: string;
  currentComment?: string;
  onSave: () => void;
}

/** Префікс ключа в localStorage для збереження стану canvas вчителя */
export const STORAGE_KEY_PREFIX = 'novaflow_teacher_canvas_';

/** Максимальна ширина canvas (px) */
export const CANVAS_MAX_WIDTH = 850;

/** Розмір шрифту на canvas: brushSize 1..20 → fontSize 10..80px */
export function calcBaseFontSize(brushSize: number): number {
  return 10 + (brushSize - 1) * (70 / 19);
}
