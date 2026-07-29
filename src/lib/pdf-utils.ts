/**
 * PDF Utilities for NovaFlow Homework Platform
 */

import { PDFDocument, degrees } from 'pdf-lib';

export function isPdfUrl(url?: string | null): boolean {
  if (!url || url === 'null' || url === 'undefined') return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.pdf') ||
    cleanUrl.includes('.pdf') ||
    cleanUrl.includes('application/pdf') ||
    cleanUrl.startsWith('data:application/pdf')
  );
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

/**
 * Generate high-resolution PDF document with all student or teacher annotations embedded onto original PDF pages,
 * correctly handling landscape orientation and rotation (0, 90, 180, 270 deg).
 */
export async function generateAnnotatedPdf(
  originalPdfUrl: string,
  pageDrawings: { [pageNumber: number]: string },
  textAnnotations: { [pageNumber: number]: any[] }
): Promise<Blob> {
  const existingPdfBytes = await fetch(originalPdfUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const pageNum = i + 1;
    const page = pages[i];
    const { width: pWidth, height: pHeight } = page.getSize();
    const rawRotation = page.getRotation().angle;
    const rotation = ((rawRotation % 360) + 360) % 360; // Normalize angle to 0, 90, 180, 270

    const pageDataUrl = pageDrawings[pageNum];
    const pageTexts = textAnnotations[pageNum] || [];

    if (pageDataUrl || (pageTexts && pageTexts.length > 0)) {
      // For 90 or 270 degree rotated pages, visual screen orientation is swapped (width <-> height)
      const is90or270 = rotation === 90 || rotation === 270;
      const visualWidth = is90or270 ? pHeight : pWidth;
      const visualHeight = is90or270 ? pWidth : pHeight;

      const overlayCanvas = document.createElement('canvas');
      const renderScale = 2.0; // 2x high resolution
      overlayCanvas.width = Math.floor(visualWidth * renderScale);
      overlayCanvas.height = Math.floor(visualHeight * renderScale);

      const ctx = overlayCanvas.getContext('2d');
      if (ctx) {
        // Render drawings layer
        if (pageDataUrl) {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const im = new Image();
            im.onload = () => resolve(im);
            im.onerror = reject;
            im.src = pageDataUrl;
          });
          ctx.drawImage(img, 0, 0, overlayCanvas.width, overlayCanvas.height);
        }

        // Render text annotations layer
        pageTexts.forEach((ann) => {
          if (!ann.text || !ann.text.trim()) return;
          const xPx = ann.xRatio * overlayCanvas.width;
          const yPx = ann.yRatio * overlayCanvas.height;
          const fontPx = Math.max(16, ann.fontSize * renderScale);

          ctx.font = `bold ${fontPx}px sans-serif`;
          ctx.fillStyle = ann.color;
          ctx.textBaseline = 'top';

          const lines = ann.text.split('\n');
          lines.forEach((line: string, idx: number) => {
            ctx.fillText(line, xPx, yPx + idx * (fontPx * 1.25));
          });
        });

        const overlayDataUrl = overlayCanvas.toDataURL('image/png');
        const embeddedPng = await pdfDoc.embedPng(overlayDataUrl);

        // Position & rotate embedded overlay image based on page's native orientation & rotation angle
        if (rotation === 0) {
          page.drawImage(embeddedPng, {
            x: 0,
            y: 0,
            width: pWidth,
            height: pHeight,
          });
        } else if (rotation === 90) {
          page.drawImage(embeddedPng, {
            x: pWidth,
            y: 0,
            width: pHeight,
            height: pWidth,
            rotate: degrees(90),
          });
        } else if (rotation === 180) {
          page.drawImage(embeddedPng, {
            x: pWidth,
            y: pHeight,
            width: pWidth,
            height: pHeight,
            rotate: degrees(180),
          });
        } else if (rotation === 270) {
          page.drawImage(embeddedPng, {
            x: 0,
            y: pHeight,
            width: pHeight,
            height: pWidth,
            rotate: degrees(270),
          });
        }
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}
