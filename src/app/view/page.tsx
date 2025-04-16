'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDocuments } from '@/lib/hooks/useDocuments';
import Link from 'next/link';

type ViewTab = 'original' | 'extracted' | 'analysis';

export default function ViewPage() {
  const { documents, activeDocument, selectDocument } = useDocuments();
  const [activeTab, setActiveTab] = useState<ViewTab>('original');
  const [extractedContent] = useState<string | null>('Este é o conteúdo extraído do documento. Inclui texto, tabelas e outros elementos que foram extraídos do PDF.');
  const [analysisResult] = useState<string | null>('# Resultados da Análise\n\n## Pontos Principais\n\n1. Primeiro ponto importante\n2. Segundo ponto crítico\n3. Terceiro insight\n\n## Recomendações\n\n- Item de ação 1\n- Item de ação 2\n- Item de ação 3');

  const handleTabChange = (tab: ViewTab) => {
    setActiveTab(tab);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Visualizador de Documentos</h1>

        {documents.length === 0 ? (
          <div className="text-center py-12 bg-base-200 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Nenhum Documento Disponível</h3>
            <p className="text-base-content/70 mb-6">
              Você precisa enviar um documento antes de poder visualizá-lo
            </p>
            <Link href="/upload" className="btn btn-primary">
              Enviar Documentos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="bg-base-100 border border-base-300 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold">Documentos</h2>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 border rounded-lg cursor-pointer ${
                        activeDocument?.id === doc.id
                          ? 'border-primary bg-base-200'
                          : 'border-base-300 hover:bg-base-200'
                      }`}
                      onClick={() => selectDocument(doc.id)}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-primary"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                        <span className="font-medium truncate">{doc.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              {activeDocument && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{activeDocument.name}</h2>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                        Exportar
                      </button>
                    </div>
                  </div>

                  <div className="tabs tabs-boxed">
                    <button
                      className={`tab ${activeTab === 'original' ? 'tab-active' : ''}`}
                      onClick={() => handleTabChange('original')}
                    >
                      Documento Original
                    </button>
                    <button
                      className={`tab ${activeTab === 'extracted' ? 'tab-active' : ''}`}
                      onClick={() => handleTabChange('extracted')}
                    >
                      Conteúdo Extraído
                    </button>
                    <button
                      className={`tab ${activeTab === 'analysis' ? 'tab-active' : ''}`}
                      onClick={() => handleTabChange('analysis')}
                    >
                      Análise
                    </button>
                  </div>

                  <div className="bg-base-100 border border-base-300 rounded-lg p-6 min-h-96">
                    {activeTab === 'original' && (
                      <div>
                        <div className="bg-base-200 p-4 rounded-lg flex items-center justify-center h-80">
                          <iframe
                            src={activeDocument.path}
                            title={activeDocument.name}
                            className="w-full h-full border-0"
                          ></iframe>
                        </div>
                        <div className="text-center mt-4">
                          <a
                            href={activeDocument.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                          >
                            Abrir em Nova Aba
                          </a>
                        </div>
                      </div>
                    )}

                    {activeTab === 'extracted' && extractedContent && (
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap bg-base-200 p-4 rounded-lg">
                          {extractedContent}
                        </pre>
                      </div>
                    )}

                    {activeTab === 'analysis' && analysisResult && (
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap bg-base-200 p-4 rounded-lg">
                          {analysisResult}
                        </pre>
                      </div>
                    )}

                    {activeTab === 'extracted' && !extractedContent && (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-medium mb-2">
                          Nenhum Conteúdo Extraído
                        </h3>
                        <p className="text-base-content/70 mb-4">
                          Este documento ainda não foi processado
                        </p>
                        <Link href="/upload" className="btn btn-primary">
                          Extrair Conteúdo
                        </Link>
                      </div>
                    )}

                    {activeTab === 'analysis' && !analysisResult && (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-medium mb-2">Sem Análise</h3>
                        <p className="text-base-content/70 mb-4">
                          Este documento ainda não foi analisado
                        </p>
                        <Link href="/analyze" className="btn btn-primary">
                          Analisar Documento
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}