import { v4 as uuidv4 } from 'uuid';
import { Document } from '../types';

// In-memory storage for client-side
const documents: Record<string, Document> = {};
const extractionResults: Record<string, string> = {};
const analysisResults: Record<string, string> = {};

// Generate a new session ID
export const generateSessionId = () => {
  return uuidv4();
};

// Store document information
export const storeDocument = (file: File): Document => {
  const id = uuidv4();
  const document: Document = {
    id,
    name: file.name,
    path: URL.createObjectURL(file),
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  };

  documents[id] = document;
  return document;
};

// Get document by ID
export const getDocument = (id: string): Document | null => {
  return documents[id] || null;
};

// List all documents
export const listDocuments = (): Document[] => {
  return Object.values(documents);
};

// Store extraction result
export const storeExtractionResult = (documentId: string, content: string): string => {
  const id = uuidv4();
  extractionResults[id] = content;
  return id;
};

// Get extraction result
export const getExtractionResult = (id: string): string | null => {
  return extractionResults[id] || null;
};

// Store analysis result
export const storeAnalysisResult = (extractionId: string, content: string): string => {
  const id = uuidv4();
  analysisResults[id] = content;
  return id;
};

// Get analysis result
export const getAnalysisResult = (id: string): string | null => {
  return analysisResults[id] || null;
};

// Clear all data
export const clearAllData = () => {
  Object.keys(documents).forEach(id => {
    URL.revokeObjectURL(documents[id].path);
    delete documents[id];
  });
  
  Object.keys(extractionResults).forEach(id => {
    delete extractionResults[id];
  });
  
  Object.keys(analysisResults).forEach(id => {
    delete analysisResults[id];
  });
}; 