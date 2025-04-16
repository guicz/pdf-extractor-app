'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSessionStorage } from '@/lib/hooks/useSessionStorage';

// Helper to get API status from Next.js API route (server-side proxy)
async function getApiStatus() {
  try {
    const res = await fetch('/api/proxy/status');
    if (!res.ok) return { success: false };
    const data = await res.json();
    // Assume API returns { success: boolean, ... }
    return data;
  } catch {
    return { success: false };
  }
}

export default function Home() {
  const { sessionId, resetSession } = useSessionStorage();
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const [apiRawResponse, setApiRawResponse] = useState<any>(null);

  useEffect(() => {
    console.log('DEBUG Home State:', {
      sessionId,
      apiStatus,
      retryCount,
      apiRawResponse,
    });
  }, [sessionId, apiStatus, retryCount, apiRawResponse]);

  useEffect(() => {
    // Check API status on component mount with retry logic
    const checkApiStatus = async () => {
      try {
        const status = await getApiStatus();
        setApiRawResponse(status); // Save raw API response for debug
        // FIX: Accept both {success: true} and {status: 'online'}
        setApiStatus(
          status.success !== undefined
            ? (status.success ? 'available' : 'unavailable')
            : (status.status === 'online' ? 'available' : 'unavailable')
        );
        // DEBUG: Show API status response
        console.log('DEBUG API Status Response:', status);
      } catch (error) {
        console.error('Error checking API status:', error);
        setApiStatus('unavailable');
      }
    };
    
    checkApiStatus();

    // Set up a retry timer if the API is unavailable (max 3 retries)
    if (apiStatus === 'unavailable' && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        checkApiStatus();
      }, 5000); // Retry every 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [apiStatus, retryCount]);

  const handleClearData = () => {
    if (confirm('Tem certeza de que deseja limpar todos os seus dados de sessão? Isso não pode ser desfeito.')) {
      resetSession();
      window.location.reload();
    }
  };

  const handleRetryConnection = () => {
    setApiStatus('checking');
    setRetryCount((c) => c + 1);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8 space-y-12">
        <div className="space-y-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Bem-vindo ao Analista de Documentos</h1>
          <p className="text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto">
            Faça upload, extraia e analise seus documentos facilmente usando nossa poderosa API PDF Extractor
          </p>
          {apiStatus === 'checking' && (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}
          {apiStatus === 'unavailable' && (
            <div className="alert alert-warning shadow-lg max-w-lg mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-bold">Aviso</h3>
                <div className="text-sm">A API PDF Extractor está indisponível no momento. Alguns recursos podem não funcionar corretamente.</div>
                <button onClick={handleRetryConnection} className="btn btn-xs btn-outline mt-2">
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all">
            <div className="card-body items-center text-center">
              <h2 className="card-title flex items-center text-primary text-lg md:text-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 md:w-10 md:h-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                Fazer Upload
              </h2>
              <p className="text-base md:text-lg">Envie documentos PDF com nossa interface fácil de usar de arrastar e soltar.</p>
              <div className="card-actions justify-end mt-4">
                <Link href="/upload" className="btn btn-primary btn-sm">
                  Começar
                </Link>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all">
            <div className="card-body items-center text-center">
              <h2 className="card-title flex items-center text-primary text-lg md:text-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 md:w-10 md:h-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
                Criar Prompts
              </h2>
              <p className="text-base md:text-lg">Crie prompts personalizados ou use modelos prontos para analisar o conteúdo do documento.</p>
              <div className="card-actions justify-end mt-4">
                <Link href="/prompts" className="btn btn-primary btn-sm">
                  Explorar Prompts
                </Link>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all">
            <div className="card-body items-center text-center">
              <h2 className="card-title flex items-center text-primary text-lg md:text-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 md:w-10 md:h-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2"
                  />
                </svg>
                Analisar
              </h2>
              <p className="text-base md:text-lg">Extraia conteúdo e gere análises inteligentes dos seus documentos PDF.</p>
              <div className="card-actions justify-end mt-4">
                <Link href="/analyze" className="btn btn-primary btn-sm">
                  Analisar Agora
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button onClick={handleClearData} className="btn btn-outline btn-error btn-sm">
            Limpar dados da sessão
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
