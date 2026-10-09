import axios from 'axios';
import { PDF_EXTRACTOR_CONFIG } from '@/lib/config/environment';

// Use the local proxy endpoint instead of directly calling the external API
const api = axios.create({
  baseURL: PDF_EXTRACTOR_CONFIG.PROXY_API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Prompt padrão para extração completa ipsis litteris
const DEFAULT_EXTRACTION_PROMPT = 'Extraia o conteúdo completo do documento, sem abreviações nem placeholders. O conteúdo precisa ser COMPLETO IPSIS LITTERIS';

export const extractPDF = async (file: File, prompt?: string, useOCR: boolean = false) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use prompt do usuário ou padrão se não fornecido
    formData.append('prompt', prompt || DEFAULT_EXTRACTION_PROMPT);
    
    if (useOCR) {
      formData.append('use_ocr', 'true');
    }

    console.log('Extracting PDF through proxy endpoint:', `${PDF_EXTRACTOR_CONFIG.PROXY_API_URL}/extract-pdf`);
    const response = await api.post('/extract-pdf', formData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error extracting PDF:', error);
    
    // Handle network errors more specifically
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return { 
          success: false, 
          error: 'Could not connect to the extraction service. Please ensure the service is running.'
        };
      }
      
      if (error.response) {
        // The request was made and the server responded with an error status
        return { 
          success: false, 
          error: `Server error: ${error.response.status} - ${error.response.data?.error || error.message}`
        };
      } else if (error.request) {
        // The request was made but no response was received
        return { 
          success: false, 
          error: 'No response received from the server. The service may be unavailable.'
        };
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

// Use the proxy endpoint for API status checks
export const getApiStatus = async () => {
  try {
    // Always use the proxy endpoint for status
    const response = await axios.get(`${PDF_EXTRACTOR_CONFIG.PROXY_API_URL}/status`);
    return { success: response.status === 200, ...response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || !error.response) {
        return {
          success: false,
          error: 'Could not connect to the API service. Please ensure the service is running.'
        };
      }
      if (error.response) {
        return {
          success: false,
          error: `API Error: ${error.response.status}`,
          details: error.response.data
        };
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'API is not available',
    };
  }
};