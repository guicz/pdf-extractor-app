'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentViewer } from '@/components/ui/DocumentViewer';
import { TabInterface } from '@/components/ui/TabInterface';
import { PromptSelector } from '@/components/ui/PromptSelector';
import { ModelSelector } from '@/components/ui/ModelSelector';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import { Document, Prompt, LLMModel, ExtractionResult, AnalysisResult } from '@/lib/types';
import { useSessionStorage } from '@/lib/hooks/useSessionStorage';
import { listDocuments, getExtractionResult, storeAnalysisResult, getAnalysisResult, getExportUrl, getLatestExtractionResult } from '@/lib/api/documentApi';
import { updateAnalysisContent } from '@/lib/api/analysisApi';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const { sessionId, isLoading } = useSessionStorage();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedModel, setSelectedModel] = useState<LLMModel>('claude-3-7-sonnet-20250219');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isLoading1, setIsLoading1] = useState(true);
  
  // Get extractionId from URL (if redirected from upload)
  const extractionId = searchParams.get('extractionId');

  // Load documents and extraction when session is available
  useEffect(() => {
    if (sessionId && !isLoading) {
      loadInitialData();
    }
  }, [sessionId, isLoading]);

  // Load extraction result if extractionId is provided
  useEffect(() => {
    if (extractionId && sessionId && !isLoading) {
      loadExtractionResult(extractionId);
    }
  }, [extractionId, sessionId, isLoading]);

  const loadInitialData = async () => {
    setIsLoading1(true);
    try {
      // Load documents
      const documentsResult = await listDocuments();
      setDocuments(documentsResult);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Falha ao carregar documentos');
    } finally {
      setIsLoading1(false);
    }
  };

  const loadExtractionResult = async (id: string) => {
    try {
      const result = await getExtractionResult(id);
      if (result) {
        setExtractionResult(result);
        
        // Find the document that this extraction belongs to
        const document = await loadDocuments();
        if (document) {
          setSelectedDocument(document);
        }
      }
    } catch (error) {
      console.error('Error loading extraction result:', error);
      toast.error('Falha ao carregar o resultado da extração');
    }
  };

  const loadDocuments = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
      
      // If we have an extraction result, find the matching document
      if (extractionResult) {
        const matchingDoc = docs.find(doc => doc.id === extractionResult.documentId);
        if (matchingDoc) {
          return matchingDoc;
        }
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Falha ao carregar documentos');
    }
    return null;
  };

  const handleSelectDocument = async (document: Document) => {
    setSelectedDocument(document);
    setExtractionResult(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    try {
      toast.loading('Carregando resultados da extração...');
      // Busca a extração mais recente para o documento selecionado
      const extraction = await getLatestExtractionResult(document.id);
      setExtractionResult(extraction);
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      toast.error('Nenhum resultado de extração encontrado para este documento.');
      console.error(error);
    }
  };

  const handlePromptSelect = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleModelSelect = (model: LLMModel) => {
    setSelectedModel(model);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleStartAnalysisStream = async () => {
    if (!extractionResult || !selectedPrompt) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    let controller = new AbortController();
    let accumulated = '';
    try {
      toast.loading('Analisando documento em tempo real...');
      const response = await fetch('/api/analysis/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: extractionResult.content,
          prompt: selectedPrompt.content,
          model: selectedModel,
        }),
        signal: controller.signal,
      });
      if (!response.body) throw new Error('Sem suporte a streaming');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // Extrai apenas o texto do formato SSE: data: ...\n\n
          chunk.split('data:').forEach((part) => {
            const text = part.trim();
            if (text) {
              accumulated += text + '\n';
              setAnalysisResult({
                id: 'stream',
                extractionId: extractionResult.id,
                promptId: selectedPrompt.id,
                model: selectedModel,
                content: accumulated,
                analyzedAt: new Date().toISOString(),
              });
            }
          });
        }
      }
      toast.success('Análise concluída!');
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Erro no streaming da análise');
      toast.error('Falha na análise streaming');
      console.error('Analysis streaming error:', error);
    } finally {
      setIsAnalyzing(false);
      toast.dismiss();
    }
  };

  const handleExport = (format: 'markdown' | 'text' | 'html' = 'markdown') => {
    if (!analysisResult) return;
    
    // Get the export URL
    const exportUrl = getExportUrl(analysisResult.id, format);
    
    // Open in a new tab
    window.open(exportUrl, '_blank');
  };

  // Add a new function to save edited analysis content
  const handleSaveAnalysisContent = async (content: string) => {
    if (!analysisResult) return;
    
    try {
      const updatedAnalysis = await updateAnalysisContent(analysisResult.id, content);
      setAnalysisResult(updatedAnalysis);
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving analysis content:', error);
      return Promise.reject(error);
    }
  };

  if (isLoading || isLoading1) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Analisar Documentos</h1>

        {documents.length === 0 ? (
          <div className="text-center py-12 bg-base-200 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Nenhum Documento Disponível</h3>
            <p className="text-base-content/70 mb-6">
              Você precisa enviar e extrair um documento antes de poder analisá-lo
            </p>
            <a href="/upload" className="btn btn-primary">
              Enviar Documentos
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Barra Lateral Esquerda - Documentos */}
            <div className="space-y-6">
              <div className="bg-base-100 border border-base-300 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Documentos</h2>
                
                <ul className="space-y-2">
                  {documents.map((doc) => (
                    <li key={doc.id}>
                      <button
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-2 hover:bg-base-200 transition-colors ${
                          selectedDocument?.id === doc.id
                            ? 'bg-base-200 border-l-4 border-primary pl-2'
                            : 'border border-base-300'
                        }`}
                        onClick={() => handleSelectDocument(doc)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{doc.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {extractionResult && (
                <div className="bg-base-100 border border-base-300 rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">Configurações de Análise</h2>
                  
                  <div className="space-y-6">
                    <PromptSelector
                      onSelect={handlePromptSelect}
                      selectedPromptId={selectedPrompt?.id}
                    />
                    
                    <ModelSelector
                      onSelect={handleModelSelect}
                      selectedModel={selectedModel}
                      disabled={isAnalyzing}
                    />
                    
                    <button
                      className="btn btn-primary w-full"
                      disabled={!selectedPrompt || isAnalyzing || !extractionResult || !extractionResult.id}
                      onClick={handleStartAnalysisStream}
                    >
                      {isAnalyzing ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Analisando...
                        </>
                      ) : (
                        'Iniciar Análise'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Conteúdo Principal - Visualizador de Documentos */}
            <div className="lg:col-span-2">
              {selectedDocument && extractionResult ? (
                <div className="h-[80vh]">
                  <TabInterface
                    tabs={[
                      {
                        id: 'document',
                        label: 'Documento Original',
                        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>,
                        content: (
                          <DocumentViewer documentUrl={selectedDocument.path} />
                        ),
                      },
                      {
                        id: 'extracted',
                        label: 'Conteúdo Extraído',
                        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>,
                        content: (
                          <div className="prose max-w-none">
                            <pre className="bg-base-200 p-4 rounded-lg overflow-auto h-full">
                              {extractionResult.content}
                            </pre>
                          </div>
                        ),
                      },
                      {
                        id: 'analysis',
                        label: 'Análise',
                        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>,
                        content: (
                          <div className="h-full">
                            {analysisResult ? (
                              <div className="h-full flex flex-col">
                                <div className="flex justify-end mb-4 space-x-2">
                                  <button 
                                    className="btn btn-sm" 
                                    onClick={() => handleExport('markdown')}
                                  >
                                    Exportar Markdown
                                  </button>
                                  <button 
                                    className="btn btn-sm" 
                                    onClick={() => handleExport('text')}
                                  >
                                    Exportar Texto
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  {isAnalyzing && (
                                    <>
                                      <span className="loading loading-spinner loading-md text-success" title="Análise em andamento"></span>
                                      <div className="w-40 h-2 bg-base-200 rounded-full overflow-hidden">
                                        <div className="h-2 bg-success animate-pulse" style={{ width: '80%' }}></div>
                                      </div>
                                    </>
                                  )}
                                  <span className="font-semibold">Analysis Content</span>
                                </div>
                                <div className="flex-1">
                                  <div className="mt-4">
                                    {analysisResult && analysisResult.content && (
                                      <div className="prose prose-sm max-w-none bg-white p-4 rounded shadow">
                                        <ReactMarkdown>{analysisResult.content}</ReactMarkdown>
                                      </div>
                                    )}
                                  </div>
                                  <MarkdownEditor 
                                    initialContent={analysisResult?.content} 
                                    onSave={handleSaveAnalysisContent}
                                  />
                                </div>
                              </div>
                            ) : analysisError ? (
                              <div className="alert alert-error">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{analysisError}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-xl font-medium mb-2">Nenhuma Análise Ainda</h3>
                                <p className="text-base-content/70 mb-4">
                                  Selecione um prompt e modelo, depois clique em "Iniciar Análise" para analisar este documento
                                </p>
                              </div>
                            )}
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              ) : (
                <div className="bg-base-100 border border-base-300 rounded-lg p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-xl font-semibold mb-2">Selecione um Documento</h2>
                  <p className="text-base-content/70">
                    Selecione um documento da lista para visualizar e analisar seu conteúdo
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}