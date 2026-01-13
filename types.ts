export enum GenerationType {
  TEXT_TO_VIDEO = 'text-to-video',
  IMAGE_TO_VIDEO = 'image-to-video',
  TEXT_TO_IMAGE = 'text-to-image',
}

export enum GenerationStatus {
  IDLE = 'idle',
  ENHANCING = 'enhancing',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface GenerationConfig {
  aspectRatio: '16:9' | '9:16' | '1:1';
  resolution: '720p' | '1080p';
}

export interface Generation {
  id: string;
  type: GenerationType;
  prompt: string;
  enhancedPrompt?: string;
  status: GenerationStatus;
  mediaUrl?: string; // Video URL or Image Data URL
  thumbnailUrl?: string;
  createdAt: number;
  config: GenerationConfig;
}

export interface User {
  uid: string;
  email: string;
  credits: number;
}
