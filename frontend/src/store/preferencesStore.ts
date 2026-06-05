import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, AIPersona } from '../types';

interface NotificationPrefs {
  weekly: boolean;
  retrograde: boolean;
  eclipse: boolean;
  newmoon: boolean;
}

interface PreferencesState {
  theme: Theme;
  persona: AIPersona;
  notifications: NotificationPrefs;
  setTheme: (t: Theme) => void;
  setPersona: (p: AIPersona) => void;
  setNotification: (key: keyof NotificationPrefs, value: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'cosmic',
      persona: 'wise',
      notifications: { weekly: true, retrograde: true, eclipse: false, newmoon: true },
      setTheme: (theme) => set({ theme }),
      setPersona: (persona) => set({ persona }),
      setNotification: (key, value) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
    }),
    { name: 'astroagent-preferences' }
  )
);
