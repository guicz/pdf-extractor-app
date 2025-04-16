import { Document } from '@/lib/types';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export async function uploadDocument(file: File): Promise<Document> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      return response.data.document;
    } else {
      throw new Error(response.data.error || 'Failed to upload document');
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

export async function listDocuments(): Promise<Document[]> {
  try {
    const response = await api.get('/documents');
    
    if (response.data.success) {
      return response.data.documents;
    } else {
      throw new Error(response.data.error || 'Failed to list documents');
    }
  } catch (error) {
    console.error('Error listing documents:', error);
    throw error;
  }
}

export async function storeExtractionResult(documentId: string, content: string, metadata?: Record<string, unknown>) {
  try {
    const response = await api.post('/extraction', {
      documentId,
      content,
      metadata,
    });
    
    if (response.data.success) {
      return response.data.extractionResult;
    } else {
      throw new Error(response.data.error || 'Failed to store extraction result');
    }
  } catch (error) {
    console.error('Error storing extraction result:', error);
    throw error;
  }
}

export async function getExtractionResult(extractionId: string) {
  try {
    const response = await api.get(`/extraction?id=${extractionId}`);
    
    if (response.data.success) {
      return response.data.extractionResult;
    } else {
      throw new Error(response.data.error || 'Failed to get extraction result');
    }
  } catch (error) {
    console.error('Error getting extraction result:', error);
    throw error;
  }
}

// Busca a extração mais recente para um documento
export async function getLatestExtractionResult(documentId: string) {
  try {
    const response = await api.get(`/extraction?documentId=${documentId}`);
    if (response.data.success) {
      return response.data.extractionResult;
    } else {
      throw new Error(response.data.error || 'Failed to get extraction result');
    }
  } catch (error) {
    console.error('Error getting latest extraction result:', error);
    throw error;
  }
}

export async function storeAnalysisResult(extractionId: string, promptId: string, model: string) {
  try {
    // Garante que promptId não seja undefined e model está correto
    if (!extractionId || !promptId || !model) {
      throw new Error('Todos os campos (extractionId, promptId, model) são obrigatórios para análise.');
    }
    // Só aceita os modelos válidos definidos pelo usuário
    const SUPPORTED_MODELS = ['claude', 'o3-mini'];
    const normalizedModel = SUPPORTED_MODELS.includes(model) ? model : SUPPORTED_MODELS[0];
    const payload = {
      extractionId,
      promptId,
      model: normalizedModel
    };
    const response = await api.post('/analysis', payload, { withCredentials: true });
    if (response.data.success) {
      return response.data.analysisResult;
    } else {
      throw new Error(response.data.error || 'Failed to store analysis result');
    }
  } catch (error) {
    console.error('Error storing analysis result:', error);
    throw error;
  }
}

export async function getAnalysisResult(analysisId: string) {
  try {
    const response = await api.get(`/analysis?id=${analysisId}`);
    
    if (response.data.success) {
      return response.data.analysisResult;
    } else {
      throw new Error(response.data.error || 'Failed to get analysis result');
    }
  } catch (error) {
    console.error('Error getting analysis result:', error);
    throw error;
  }
}

export function getExportUrl(analysisId: string, format: 'markdown' | 'text' | 'html' = 'markdown') {
  return `/api/export?id=${analysisId}&format=${format}`;
} 