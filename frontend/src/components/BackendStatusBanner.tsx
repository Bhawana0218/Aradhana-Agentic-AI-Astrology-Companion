import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, WifiOff } from 'lucide-react';
import { useBackendStatus } from '../lib/useBackendStatus';

export function BackendStatusBanner() {
  const status = useBackendStatus();

  return (
    <AnimatePresence>
      {status === 'offline' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-cosmos/10 border-b border-rose-cosmos/20">
            <WifiOff className="w-3.5 h-3.5 text-rose-cosmos flex-shrink-0" />
            <span className="text-xs text-rose-cosmos/90">
              Cannot connect to backend server. Start it with{' '}
              <code className="px-1 py-0.5 rounded bg-rose-cosmos/10 text-[10px] font-mono">
                cd backend &amp;&amp; python main.py
              </code>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
