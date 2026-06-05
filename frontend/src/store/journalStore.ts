import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uuid } from '../lib/utils';
import type { JournalEntry, Mood, JournalTag } from '../types';

interface JournalState {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'bookmarked'>) => string;
  updateEntry: (id: string, data: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  toggleBookmark: (id: string) => void;
  getEntry: (id: string) => JournalEntry | undefined;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) => {
        const id = uuid();
        const now = new Date().toISOString();
        const newEntry: JournalEntry = {
          ...entry,
          id,
          created_at: now,
          updated_at: now,
          bookmarked: false,
        };
        set((s) => ({ entries: [newEntry, ...s.entries] }));
        return id;
      },

      updateEntry: (id, data) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, ...data, updated_at: new Date().toISOString() } : e
          ),
        })),

      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      toggleBookmark: (id) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, bookmarked: !e.bookmarked } : e
          ),
        })),

      getEntry: (id) => get().entries.find((e) => e.id === id),
    }),
    { name: 'astroagent-journal' }
  )
);
