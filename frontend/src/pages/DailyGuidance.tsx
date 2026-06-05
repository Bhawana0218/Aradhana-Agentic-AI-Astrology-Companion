import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sun, Briefcase, Heart, Activity, Hash, Palette, Quote, Moon, Star } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useChatStore } from '../store/chatStore';
import { getDailyGuidance } from '../lib/api';
import type { DailyGuidance as DailyGuidanceType, GuidanceSection } from '../types';
import clsx from 'clsx';
import { useTranslation } from '../i18n';

const STARS = 5;

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: STARS }).map((_, i) => (
        <Star key={i} className={clsx('w-3 h-3', i < value ? 'text-sol fill-sol' : 'text-starlight-muted/20')} />
      ))}
    </div>
  );
}

function GuidanceCard({ section, icon, label, color }: { section: GuidanceSection; icon: React.ReactNode; label: string; color: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass-card-premium rounded-2xl p-5 border border-starlight/6 hover:border-aurora/20 transition-all duration-300 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border', color)}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-starlight">{label}</h3>
            <RatingStars value={section.rating} />
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Sparkles className="w-4 h-4 text-aurora/40" />
        </motion.div>
      </div>
      <p className="text-xs text-starlight-muted leading-relaxed">{section.summary}</p>
      {expanded && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs text-starlight-dim/80 leading-relaxed mt-3 pt-3 border-t border-starlight/6"
        >
          {section.detail}
        </motion.p>
      )}
    </motion.div>
  );
}

export function DailyGuidance() {
  const { t } = useTranslation();
  const { birthDetails } = useChatStore();
  const [guidance, setGuidance] = useState<DailyGuidanceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), []);

  const fetchGuidance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailyGuidance({ date: new Date().toISOString().split('T')[0] });
      setGuidance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dailyGuidance.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGuidance(); }, [fetchGuidance]);

  if (!birthDetails?.date) {
    return (
      <PageTransition>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl text-starlight tracking-wider mb-2">{t('dailyGuidance.title')}</h1>
            <p className="text-sm text-starlight-muted">{t('dailyGuidance.subtitle')}</p>
          </div>
          <EmptyState
            icon={<Sun className="w-7 h-7 text-sol-light" />}
            title={t('dailyGuidance.noChartTitle')}
            description={t('dailyGuidance.noChartDesc')}
            action={
              <a href="/chat" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-sm">
                <Sparkles className="w-4 h-4" />
                {t('dailyGuidance.goToChat')}
              </a>
            }
          />
        </div>
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl text-starlight tracking-wider mb-2">{t('dailyGuidance.title')}</h1>
          </div>
          <LoadingSkeleton variant="card" count={4} />
        </div>
      </PageTransition>
    );
  }

  if (error || !guidance) {
    return (
      <PageTransition>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <EmptyState
            icon={<Sparkles className="w-7 h-7 text-aurora-light/60" />}
            title={t('dailyGuidance.errorTitle')}
            description={error || t('dailyGuidance.errorDesc')}
            action={
              <button onClick={fetchGuidance} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                {t('dailyGuidance.retry')}
              </button>
            }
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sol/20 to-aurora/10 border border-sol/25 flex items-center justify-center mx-auto mb-3"
          >
            <Sun className="w-6 h-6 text-sol-light" />
          </motion.div>
          <h1 className="font-display text-2xl text-starlight tracking-wider mb-1">{t('dailyGuidance.yourTitle')}</h1>
          <p className="text-sm text-starlight-muted">{today}</p>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-xs text-starlight-dim">
            <Sun className="w-4 h-4 text-sol" />
            <span>{t('dailyGuidance.sunIn')} <strong className="text-starlight">{guidance.sun_sign}</strong></span>
          </div>
          <div className="w-px h-4 bg-starlight/10" />
          <div className="flex items-center gap-2 text-xs text-starlight-dim">
            <Moon className="w-4 h-4 text-starlight-dim" />
            <span>{t('dailyGuidance.moonIn')} <strong className="text-starlight">{guidance.moon_sign}</strong></span>
          </div>
          {guidance.moon_phase && (
            <>
              <div className="w-px h-4 bg-starlight/10" />
              <div className="flex items-center gap-2 text-xs text-starlight-dim">
                <Moon className="w-4 h-4 text-starlight-muted" />
                <span>{guidance.moon_phase.phase} ({guidance.moon_phase.illumination_pct}%)</span>
              </div>
            </>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <GuidanceCard section={guidance.overall} icon={<Sparkles className="w-4 h-4 text-aurora-light" />} label={t('dailyGuidance.overall')} color="border-aurora/25 bg-aurora/8" />
          <GuidanceCard section={guidance.career} icon={<Briefcase className="w-4 h-4 text-sol-light" />} label={t('dailyGuidance.career')} color="border-sol/25 bg-sol/8" />
          <GuidanceCard section={guidance.relationships} icon={<Heart className="w-4 h-4 text-rose-cosmos" />} label={t('dailyGuidance.relationships')} color="border-rose-cosmos/25 bg-rose-cosmos/8" />
          <GuidanceCard section={guidance.wellness} icon={<Activity className="w-4 h-4 text-teal" />} label={t('dailyGuidance.wellness')} color="border-teal/25 bg-teal/8" />
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-premium rounded-2xl p-5 border border-starlight/6 text-center">
            <Hash className="w-5 h-5 text-aurora-light mx-auto mb-2" />
            <p className="text-[10px] text-starlight-muted uppercase tracking-widest mb-1">{t('dailyGuidance.luckyNumber')}</p>
            <p className="font-display text-3xl text-starlight">{guidance.lucky_number}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card-premium rounded-2xl p-5 border border-starlight/6 text-center">
            <Palette className="w-5 h-5 text-sol-light mx-auto mb-2" />
            <p className="text-[10px] text-starlight-muted uppercase tracking-widest mb-1">{t('dailyGuidance.luckyColor')}</p>
            <p className="font-display text-lg text-starlight">{guidance.lucky_color}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card-premium rounded-2xl p-5 border border-starlight/6 text-center">
            <Quote className="w-5 h-5 text-teal mx-auto mb-2" />
            <p className="text-[10px] text-starlight-muted uppercase tracking-widest mb-1">{t('dailyGuidance.mantra')}</p>
            <p className="font-serif text-sm italic text-starlight-dim">{guidance.mantra}</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card-premium rounded-2xl p-6 border border-aurora/15 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurora/40 to-transparent" />
          <Quote className="w-6 h-6 text-aurora-light/30 mb-3" />
          <p className="font-serif text-lg italic text-starlight leading-relaxed text-center">&ldquo;{guidance.affirmation}&rdquo;</p>
          <p className="text-center text-[10px] text-aurora/50 mt-3 uppercase tracking-widest">{t('dailyGuidance.affirmation')}</p>
        </motion.div>

        <div className="text-center mt-8">
          <button onClick={fetchGuidance} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-xs">
            <Sparkles className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
            {loading ? t('dailyGuidance.refreshing') : t('dailyGuidance.refresh')}
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
