import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

/**
 * Custom hook to manage session ID and storage state
 * Ensures consistent session is maintained between client and server
 */
export function useSessionStorage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing sessionId in cookies
    let currentSessionId = Cookies.get('sessionId');
    
    // If no session ID found, create one
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      Cookies.set('sessionId', currentSessionId, { 
        expires: 7, // 7 days
        path: '/' 
      });
    }
    
    setSessionId(currentSessionId);
    setIsLoading(false);
  }, []);

  // Function to reset session (for logout/clear functionality)
  const resetSession = () => {
    const newSessionId = uuidv4();
    Cookies.set('sessionId', newSessionId, { 
      expires: 7,
      path: '/' 
    });
    setSessionId(newSessionId);
  };

  return {
    sessionId,
    isLoading,
    resetSession
  };
} 