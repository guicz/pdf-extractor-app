import axios from 'axios';
import { LLM_MODELS, APP_DEFAULTS } from '@/lib/config/environment';
import { LLMModel } from '@/lib/types';

/**
 * Analyze document content using a selected LLM model
 * 
 * @param extractionId The ID of the extracted content
 * @param promptId The prompt ID to guide the analysis
 * @param model The LLM model to use for analysis
 * @returns Analysis result object
 */
export const analyzeDocument = async (
  extractionId: string, 
  promptId: string | undefined, 
  model: LLMModel = APP_DEFAULTS.DEFAULT_LLM_MODEL
) => {
  try {
    // Call the analysis API endpoint
    const response = await axios.post('/api/analysis', {
      extractionId,
      promptId,
      model
    }, { withCredentials: true });
    
    return { 
      success: true, 
      data: response.data,
      model 
    };
  } catch (error) {
    console.error('Error analyzing document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      model 
    };
  }
}; 