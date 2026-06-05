import { motion } from 'framer-motion';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

interface Props {
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mx-3 mt-2 mb-1"
      role="alert"
    >
      <div className="flex items-start gap-3 bg-rose-cosmos/10 border border-rose-cosmos/25 rounded-2xl px-4 py-3 text-sm">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-full bg-rose-cosmos/15 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-cosmos" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-rose-200 leading-relaxed text-xs">{message}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-1.5 rounded-lg hover:bg-rose-cosmos/15 transition-colors text-rose-300/70 hover:text-rose-200"
              aria-label="Retry"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-rose-cosmos/15 transition-colors text-rose-300/70 hover:text-rose-200"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
