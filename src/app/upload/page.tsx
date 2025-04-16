'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FileUpload } from '@/components/ui/FileUpload';
import { DocumentList } from '@/components/ui/DocumentList';
import { DocumentViewer } from '@/components/ui/documents/DocumentViewer'; // Corrigir import do DocumentViewer para garantir que está usando a versão correta
import { Document } from '@/lib/types';
import { uploadDocument, listDocuments, storeExtractionResult } from '@/lib/api/documentApi';
import { extractPDF, getApiStatus } from '@/lib/api/pdfExtractor';
import { useSessionStorage } from '@/lib/hooks/useSessionStorage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const router = useRouter();
  const { sessionId, isLoading } = useSessionStorage();
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  // Armazena o resultado extraído como string pura (Markdown extraído)
  const [extractionResult, setExtractionResult] = useState<string | null>(null);
  // Armazena o JSON raw da extração (para debug, se necessário)
  const [extractionRawJson, setExtractionRawJson] = useState<any | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractionId, setExtractionId] = useState<string | null>(null);
  const [useOCR, setUseOCR] = useState(false);
  const [apiStatus, setApiStatus] = useState<'available' | 'unavailable' | 'checking'>('checking');
  const [activeTab, setActiveTab] = useState('content');

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      const status = await getApiStatus();
      setApiStatus(status.success ? 'available' : 'unavailable');
    };
    
    checkApiStatus();
  }, []);

  // Load documents when sessionId is available
  useEffect(() => {
    if (sessionId && !isLoading) {
      loadDocuments();
    }
  }, [sessionId, isLoading]);

  // Sempre que a extração for concluída, garanta que a aba ativa seja 'content'
  useEffect(() => {
    if (extractionResult) {
      setActiveTab('content');
    }
  }, [extractionResult]);

  const loadDocuments = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Falha ao carregar seus documentos');
    }
  };

  const handleUpload = async (file: File) => {
    try {
      toast.promise(
        uploadDocument(file),
        {
          loading: 'Enviando documento...',
          success: (document) => {
            setActiveDocument(document);
            loadDocuments();
            return 'Documento enviado com sucesso!';
          },
          error: 'Falha ao enviar documento'
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleSelectDocument = (document: Document) => {
    setActiveDocument(document);
    setExtractionResult(null);
    setExtractionError(null);
    setExtractionId(null);
  };

  const handleExtractContent = async () => {
    if (!activeDocument) return;

    setIsExtracting(true);
    setExtractionError(null);
    setExtractionResult(null);
    setExtractionId(null);

    try {
      // Fetch the file from the URL
      const response = await fetch(activeDocument.path);
      const blob = await response.blob();
      const file = new File([blob], activeDocument.name, { type: activeDocument.type });

      // Extract the content with OCR option
      const result = await extractPDF(file, undefined, useOCR);

      if (result.success && result.data) {
        // Extrai apenas o texto relevante
        let extractedText = '';
        if (Array.isArray(result.data.content)) {
          const textItem = result.data.content.find((c: any) => c.type === 'text');
          extractedText = textItem?.text || '';
        } else if (typeof result.data.text === 'string') {
          extractedText = result.data.text;
        } else {
          extractedText = JSON.stringify(result.data, null, 2);
        }
        // Store extraction result via API (persistente)
        const storedResult = await storeExtractionResult(
          activeDocument.id,
          extractedText,
          { useOCR }
        );
        // O backend retorna extractionResult, que contém extractionId
        if (storedResult && (storedResult.extractionId || storedResult.id)) {
          const finalExtractionId = storedResult.extractionId || storedResult.id;
          setExtractionId(finalExtractionId);
          setExtractionResult(extractedText);
          setExtractionRawJson(result.data);
          toast.success('Conteúdo extraído com sucesso! Redirecionando para análise...');
          // Redireciona automaticamente para análise com o ID correto
          setTimeout(() => {
            router.push(`/analyze?extractionId=${finalExtractionId}`);
          }, 1200);
        } else {
          setExtractionError('Não foi possível obter o ID da extração.');
          toast.error('Não foi possível obter o ID da extração.');
        }
      } else {
        setExtractionError(result.error || 'Falha ao extrair conteúdo');
        toast.error('Falha na extração');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
      setExtractionError(errorMessage);
      toast.error('Falha na extração');
      console.error('Extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleContinueToAnalysis = () => {
    if (extractionId) {
      router.push(`/analyze?extractionId=${extractionId}`);
    } else {
      toast.error('Nenhum resultado de extração disponível para análise.');
    }
  };

  if (isLoading) {
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
        <h1 className="text-3xl font-bold mb-8">Enviar Documentos</h1>

        {apiStatus === 'unavailable' && (
          <div className="alert alert-warning mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>A API PDF Extractor parece estar indisponível. A funcionalidade de extração pode não funcionar.</span>
            <button className="btn btn-sm" onClick={() => getApiStatus().then(status => setApiStatus(status.success ? 'available' : 'unavailable'))}>
              Tentar Novamente
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <FileUpload onUpload={handleUpload} />
            
            <div className="divider"></div>
            
            <DocumentList
              documents={documents}
              activeDocument={activeDocument}
              onSelect={handleSelectDocument}
            />
          </div>

          <div className="md:col-span-2">
            <div className="bg-base-100 border border-base-300 rounded-lg p-6">
              {!activeDocument ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">Nenhum Documento Selecionado</h3>
                  <p className="text-base-content/70 mb-4">
                    Envie um documento ou selecione um da lista para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-xl font-medium">{activeDocument.name}</h3>
                    <div className="flex items-center gap-4">
                      <div className="form-control">
                        <label className="label cursor-pointer gap-2">
                          <span className="label-text">Usar OCR</span> 
                          <input 
                            type="checkbox" 
                            className="toggle toggle-primary toggle-sm" 
                            checked={useOCR}
                            onChange={(e) => setUseOCR(e.target.checked)}
                          />
                        </label>
                      </div>
                      {extractionResult ? (
                        <button
                          className="btn btn-primary"
                          onClick={handleExtractContent}
                          disabled={isExtracting || apiStatus === 'unavailable'}
                        >
                          {isExtracting ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Extraindo...
                            </>
                          ) : (
                            'Extrair Novamente'
                          )}
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={handleExtractContent}
                          disabled={isExtracting || apiStatus === 'unavailable'}
                        >
                          {isExtracting ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Extraindo...
                            </>
                          ) : (
                            'Extrair Conteúdo'
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {useOCR && (
                    <div className="alert alert-info">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>OCR ativado. Isso irá extrair texto de imagens no PDF, mas pode demorar mais.</span>
                    </div>
                  )}

                  <div className="divider"></div>

                  {extractionError && (
                    <div className="alert alert-error">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h3 className="font-bold">Falha na Extração</h3>
                        <div className="text-xs">{extractionError}</div>
                      </div>
                      <button 
                        className="btn btn-sm"
                        onClick={handleExtractContent}
                        disabled={isExtracting}
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  )}

                  {extractionResult && (
                    <div className="space-y-4">
                      <div className="alert alert-success">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 shrink-0 stroke-current"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Conteúdo extraído com sucesso!</span>
                      </div>

                      {extractionId && (
                        <div className="flex justify-end mb-4">
                          <button 
                            onClick={handleContinueToAnalysis}
                            className="btn btn-primary"
                          >
                            Continuar para Análise
                          </button>
                        </div>
                      )}

                      <div className="tabs tabs-boxed w-full mb-4">
                        <button
                          className={`tab ${activeTab === 'content' ? 'tab-active' : ''}`}
                          onClick={() => setActiveTab('content')}
                        >
                          Conteúdo Extraído
                        </button>
                        <button
                          className={`tab ${activeTab === 'json' ? 'tab-active' : ''}`}
                          onClick={() => setActiveTab('json')}
                        >
                          JSON Raw
                        </button>
                        <button
                          className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
                          onClick={() => setActiveTab('preview')}
                        >
                          Pré-visualização
                        </button>
                      </div>
                      <div className="tab-content">
                        {activeTab === 'content' && (
                          <div className="prose max-w-none bg-base-200 p-4 rounded-lg overflow-auto">
                            <div dangerouslySetInnerHTML={{ __html: extractionResult || '' }} />
                          </div>
                        )}
                        {activeTab === 'json' && (
                          <pre className="bg-base-200 p-4 rounded-lg overflow-auto">
                            {extractionRawJson ? JSON.stringify(extractionRawJson, null, 2) : ''}
                          </pre>
                        )}
                        {activeTab === 'preview' && (
                          <DocumentViewer document={activeDocument} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 