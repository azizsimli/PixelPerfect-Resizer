export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ImageState {
  file: File | null;
  originalPreview: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  name: string;
}

export interface ResizeSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  format: ImageFormat;
  quality: number; // 0 to 1
  targetFileSizeKB?: number | null; // Optional target size in KB
}

export interface ProcessingResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
}
