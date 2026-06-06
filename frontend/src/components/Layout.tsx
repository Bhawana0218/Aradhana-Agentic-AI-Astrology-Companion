import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { CosmicBackground } from './CosmicBackground';
import { BackendStatusBanner } from './BackendStatusBanner';
import { useTranslation } from '../i18n';

export function Layout() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh bg-space text-starlight overflow-hidden relative">
      <CosmicBackground />
      <div className="relative z-10 flex flex-col min-h-dvh">
        <Navbar />
        <BackendStatusBanner />
        <main className="flex-1">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
        <footer className="text-center text-[10px] text-starlight-muted/30 py-4 select-none border-t border-starlight/5">
          {t('layout.footer')}
        </footer>
      </div>
    </div>
  );
}
