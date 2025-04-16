import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Document } from '@/lib/types';
import { useState } from 'react';

interface DocumentListProps {
  documents: Document[];
  activeDocument: Document | null;
  onSelect: (document: Document) => void;
  onDelete?: (document: Document) => Promise<void>;
}

export function DocumentList({ 
  documents, 
  activeDocument, 
  onSelect,
  onDelete 
}: DocumentListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <Card title="Seus Documentos">
        <div className="py-6 text-center">
          <p className="text-base-content/70 mb-2">Nenhum documento enviado ainda</p>
          <p className="text-sm">Envie um documento para começar</p>
        </div>
      </Card>
    );
  }

  const handleDelete = async (document: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!onDelete) return;
    
    if (confirm(`Tem certeza que deseja excluir "${document.name}"?`)) {
      setIsDeleting(document.id);
      try {
        await onDelete(document);
      } catch (error) {
        console.error('Falha ao excluir documento:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <Card title="Seus Documentos">
      <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {documents.map((document) => (
          <li key={document.id}>
            <div
              className={`p-3 rounded-lg border flex items-center gap-2 cursor-pointer hover:bg-base-200 transition-colors ${
                activeDocument?.id === document.id
                  ? 'bg-base-200 border-primary'
                  : 'border-base-300'
              }`}
              onClick={() => onSelect(document)}
            >
              <div className="flex-shrink-0 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{document.name}</p>
                <p className="text-xs text-base-content/60">
                  {new Date(document.uploadedAt).toLocaleString()}
                </p>
              </div>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="xs"
                  className="w-8 h-8 p-0 flex items-center justify-center"
                  aria-label="Excluir documento"
                  onClick={(e) => handleDelete(document, e)}
                  disabled={isDeleting === document.id}
                >
                  {isDeleting === document.id ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-error"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
} 