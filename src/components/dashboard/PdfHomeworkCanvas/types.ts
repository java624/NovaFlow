export type PdfTool = 'brush' | 'highlighter' | 'text' | 'eraser' | 'hand';

export interface PdfHomeworkCanvasProps {
  pdfUrl: string;
  homeworkId: string;
  onSave?: () => void;
}

export interface PageAnnotationState {
  undoStack: string[];
  redoStack: string[];
}
