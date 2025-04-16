import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  supportedFileTypes?: string[];
  maxSizeMB?: number;
}

export function FileUpload({
  onUpload,
  supportedFileTypes = ['.pdf', 'application/pdf'],
  maxSizeMB = 32
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileType = file.type;
    
    const isValidType = supportedFileTypes.some(type => {
      if (type.startsWith('.')) {
        return `.${fileExtension}` === type.toLowerCase();
      } else {
        return fileType === type;
      }
    });

    if (!isValidType) {
      setError(`Tipo de arquivo não suportado. Por favor, envie um arquivo PDF.`);
      return false;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      setError(`O tamanho do arquivo excede o limite de ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        e.target.value = '';
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      await onUpload(file);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Falha ao enviar o arquivo. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const resetFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card title="Enviar Documento">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-base-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          accept={supportedFileTypes.filter(type => type.startsWith('.')).join(',')}
          onChange={handleFileSelect}
          ref={fileInputRef}
        />
        
        {!file ? (
          <div className="space-y-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-primary/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div>
              <p className="text-lg font-medium mb-1">Arraste seu arquivo aqui</p>
              <p className="text-sm text-base-content/60 mb-4">
                ou procure no seu computador
              </p>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleBrowseClick}
              >
                Procurar Arquivos
              </Button>
            </div>
            <p className="text-xs text-base-content/60">
              Tamanho máximo do arquivo: {maxSizeMB}MB • Até 100 páginas por arquivo
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-medium break-all">{file.name}</p>
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFile}
              >
                Limpar
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleUpload} 
                isLoading={isUploading}
              >
                Enviar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 