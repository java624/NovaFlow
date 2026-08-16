/**
 * Image optimization utilities for NovaFlow Homework Platform.
 * Ensures uploaded homework images are ultra-sharp and clear for students
 * while keeping file sizes extremely small (~150-250KB).
 */

export async function optimizeHomeworkImage(file: File): Promise<Blob | File> {
  // Only optimize image files (pass PDFs and other documents through unchanged)
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        resolve(file);
        return;
      }

      const img = new Image();
      img.onload = () => {
        // High-definition maximum dimension (2048px ensures crystal-clear text & exercise details)
        const MAX_DIMENSION = 2048;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as WebP at 0.88 quality (sharp text, tiny file size)
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              // If original is already smaller or blob fails, return original
              resolve(file);
            }
          },
          'image/webp',
          0.88
        );
      };

      img.onerror = () => resolve(file);
      img.src = src;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
