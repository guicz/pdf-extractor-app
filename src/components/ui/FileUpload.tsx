'use client';

import { ChangeEvent, useState, useRef } from 'react';
import { Document } from '@/lib/types';

interface FileUploadProps {
  onUpload: (file: File) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  onUpload,
  acceptedFileTypes = 'application/pdf',
  maxSizeMB = 32,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    processFile(files[0]);
  };

  const processFile = (file: File) => {
    // Reset error state
    setError(null);
    
    // Validate file type
    if (!file.type.match(acceptedFileTypes)) {
      setError(`Tipo de arquivo inválido. Por favor, envie um arquivo ${acceptedFileTypes.split('/')[1].toUpperCase()}.`);
      return;
    }
    
    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Arquivo muito grande. O tamanho máximo é ${maxSizeMB}MB.`);
      return;
    }
    
    // Call the onUpload callback with the file
    onUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    processFile(files[0]);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-base-200' : 'border-base-300 hover:border-primary'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10 text-primary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>
            <p className="text-lg font-medium">Arraste e solte seu arquivo aqui</p>
            <p className="text-sm text-base-content/70">
              ou clique para procurar (Arquivos PDF até {maxSizeMB}MB • Até 100 páginas por arquivo)
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-error mt-4">
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
          <span>{error}</span>
        </div>
      )}
    </div>
  );
} 