'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

interface SessionManagerProps {
  children: React.ReactNode;
}

export function SessionManager({ children }: SessionManagerProps) {
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if session exists
    const sessionId = localStorage.getItem('sessionId') || document.cookie
      .split('; ')
      .find(row => row.startsWith('sessionId='))
      ?.split('=')[1];

    if (!sessionId) {
      // Create new session
      const newSessionId = uuidv4();
      
      // Store in localStorage for client access
      localStorage.setItem('sessionId', newSessionId);
      
      // Also set as cookie for server access
      document.cookie = `sessionId=${newSessionId}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      
      console.log('New session created:', newSessionId);
    } else {
      console.log('Using existing session:', sessionId);
    }
    
    setInitialized(true);
  }, []);

  // Show loading state while initializing
  if (!initialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return <>{children}</>;
} 