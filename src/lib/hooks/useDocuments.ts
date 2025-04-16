'use client';

import { useState, useEffect } from 'react';
import { Document } from '@/lib/types';
import { listDocuments, storeDocument, getDocument } from '@/lib/storage/fileStorage';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load documents on mount
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    setIsLoading(true);
    const docs = listDocuments();
    setDocuments(docs);
    setActiveDocument(docs.length > 0 ? docs[0] : null);
    setIsLoading(false);
  };

  const addDocument = (file: File) => {
    const newDoc = storeDocument(file);
    setDocuments(listDocuments());
    setActiveDocument(newDoc);
    return newDoc;
  };

  const selectDocument = (id: string) => {
    const doc = getDocument(id);
    if (doc) {
      setActiveDocument(doc);
    }
  };

  return {
    documents,
    activeDocument,
    isLoading,
    addDocument,
    selectDocument,
    refreshDocuments: loadDocuments,
  };
} 