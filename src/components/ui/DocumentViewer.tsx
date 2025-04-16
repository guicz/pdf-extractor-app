import React, { useState } from 'react';
import { Document as PDFDocument, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

interface DocumentViewerProps {
  documentUrl: string;
  documentType?: string;
}

export function DocumentViewer({ documentUrl, documentType }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);

  // Corrigir uso de includes para evitar erro quando documentUrl é undefined
  const fileType = typeof documentUrl === 'string' && documentUrl.includes('.pdf')
    ? 'application/pdf'
    : typeof documentUrl === 'string' && (documentUrl.includes('.jpg') || documentUrl.includes('.jpeg'))
      ? 'image/jpeg'
      : typeof documentUrl === 'string' && documentUrl.includes('.png')
        ? 'image/png'
        : 'application/octet-stream';

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const nextPage = () => {
    if (pageNumber < (numPages || 1)) {
      setPageNumber(pageNumber + 1);
    }
  };

  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const zoomIn = () => {
    setScale(scale + 0.2);
  };

  const zoomOut = () => {
    if (scale > 0.4) {
      setScale(scale - 0.2);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {fileType.includes('pdf') ? (
        <>
          <div className="bg-base-200 p-2 rounded-lg mb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <button onClick={prevPage} disabled={pageNumber <= 1} className="btn btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm">
                Page {pageNumber} of {numPages || '?'}
              </span>
              <button
                onClick={nextPage}
                disabled={pageNumber >= (numPages || 1)}
                className="btn btn-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button onClick={zoomOut} className="btn btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <button onClick={zoomIn} className="btn btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 border border-base-300 rounded-lg overflow-auto relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-base-100/80">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}
            <PDFDocument file={documentUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<span className="loading loading-spinner loading-lg"></span>}>
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </PDFDocument>
          </div>
        </>
      ) : fileType.includes('image') ? (
        <div className="flex-1 flex items-center justify-center">
          <img
            src={documentUrl}
            alt="Document"
            className="max-w-full max-h-full border border-base-300 rounded-lg object-contain"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mb-4 text-center">
            This document type cannot be previewed directly. Please download to view.
          </p>
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            download
          >
            Download Document
          </a>
        </div>
      )}
    </div>
  );
} 