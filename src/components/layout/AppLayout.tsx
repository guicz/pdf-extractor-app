'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      {/* Header */}
      <header className="bg-base-100 shadow-sm border-b border-base-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            Analista de Documentos
          </Link>

          <div className="flex items-center gap-4">
            <nav>
              <ul className="flex items-center gap-4">
                <li>
                  <Link
                    href="/upload"
                    className="px-3 py-2 rounded-lg hover:bg-base-200 transition-colors"
                  >
                    Enviar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/prompts"
                    className="px-3 py-2 rounded-lg hover:bg-base-200 transition-colors"
                  >
                    Prompts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analyze"
                    className="px-3 py-2 rounded-lg hover:bg-base-200 transition-colors"
                  >
                    Analisar
                  </Link>
                </li>
              </ul>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-base-200 border-t border-base-300 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-base-content/70">
          <p>App Analista de Documentos &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
} 