'use client';

import { Document } from '@/lib/types';

interface DocumentListProps {
  documents: Document[];
  activeDocument: Document | null;
  onSelect: (document: Document) => void;
}

export function DocumentList({ documents, activeDocument, onSelect }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center p-4 border border-dashed rounded-lg">
        <p className="text-base-content/70">Nenhum documento enviado ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Documentos Enviados</h3>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li key={doc.id}>
            <button
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 hover:bg-base-200 transition-colors ${
                activeDocument?.id === doc.id ? 'bg-base-200 border border-primary' : 'border border-base-300'
              }`}
              onClick={() => onSelect(doc)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-red-500 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>

              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{doc.name}</p>
                <p className="text-xs text-base-content/70">
                  {(doc.size / 1024).toFixed(2)} KB • Enviado{' '}
                  {new Date(doc.uploadedAt).toLocaleString()}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 