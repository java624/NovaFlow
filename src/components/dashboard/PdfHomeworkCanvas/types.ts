export type PdfTool = 'brush' | 'highlighter' | 'text' | 'stamp_check' | 'stamp_cross' | 'stamp_circle' | 'stamp_arrow' | 'eraser' | 'hand';

export interface PdfTextAnnotation {
  id: string;
  xRatio: number; // relative 0..1 to page width
  yRatio: number; // relative 0..1 to page height
  text: string;
  color: string;
  fontSize: number; // base font size in px
}

export interface PdfHomeworkCanvasProps {
  pdfUrl: string;
  homeworkId: string;
  onSave?: () => void;
}
