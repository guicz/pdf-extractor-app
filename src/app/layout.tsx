import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { SessionManager } from '@/components/ui/SessionManager';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'App Extrator de PDF',
  description: 'Extraia, analise e processe documentos PDF com IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-base-100 text-base-content">
        <ThemeProvider>
          <SessionManager>
            {children}
            <Toaster position="bottom-right" />
          </SessionManager>
        </ThemeProvider>
      </body>
    </html>
  );
}
