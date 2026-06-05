import { useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { uuid } from '../lib/utils';
import type { Toast as ToastType } from '../types';
import clsx from 'clsx';

interface ToastStore {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = uuid();
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    return id;
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}));

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: { border: 'border-teal/30', bg: 'bg-teal/8', icon: 'text-teal' },
  error: { border: 'border-rose-cosmos/30', bg: 'bg-rose-cosmos/8', icon: 'text-rose-cosmos' },
  info: { border: 'border-aurora/30', bg: 'bg-aurora/8', icon: 'text-aurora-light' },
  warning: { border: 'border-sol/30', bg: 'bg-sol/8', icon: 'text-sol' },
};

function ToastItem({ toast, onDismiss }: { toast: ToastType; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.type];
  const colors = COLORS[toast.type];

  useEffect(() => {
    const dur = toast.duration ?? 4000;
    if (dur > 0) {
      const timer = setTimeout(() => onDismiss(toast.id), dur);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        'flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-card backdrop-blur-xl min-w-[300px] max-w-md',
        colors.border, colors.bg
      )}
      style={{ background: 'rgba(10,14,26,0.9)' }}
    >
      <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', colors.icon)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-starlight">{toast.title}</p>
        {toast.message && <p className="text-xs text-starlight-muted mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => onDismiss(toast.id)} className="p-0.5 rounded-lg hover:bg-starlight/5 transition-colors flex-shrink-0">
        <X className="w-3.5 h-3.5 text-starlight-muted" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const handleDismiss = useCallback((id: string) => removeToast(id), [removeToast]);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={handleDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function toast(type: ToastType['type'], title: string, message?: string, duration?: number) {
  return useToastStore.getState().addToast({ type, title, message, duration });
}
