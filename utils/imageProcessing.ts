import { ResizeSettings, ProcessingResult, ImageFormat } from "../types";

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      },
      format,
      quality
    );
  });
};

// Binary search to find quality that fits the target size
const fitToSize = async (
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  targetKB: number,
  initialQuality: number = 0.9
): Promise<Blob> => {
  const targetBytes = targetKB * 1024;
  let minQ = 0;
  let maxQ = 1;
  let bestBlob: Blob | null = null;
  let currentQ = initialQuality;

  // Try initial quality first
  let blob = await canvasToBlob(canvas, format, currentQ);
  
  // If initial is already smaller, we might want to increase quality if it's way smaller?
  // But usually "Max Size" means "Highest quality under X".
  // If initial is under limit, check if we can go higher.
  
  if (blob.size <= targetBytes) {
      // It fits. Can we go higher?
      minQ = currentQ;
      maxQ = 1.0;
  } else {
      // Too big.
      maxQ = currentQ;
      minQ = 0.01;
  }

  // Iterative binary search for best quality
  for (let i = 0; i < 6; i++) { // 6 iterations is usually enough precision
    currentQ = (minQ + maxQ) / 2;
    blob = await canvasToBlob(canvas, format, currentQ);
    
    if (blob.size > targetBytes) {
      maxQ = currentQ;
    } else {
      minQ = currentQ;
      bestBlob = blob; // Keep the best one that fits
    }
  }

  // If we found a fit, return it. Otherwise return the smallest possible (minQ approx 0)
  return bestBlob || await canvasToBlob(canvas, format, 0.05);
};

export const processImage = async (
  originalSrc: string,
  settings: ResizeSettings
): Promise<ProcessingResult> => {
  const img = await loadImage(originalSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Set dimensions
  canvas.width = settings.width;
  canvas.height = settings.height;

  // Draw and resize (using high quality scaling)
  // For better downscaling quality, we could use stepping, but standard drawImage is usually okay for client-side tools unless drastic reduction.
  ctx.drawImage(img, 0, 0, settings.width, settings.height);

  let blob: Blob;

  // Logic for Target File Size (Only works well for lossy formats like JPEG/WEBP)
  const canCompress = settings.format === 'image/jpeg' || settings.format === 'image/webp';
  
  if (canCompress && settings.targetFileSizeKB && settings.targetFileSizeKB > 0) {
     // Special handling for target size
     // Note: targetFileSizeKB is strict limit
     blob = await fitToSize(canvas, settings.format, settings.targetFileSizeKB, settings.quality);
  } else {
     // Standard export
     blob = await canvasToBlob(canvas, settings.format, settings.quality);
  }

  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    width: settings.width,
    height: settings.height,
    size: blob.size
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
