import { ResizeSettings } from "./types";

export const DEFAULT_SETTINGS: ResizeSettings = {
  width: 0,
  height: 0,
  maintainAspectRatio: true,
  format: 'image/jpeg',
  quality: 0.9,
  targetFileSizeKB: null,
};

export const SUPPORTED_FORMATS = [
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WEBP' },
];
