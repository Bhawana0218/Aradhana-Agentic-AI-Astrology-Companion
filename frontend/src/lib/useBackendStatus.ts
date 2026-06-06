import { useState, useEffect } from 'react';
import { healthCheck } from './api';

export function useBackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        await healthCheck();
        if (!cancelled) setStatus('online');
      } catch {
        if (!cancelled) setStatus('offline');
      }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  return status;
}
