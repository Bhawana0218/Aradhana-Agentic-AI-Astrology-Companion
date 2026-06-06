import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { CosmicBackground } from './CosmicBackground';
import { useTranslation } from '../i18n';

export function Layout() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh bg-space text-starlight overflow-hidden relative">
      <CosmicBackground />
      <div className="relative z-10 flex flex-col min-h-dvh">
        <Navbar />
        <main className="flex-1">
          <AnimatePresence>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="text-center text-[10px] text-starlight-muted/30 py-4 select-none border-t border-starlight/5">
          {t('layout.footer')}
        </footer>
      </div>
    </div>
  );
}
