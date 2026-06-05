import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Clock, ChevronDown } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { TabBar } from '../components/TabBar';
import { EmptyState } from '../components/EmptyState';
import type { CosmicEvent, EventType } from '../types';
import clsx from 'clsx';
import { useTranslation } from '../i18n';

const MOCK_EVENTS: CosmicEvent[] = [
  { id: '1', type: 'moon_phase', title: 'New Moon in Gemini', description: 'A powerful new moon for setting intentions around communication, learning, and self-expression. Gemini new moons invite us to explore new ideas and start conversations.', start_date: '2026-06-15T06:30:00', significance: 4, planets_involved: ['Moon', 'Sun'], icon: '🌑' },
  { id: '2', type: 'retrograde', title: 'Mercury Retrograde in Virgo', description: 'Mercury stations retrograde in detail-oriented Virgo. Review your daily routines, health habits, and work processes. Avoid signing contracts during this period.', start_date: '2026-07-18T00:00:00', end_date: '2026-08-11T00:00:00', significance: 4, planets_involved: ['Mercury'], icon: '☿' },
  { id: '3', type: 'eclipse', title: 'Solar Eclipse in Cancer', description: 'A powerful solar eclipse in the sign of Cancer, activating themes of home, family, and emotional security. New beginnings around domestic matters are highlighted.', start_date: '2026-07-02T12:00:00', significance: 5, planets_involved: ['Sun', 'Moon'], icon: '☀' },
  { id: '4', type: 'retrograde', title: 'Venus Retrograde in Libra', description: 'Venus retrogrades through Libra, asking us to reevaluate our relationships, values, and what we find beautiful. A time for healing old relationship wounds.', start_date: '2026-10-05T00:00:00', end_date: '2026-11-15T00:00:00', significance: 3, planets_involved: ['Venus'], icon: '♀' },
  { id: '5', type: 'moon_phase', title: 'Full Moon in Capricorn', description: 'The full moon in ambitious Capricorn illuminates our career path and long-term goals. Release what no longer serves your highest ambitions.', start_date: '2026-06-29T18:00:00', significance: 4, planets_involved: ['Moon', 'Sun'], icon: '🌕' },
  { id: '6', type: 'planetary_alignment', title: 'Jupiter-Saturn Sextile', description: 'A harmonious aspect between Jupiter and Saturn, blending expansion with discipline. An excellent time for practical growth and building sustainable structures.', start_date: '2026-07-22T00:00:00', significance: 3, planets_involved: ['Jupiter', 'Saturn'], icon: '♃' },
  { id: '7', type: 'solstice', title: 'Summer Solstice', description: 'The Sun enters Cancer, marking the longest day of the year in the Northern Hemisphere. A time of light, celebration, and honoring the Sun\'s peak power.', start_date: '2026-06-21T10:00:00', significance: 4, planets_involved: ['Sun'], icon: '☀' },
  { id: '8', type: 'eclipse', title: 'Lunar Eclipse in Capricorn', description: 'A powerful lunar eclipse closing a chapter in your career or public life. Major endings and completions are highlighted. Release old structures that no longer support you.', start_date: '2026-07-16T20:00:00', significance: 5, planets_involved: ['Moon', 'Sun', 'Saturn'], icon: '🌙' },
  { id: '9', type: 'retrograde', title: 'Saturn Retrograde in Pisces', description: 'Saturn retrogrades through Pisces, asking us to review our spiritual boundaries and creative structures. A time for inner work and karmic reflection.', start_date: '2026-08-25T00:00:00', end_date: '2027-01-10T00:00:00', significance: 3, planets_involved: ['Saturn'], icon: '♄' },
  { id: '10', type: 'planetary_alignment', title: 'Mars-Pluto Conjunction', description: 'Intense energies as Mars meets Pluto in Capricorn. Power struggles and deep motivations come to the surface. Channel this energy into focused transformation.', start_date: '2026-09-10T00:00:00', significance: 4, planets_involved: ['Mars', 'Pluto'], icon: '♂' },
];

const TYPE_ICONS: Record<EventType, string> = {
  retrograde: '↩', eclipse: '⭐', moon_phase: '🌙', planetary_alignment: '✦', solstice: '☀', equinox: '⚖', meteor_shower: '☄',
};

const TYPE_COLORS: Record<EventType, string> = {
  retrograde: 'text-rose-cosmos border-rose-cosmos/30 bg-rose-cosmos/8',
  eclipse: 'text-aurora-light border-aurora/30 bg-aurora/8',
  moon_phase: 'text-starlight-dim border-starlight-dim/20 bg-starlight/5',
  planetary_alignment: 'text-sol-light border-sol/30 bg-sol/8',
  solstice: 'text-sol border-sol/30 bg-sol/8',
  equinox: 'text-teal border-teal/30 bg-teal/8',
  meteor_shower: 'text-mystic border-mystic/30 bg-mystic/8',
};

const SIGNIFICANCE_COLORS: Record<number, string> = {
  5: 'bg-aurora text-white', 4: 'bg-aurora/80 text-white', 3: 'bg-sol/80 text-space', 2: 'bg-teal/60 text-space', 1: 'bg-starlight/20 text-starlight-muted',
};

function getMonthGroup(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' });
}

export function CosmicEvents() {
  const { t } = useTranslation();
  const [category, setCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const CATEGORIES = [
    { id: 'all', label: t('cosmicEvents.tabAll') },
    { id: 'retrograde', label: t('cosmicEvents.tabRetrogrades') },
    { id: 'eclipse', label: t('cosmicEvents.tabEclipses') },
    { id: 'moon_phase', label: t('cosmicEvents.tabMoonPhases') },
    { id: 'planetary_alignment', label: t('cosmicEvents.tabAlignments') },
    { id: 'solstice', label: t('cosmicEvents.tabSeasons') },
  ];

  const grouped = useMemo(() => {
    let filtered = MOCK_EVENTS;
    if (category !== 'all') filtered = filtered.filter((e) => e.type === category);
    filtered.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    const groups: Record<string, CosmicEvent[]> = {};
    filtered.forEach((event) => {
      const month = getMonthGroup(event.start_date);
      if (!groups[month]) groups[month] = [];
      groups[month].push(event);
    });
    return groups;
  }, [category]);

  const monthKeys = Object.keys(grouped);

  if (MOCK_EVENTS.length === 0) {
    return (
      <PageTransition>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <EmptyState
            icon={<Sparkles className="w-7 h-7 text-aurora-light/60" />}
            title={t('cosmicEvents.emptyTitle')}
            description={t('cosmicEvents.emptyDesc')}
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aurora/20 to-mystic/10 border border-aurora/25 flex items-center justify-center mx-auto mb-3"
          >
            <Sparkles className="w-6 h-6 text-aurora-light" />
          </motion.div>
          <h1 className="font-display text-2xl text-starlight tracking-wider mb-1">{t('cosmicEvents.title')}</h1>
          <p className="text-sm text-starlight-muted">{t('cosmicEvents.subtitle')}</p>
        </div>

        <TabBar tabs={CATEGORIES.map((c) => ({ id: c.id, label: c.label, count: c.id === 'all' ? MOCK_EVENTS.length : MOCK_EVENTS.filter((e) => e.type === c.id).length }))} active={category} onChange={setCategory} className="mb-6" />

        {monthKeys.length === 0 ? (
          <p className="text-center text-sm text-starlight-muted py-8">{t('cosmicEvents.emptyCategory')}</p>
        ) : (
          <div className="space-y-8">
            {monthKeys.map((month) => (
              <div key={month}>
                <h2 className="font-display text-sm text-starlight-muted tracking-wider mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-aurora/50" />
                  {month}
                </h2>
                <div className="space-y-2">
                  {grouped[month].map((event, i) => {
                    const isExpanded = expandedId === event.id;
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={clsx(
                          'glass-card-premium rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden',
                          isExpanded ? 'border-aurora/30' : 'border-starlight/6 hover:border-aurora/15'
                        )}
                      >
                        <div className="p-4 flex items-start gap-4" onClick={() => setExpandedId(isExpanded ? null : event.id)}>
                          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-lg border flex-shrink-0', TYPE_COLORS[event.type])}>
                            {event.icon || TYPE_ICONS[event.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-starlight">{event.title}</h3>
                              <span className={clsx('text-[9px] px-1.5 py-0.5 rounded-full font-medium', SIGNIFICANCE_COLORS[event.significance])}>
                                {event.significance}/5
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-starlight-dim flex items-center gap-1">
                                <Clock className="w-3 h-3 text-starlight-muted" />
                                {formatEventDate(event.start_date)}
                              </span>
                              {event.end_date && (
                                <span className="text-[10px] text-starlight-dim">
                                  → {formatEventDate(event.end_date)}
                                </span>
                              )}
                            </div>
                            {event.planets_involved && (
                              <div className="flex gap-1 mt-1.5">
                                {event.planets_involved.map((p) => (
                                  <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-full bg-aurora/8 text-aurora-dim border border-aurora/10">{p}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-4 h-4 text-starlight-muted" />
                          </motion.div>
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="px-4 pb-4 pt-0 border-t border-starlight/6">
                                <p className="text-xs text-starlight-dim/80 leading-relaxed mt-3">{event.description}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-starlight-muted/40 text-center mt-8">
          {t('cosmicEvents.disclaimer')}
        </p>
      </div>
    </PageTransition>
  );
}
