import { useCallback, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import type { SessionHistoryResponse } from '../types';

const API_BASE = '/api';

export function useSession() {
  const { sessionId, setSessionId, addMessage, clearMessages } = useChatStore();

  useEffect(() => {
    if (!sessionId) {
      createNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createNewSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create session');
      const data = await res.json();
      setSessionId(data.session_id);
      clearMessages();
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  }, [setSessionId, clearMessages]);

  const loadHistory = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}/history`);
      if (!res.ok) return;
      const data: SessionHistoryResponse = await res.json();
      clearMessages();
      data.messages.forEach((m) => {
        addMessage({
          id: String(m.id),
          role: m.role as 'user' | 'assistant',
          content: m.content,
          created_at: m.created_at,
          isStreaming: false,
        });
      });
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, [sessionId, addMessage, clearMessages]);

  return { createNewSession, loadHistory };
}
