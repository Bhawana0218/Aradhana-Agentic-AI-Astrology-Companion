import { useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import type { BirthDetails, SSEEvent } from '../types';

const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});

const API_BASE = '/api';

export function useChat() {
  const {
    sessionId,
    isStreaming,
    addMessage,
    updateLastAssistantMessage,
    finalizeLastMessage,
    setStreaming,
    setToolActivity,
    setError,
  } = useChatStore();

  const ensureSession = useCallback(async (): Promise<string> => {
    const stored = useChatStore.getState().sessionId;
    if (stored) return stored;
    const res = await fetch(`${API_BASE}/sessions`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to create session');
    const data = await res.json();
    useChatStore.getState().setSessionId(data.session_id);
    return data.session_id;
  }, []);

  const sendMessage = useCallback(
    async (message: string, overrideBirthDetails?: BirthDetails) => {
      if (isStreaming || !message.trim()) return;

      let sid: string;
      try {
        sid = await ensureSession();
      } catch {
        setError('Could not connect to the server. Please try again.');
        return;
      }

      // Add user message immediately
      addMessage({
        id: uuid(),
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      });

      setError(null);
      setStreaming(true);
      setToolActivity(null);

      // Create empty assistant message for streaming into
      const assistantId = uuid();
      addMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
        created_at: new Date().toISOString(),
      });

      const bd = overrideBirthDetails ?? useChatStore.getState().birthDetails;

      try {
        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sid,
            message,
            birth_details: bd ?? undefined,
            language: useChatStore.getState().language,
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          let errMsg = `Server error (${response.status})`;
          try {
            const parsed = JSON.parse(errText);
            errMsg = parsed?.detail ?? errMsg;
          } catch { /* noop */ }
          throw new Error(errMsg);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body available');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const raw = line.slice(6).trim();
              if (!raw) continue;
              try {
                const event: SSEEvent = JSON.parse(raw);
                handleSSEEvent(event);
              } catch {
                // skip malformed SSE data
              }
            }
          }
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'An unexpected cosmic disturbance occurred.';
        setError(msg);
        // Replace the empty assistant message with an error message
        useChatStore.getState().updateLastAssistantMessage(
          "I'm sorry, I encountered a disruption in the cosmic connection. Please try again."
        );
      } finally {
        finalizeLastMessage();
        setStreaming(false);
        setToolActivity(null);
      }
    },
    [isStreaming, addMessage, setError, setStreaming, setToolActivity, finalizeLastMessage, ensureSession]
  );

  function handleSSEEvent(event: SSEEvent) {
    switch (event.type) {
      case 'token':
        if (event.content) {
          updateLastAssistantMessage(event.content);
        }
        break;

      case 'tool_start':
        setToolActivity({
          tool: event.tool ?? 'unknown',
          status: 'running',
          input: event.input,
          startedAt: Date.now(),
        });
        break;

      case 'tool_end':
        setToolActivity({
          tool: event.tool ?? 'unknown',
          status: 'done',
          input: undefined,
          output: event.output,
        });
        break;

      case 'done':
        // Finalized in the finally block
        break;

      case 'error':
        setError(event.message ?? 'Unknown error from server');
        break;
    }
  }

  return {
    sendMessage,
    isStreaming,
  };
}
