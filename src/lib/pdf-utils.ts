/**
 * PDF Utilities for NovaFlow Homework Platform
 */

export function isPdfUrl(url?: string | null): boolean {
  if (!url || url === 'null' || url === 'undefined') return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.pdf') || cleanUrl.includes('.pdf');
}

/**
 * Configure pdf.js worker dynamically in client environment
 */
export async function getPdfJs() {
  const pdfjsLib = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    const version = pdfjsLib.version || '3.11.174';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
  }
  return pdfjsLib;
}

/**
 * Load PDF document from URL
 */
export async function loadPdfDocument(url: string) {
  const pdfjsLib = await getPdfJs();
  const loadingTask = pdfjsLib.getDocument({
    url,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

/**
 * Render specific PDF page to an HTML Canvas
 */
export async function renderPdfPageToCanvas(
  pdfDoc: any,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale = 1.5
) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const ctx = canvas.getContext('2d');
  if (!ctx) return { width: 0, height: 0 };

  const outputScale = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = Math.floor(viewport.width) + 'px';
  canvas.style.height = Math.floor(viewport.height) + 'px';

  const transform = outputScale !== 1
    ? [outputScale, 0, 0, outputScale, 0, 0]
    : null;

  const renderContext = {
    canvasContext: ctx,
    transform,
    viewport,
  };

  await page.render(renderContext).promise;

  return {
    width: Math.floor(viewport.width),
    height: Math.floor(viewport.height),
  };
}

/**
 * Render thumbnail for a PDF page
 */
export async function renderPdfThumbnail(
  pdfDoc: any,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  thumbWidth = 120
) {
  const page = await pdfDoc.getPage(pageNumber);
  const unscaledViewport = page.getViewport({ scale: 1.0 });
  const scale = thumbWidth / unscaledViewport.width;
  const viewport = page.getViewport({ scale });

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;
}
