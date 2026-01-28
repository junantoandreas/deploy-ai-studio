export interface ImageFile {
  id: string;
  data: string; // Base64 string
  mimeType: string;
  url: string; // Blob URL for display
}

export enum LoadingState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GenerationConfig {
  prompt: string;
  aspectRatio?: string;
}