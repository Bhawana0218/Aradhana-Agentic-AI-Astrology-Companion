import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uuid, truncate } from '../lib/utils';
import type { ReadingSession, Message } from '../types';

interface HistoryState {
  sessions: ReadingSession[];
  saveSessionFromMessages: (messages: Message[]) => string;
  deleteSession: (id: string) => void;
  toggleBookmark: (id: string) => void;
  getSession: (id: string) => ReadingSession | undefined;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],

      saveSessionFromMessages: (messages) => {
        if (messages.length < 2) return '';
        const userMsgs = messages.filter((m) => m.role === 'user');
        const assistantMsgs = messages.filter((m) => m.role === 'assistant');
        if (userMsgs.length === 0) return '';

        const id = uuid();
        const title = truncate(userMsgs[0]?.content || 'Chat', 60);
        const preview = truncate(assistantMsgs[assistantMsgs.length - 1]?.content || '', 120);
        const existing = get().sessions.find((s) => s.title === title);
        if (existing) return existing.id;

        const session: ReadingSession = {
          id,
          title,
          preview,
          created_at: new Date().toISOString(),
          message_count: messages.length,
          bookmarked: false,
          tags: [],
        };
        set((s) => ({ sessions: [session, ...s.sessions] }));
        return id;
      },

      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((se) => se.id !== id) })),

      toggleBookmark: (id) =>
        set((s) => ({
          sessions: s.sessions.map((se) =>
            se.id === id ? { ...se, bookmarked: !se.bookmarked } : se
          ),
        })),

      getSession: (id) => get().sessions.find((s) => s.id === id),
    }),
    { name: 'astroagent-history' }
  )
);
