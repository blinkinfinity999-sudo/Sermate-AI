/**
 * Fast Client-Side Image Compression & Downsampling
 * Shrinks 4K / heavy screenshots to an optimal 1024px bounding box in WebP/JPEG format.
 * Reduces payload size by up to 90% for instant network transfer and lightning-fast AI vision processing.
 */

export interface OptimizedImageResult {
  optimizedBase64: string;
  mimeType: string;
  originalSizeKb: number;
  optimizedSizeKb: number;
  width: number;
  height: number;
  compressionRatio: number;
}

export async function optimizeImageForVision(
  dataUrlOrBase64: string,
  maxDimension = 1024,
  quality = 0.85
): Promise<OptimizedImageResult> {
  return new Promise((resolve) => {
    // If empty or already tiny SVG string
    if (!dataUrlOrBase64 || dataUrlOrBase64.startsWith('data:image/svg+xml')) {
      const sizeKb = Math.round((dataUrlOrBase64?.length || 0) * 0.75 / 1024);
      resolve({
        optimizedBase64: dataUrlOrBase64,
        mimeType: 'image/png',
        originalSizeKb: sizeKb,
        optimizedSizeKb: sizeKb,
        width: 1024,
        height: 768,
        compressionRatio: 1,
      });
      return;
    }

    const src = dataUrlOrBase64.startsWith('data:')
      ? dataUrlOrBase64
      : `data:image/png;base64,${dataUrlOrBase64}`;

    const originalSizeKb = Math.round(src.length * 0.75 / 1024);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Calculate downscaled dimensions maintaining aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        resolve({
          optimizedBase64: src,
          mimeType: 'image/jpeg',
          originalSizeKb,
          optimizedSizeKb: originalSizeKb,
          width: img.width,
          height: img.height,
          compressionRatio: 1,
        });
        return;
      }

      // Draw high-quality scaled image
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP or JPEG for optimal compression & Vision API compatibility
      let mimeType = 'image/jpeg';
      let optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);

      // If WebP is supported and smaller
      try {
        const webpUrl = canvas.toDataURL('image/webp', quality);
        if (webpUrl.startsWith('data:image/webp') && webpUrl.length < optimizedDataUrl.length) {
          optimizedDataUrl = webpUrl;
          mimeType = 'image/webp';
        }
      } catch {
        // Fallback to JPEG
      }

      const optimizedSizeKb = Math.round(optimizedDataUrl.length * 0.75 / 1024);
      const compressionRatio = originalSizeKb > 0 ? +(originalSizeKb / Math.max(1, optimizedSizeKb)).toFixed(1) : 1;

      resolve({
        optimizedBase64: optimizedDataUrl,
        mimeType,
        originalSizeKb,
        optimizedSizeKb,
        width,
        height,
        compressionRatio,
      });
    };

    img.onerror = () => {
      resolve({
        optimizedBase64: src,
        mimeType: 'image/png',
        originalSizeKb,
        optimizedSizeKb: originalSizeKb,
        width: 800,
        height: 600,
        compressionRatio: 1,
      });
    };

    img.src = src;
  });
}
