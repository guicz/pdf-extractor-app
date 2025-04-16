import axios from 'axios';
import { AnalysisResult } from '@/lib/types';

const api = axios.create({
  baseURL: '/api',
});

/**
 * Update the content of an analysis result
 * @param analysisId The ID of the analysis to update
 * @param content The new content for the analysis
 * @returns The updated analysis result
 */
export async function updateAnalysisContent(analysisId: string, content: string): Promise<AnalysisResult> {
  try {
    const response = await api.put(`/analysis/${analysisId}/content`, { content });
    
    if (response.data.success) {
      return response.data.analysis;
    } else {
      throw new Error(response.data.error || 'Failed to update analysis');
    }
  } catch (error) {
    console.error('Error updating analysis content:', error);
    throw error;
  }
}

/**
 * Get an analysis result by ID
 * @param analysisId The ID of the analysis to get
 * @returns The analysis result
 */
export async function getAnalysis(analysisId: string): Promise<AnalysisResult> {
  try {
    const response = await api.get(`/analysis/${analysisId}`);
    
    if (response.data.success) {
      return response.data.analysis;
    } else {
      throw new Error(response.data.error || 'Failed to get analysis');
    }
  } catch (error) {
    console.error('Error getting analysis:', error);
    throw error;
  }
} 