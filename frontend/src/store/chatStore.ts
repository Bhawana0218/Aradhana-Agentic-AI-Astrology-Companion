import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { BirthDetails, Language, Message, ToolActivityState } from '../types';

interface ChatState {
  // Session
  messages: Message[];
  sessionId: string | null;
  isStreaming: boolean;
  toolActivity: ToolActivityState | null;
  error: string | null;
  birthDetails: BirthDetails | null;

  // UI state
  language: Language;
  sidebarOpen: boolean;
  showBirthForm: boolean;

  // Session actions
  setSessionId: (id: string) => void;
  addMessage: (msg: Message) => void;
  updateLastAssistantMessage: (content: string) => void;
  finalizeLastMessage: () => void;
  setStreaming: (val: boolean) => void;
  setToolActivity: (activity: ToolActivityState | null) => void;
  setError: (err: string | null) => void;
  setBirthDetails: (bd: BirthDetails | null) => void;
  clearMessages: () => void;

  // UI actions
  setLanguage: (lang: Language) => void;
  setSidebarOpen: (open: boolean) => void;
  setShowBirthForm: (show: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        messages: [],
        sessionId: null,
        isStreaming: false,
        toolActivity: null,
        error: null,
        birthDetails: null,
        language: 'en',
        sidebarOpen: false,
        showBirthForm: true,

        // Session actions
        setSessionId: (id) => set({ sessionId: id }),

        addMessage: (msg) =>
          set((state) => ({ messages: [...state.messages, msg] })),

        updateLastAssistantMessage: (content) =>
          set((state) => {
            const msgs = [...state.messages];
            for (let i = msgs.length - 1; i >= 0; i--) {
              if (msgs[i].role === 'assistant') {
                msgs[i] = {
                  ...msgs[i],
                  content: msgs[i].content + content,
                  isStreaming: true,
                };
                break;
              }
            }
            return { messages: msgs };
          }),

        finalizeLastMessage: () =>
          set((state) => {
            const msgs = [...state.messages];
            const ta = state.toolActivity;
            for (let i = msgs.length - 1; i >= 0; i--) {
              if (msgs[i].role === 'assistant') {
                const existingActivity = msgs[i].tool_activity ?? [];
                const newActivity = ta
                  ? [
                      ...existingActivity,
                      {
                        type: 'tool_end' as const,
                        tool: ta.tool,
                        input: ta.input,
                        output: ta.output,
                        timestamp: Date.now(),
                      },
                    ]
                  : existingActivity;
                msgs[i] = {
                  ...msgs[i],
                  isStreaming: false,
                  tool_activity: newActivity.length > 0 ? newActivity : undefined,
                };
                break;
              }
            }
            return { messages: msgs };
          }),

        setStreaming: (val) => set({ isStreaming: val }),
        setToolActivity: (activity) => set({ toolActivity: activity }),
        setError: (err) => set({ error: err }),

        setBirthDetails: (bd) =>
          set({ birthDetails: bd, showBirthForm: bd === null }),

        clearMessages: () =>
          set({ messages: [], error: null, toolActivity: null }),

        // UI actions
        setLanguage: (lang) => set({ language: lang }),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setShowBirthForm: (show) => set({ showBirthForm: show }),
      }),
      {
        name: 'astroagent-store',
        partialize: (state) => ({
          sessionId: state.sessionId,
          birthDetails: state.birthDetails,
          language: state.language,
          showBirthForm: state.showBirthForm,
        }),
      }
    )
  )
);
