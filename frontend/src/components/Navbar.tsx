import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, LayoutDashboard, Compass, Sun, Moon, BookOpen, History, User, Settings, Calendar, GraduationCap, Menu, X, ChevronDown, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../i18n';
import clsx from 'clsx';

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/chat', label: t('nav.chat'), icon: MessageCircle },
    { path: '/chart', label: t('nav.chart'), icon: Compass },
    { path: '/daily-guidance', label: t('nav.dailyGuidance'), icon: Sun },
    { path: '/transits', label: t('nav.transits'), icon: Moon },
    { path: '/journal', label: t('nav.journal'), icon: BookOpen },
    { path: '/learning', label: t('nav.learningHub'), icon: GraduationCap },
    { path: '/history', label: t('nav.history'), icon: History },
    { path: '/cosmic-events', label: t('nav.cosmicEvents'), icon: Calendar },
    { path: '/profile', label: t('nav.profile'), icon: User },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
    { path: '/dev', label: t('nav.dev'), icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-space-mid/80 backdrop-blur-xl border-b border-starlight/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full bg-aurora-glow border border-aurora/30 flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-aurora-light" />
            </motion.div>
            <div>
              <h1 className="font-display text-lg text-starlight tracking-widest leading-none group-hover:text-aurora-light transition-colors">
                ARADHANA
              </h1>
              <p className="text-[8px] tracking-[0.25em] text-aurora/60 uppercase leading-none mt-0.5">
                Celestial AI Guide
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.slice(0, 6).map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'text-aurora-light bg-aurora/10 border border-aurora/20'
                      : 'text-starlight-muted hover:text-starlight hover:bg-nebula-light border border-transparent'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-aurora rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            <div className="group relative">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-starlight-muted hover:text-starlight hover:bg-nebula-light border border-transparent transition-all duration-200">
                <span>{t('nav.more')}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                <div className="glass-card-premium rounded-2xl border border-starlight/6 p-2 shadow-card min-w-[180px]">
                  {NAV_ITEMS.slice(6).map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
                          isActive
                            ? 'text-aurora-light bg-aurora/10'
                            : 'text-starlight-muted hover:text-starlight hover:bg-nebula-light'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="ml-2 pl-2 border-l border-starlight/8">
              <LanguageSelector />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-nebula-light border border-transparent hover:border-aurora/15 transition-all"
            aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            {mobileOpen ? <X className="w-5 h-5 text-starlight" /> : <Menu className="w-5 h-5 text-starlight" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-starlight/6"
          >
            <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'text-aurora-light bg-aurora/10 border border-aurora/20'
                        : 'text-starlight-muted hover:text-starlight hover:bg-nebula-light border border-transparent'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-starlight/6">
                <LanguageSelector />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
