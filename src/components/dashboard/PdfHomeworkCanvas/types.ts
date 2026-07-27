export type PdfTool = 'brush' | 'highlighter' | 'text' | 'stamp_check' | 'stamp_cross' | 'stamp_circle' | 'stamp_arrow' | 'eraser' | 'hand';

export interface PdfTextAnnotation {
  id: string;
  x: number; // percentage or scale-independent relative coord
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export interface PdfHomeworkCanvasProps {
  pdfUrl: string;
  homeworkId: string;
  onSave?: () => void;
}
