export interface Document {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface ExtractionResult {
  id: string;
  documentId: string;
  content: string;
  extractedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Prompt {
  id: string;
  name: string;
  content: string;
  isPreset: boolean;
  createdAt: string;
}

export type LLMModel = 'claude-3-7-sonnet-20250219' | 'o3-mini';

export interface AnalysisResult {
  id: string;
  extractionId: string;
  promptId: string;
  model: 'claude-3-7-sonnet-20250219' | 'o3-mini';
  content: string;
  analyzedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}