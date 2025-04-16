import { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Document } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface DocumentViewerProps {
  document: Document | null;
  content?: string;
  onExtract?: () => void;
  useOCR?: boolean;
  onToggleOCR?: (value: boolean) => void;
  isExtracting?: boolean;
  extractionError?: string | null;
  rawJsonString?: string;
}

export function DocumentViewer({
  document,
  content,
  onExtract,
  useOCR = false,
  onToggleOCR,
  isExtracting = false,
  extractionError = null,
  rawJsonString = '',
}: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'extracted'>('preview');
  const [isLoading, setIsLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (document) {
      setIsLoading(true);
      
      // We set a small timeout to simulate loading
      // In a real app, you might be loading the document from a URL
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [document]);

  if (!document) {
    return (
      <Card title="Visualizador de Documento">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Nenhum Documento Selecionado</h3>
          <p className="text-base-content/70 mb-4">
            Envie um documento ou selecione um da lista para começar
          </p>
        </div>
      </Card>
    );
  }

  // Helper to extract only the 'text' from the API response if it's a JSON string
  function getExtractedText(content: string): string {
    try {
      const parsed = JSON.parse(content);
      if (parsed && parsed.content && Array.isArray(parsed.content)) {
        // Anthropic format: { content: [ { type: 'text', text: '...' } ] }
        const textItem = parsed.content.find((c: any) => c.type === 'text');
        if (textItem && typeof textItem.text === 'string') {
          return textItem.text;
        }
      }
      // Fallback: if content.text exists
      if (parsed && typeof parsed.text === 'string') {
        return parsed.text;
      }
    } catch {
      // Not JSON, return as is
      return content;
    }
    return content;
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b border-base-200 p-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-medium truncate">{document.name}</h3>
          <p className="text-sm text-base-content/60">
            Enviado em {new Date(document.uploadedAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          {onToggleOCR && (
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <span className="label-text">Usar OCR</span> 
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary toggle-sm" 
                  checked={useOCR}
                  onChange={(e) => onToggleOCR(e.target.checked)}
                  disabled={isExtracting}
                />
              </label>
            </div>
          )}
          
          {onExtract && (
            <Button
              variant="primary"
              onClick={onExtract}
              isLoading={isExtracting}
              disabled={isExtracting}
            >
              {isExtracting ? 'Extraindo...' : 'Extrair Conteúdo'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="tabs tabs-bordered p-2">
        <button
          className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Pré-visualização
        </button>
        <button
          className={`tab ${activeTab === 'extracted' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('extracted')}
          disabled={!content}
        >
          Conteúdo Extraído
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : activeTab === 'preview' ? (
          <div className="flex justify-center">
            {document.type.includes('pdf') ? (
              <object
                data={document.path}
                type="application/pdf"
                className="w-full h-[70vh]"
              >
                <div className="text-center py-12">
                  <Alert variant="warning" title="Visualizador de PDF Indisponível">
                    Seu navegador não suporta PDFs incorporados. 
                    <a href={document.path} target="_blank" rel="noopener noreferrer" className="link link-primary">
                      Clique aqui para baixar o PDF
                    </a>.
                  </Alert>
                </div>
              </object>
            ) : document.type.includes('image') ? (
              <img 
                src={document.path} 
                alt={document.name} 
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <div className="text-center py-12">
                <Alert variant="info" title="Pré-visualização Indisponível">
                  Pré-visualização indisponível para este tipo de arquivo
                </Alert>
              </div>
            )}
          </div>
        ) : (
          <div>
            {extractionError ? (
              <Alert variant="error" title="Falha na Extração">
                {extractionError}
              </Alert>
            ) : content ? (
              <div className="prose max-w-none bg-base-200 p-4 rounded-lg break-words overflow-x-auto">
                <button
                  className={`btn btn-xs ml-2 ${showRaw ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setShowRaw((v) => !v)}
                >
                  {showRaw ? 'Visualizar Renderizado' : 'Visualizar JSON Raw'}
                </button>
                {showRaw ? (
                  <pre className="whitespace-pre-wrap break-words text-xs">{rawJsonString}</pre>
                ) : (
                  <ReactMarkdown>{getExtractedText(content)}</ReactMarkdown>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-base-content/70">
                  Extraia o conteúdo para visualizá-lo aqui
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 