import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useTransits } from '../hooks/useAstroData';
import { useTranslation } from '../i18n';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Moon, Globe, Zap, Sparkles, AlertTriangle, RefreshCw, Calendar } from 'lucide-react';

const PLANET_ICONS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};
const PLANET_COLORS: Record<string, string> = {
  Sun: '#f4a236', Moon: '#e8d5a3', Mercury: '#9d93f8',
  Venus: '#f9a8d4', Mars: '#fb7185', Jupiter: '#fbbf24',
  Saturn: '#d4a373', Uranus: '#7dd3fc', Neptune: '#818cf8', Pluto: '#c084fc',
};

export function TransitsPage() {
  const { t } = useTranslation();
  const { birthDetails } = useChatStore();
  const { transits, loading, error, refetch } = useTransits();
  const [selected, setSelected] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (loading) {
    return (
      <div className="px-4 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl text-starlight tracking-wider mb-2">{t('transits.title')}</h1>
          <p className="text-sm text-starlight-muted">{today}</p>
        </div>
        <div className="space-y-4">
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="list" count={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <AlertTriangle className="w-10 h-10 text-rose-cosmos mx-auto mb-4" />
          <p className="text-sm text-rose-cosmos/80 mb-6">{error}</p>
          <button onClick={refetch} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  const transitData = transits as {
    transiting_planets?: Array<{ name: string; sign: string; degree: number; longitude?: number }>;
    moon_phase?: { phase: string; illumination_pct: number };
    aspects_to_natal?: Array<{ transiting_planet: string; natal_planet: string; aspect: string; orb: number }>;
    date?: string;
  } | null;

  const planets = transitData?.transiting_planets ?? [];
  const moonPhase = transitData?.moon_phase;
  const aspects = transitData?.aspects_to_natal ?? [];

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl text-starlight tracking-wider mb-2">{t('transits.title')}</h1>
          <p className="text-sm text-starlight-muted flex items-center justify-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-aurora/60" /> {today}
          </p>
        </div>

        {moonPhase && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5 border border-aurora/15 mb-6 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-1">
              <Moon className="w-6 h-6 text-starlight-dim" />
              <span className="font-display text-xl text-starlight">{moonPhase.phase}</span>
            </div>
            <p className="text-xs text-starlight-muted">{moonPhase.illumination_pct}% illuminated</p>
          </motion.div>
        )}

        <div className="glass-card rounded-2xl border border-starlight/6 overflow-hidden">
          <div className="px-4 py-3 border-b border-starlight/6 bg-space-mid/20 flex items-center gap-2">
            <Zap className="w-4 h-4 text-aurora-light" />
            <h3 className="font-display text-sm text-starlight tracking-wide">{t('transits.planets')}</h3>
            {aspects.length > 0 && (
              <span className="text-[9px] text-aurora/60 ml-auto">
                {aspects.length} aspect{aspects.length > 1 ? 's' : ''} to your chart
              </span>
            )}
          </div>

          <div className="divide-y divide-starlight/6">
            {planets.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-starlight-muted">
                <Globe className="w-8 h-8 mx-auto mb-2 text-aurora/30" />
                <p>No transit data available</p>
              </div>
            ) : (
              planets.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(selected === p.name ? null : p.name)}
                  className={`px-4 py-3 flex items-center gap-4 cursor-pointer transition-all duration-200 ${
                    selected === p.name ? 'bg-aurora/8' : 'hover:bg-nebula-light'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${PLANET_COLORS[p.name] || '#e8d5a3'}15`, borderColor: `${PLANET_COLORS[p.name] || '#e8d5a3'}30`, borderWidth: 1 }}
                  >
                    <span style={{ color: PLANET_COLORS[p.name] || '#e8d5a3' }}>{PLANET_ICONS[p.name] || p.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-starlight">{p.name}</span>
                    <div className="text-xs text-starlight-dim">{p.sign} &middot; {p.degree}°</div>
                  </div>
                  <div className="text-xs text-starlight-muted">
                    {(() => {
                      const aspect = aspects.find(a => a.transiting_planet === p.name);
                      return aspect ? `${aspect.aspect} ${aspect.natal_planet}` : '';
                    })()}
                  </div>
                  <motion.div animate={{ rotate: selected === p.name ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <Sparkles className="w-3.5 h-3.5 text-aurora/40" />
                  </motion.div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {!birthDetails?.date && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 mt-6 p-4 rounded-2xl bg-sol/5 border border-sol/15"
          >
            <AlertTriangle className="w-4 h-4 text-sol flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-starlight-muted leading-relaxed mb-2">
                {t('transits.noChart')}
              </p>
              <Link to="/chat" className="text-xs text-aurora hover:text-aurora-light underline">
                {t('transits.goToChat')}
              </Link>
            </div>
          </motion.div>
        )}

        <p className="text-[10px] text-starlight-muted/40 text-center mt-6">
          {t('transits.disclaimer')}
        </p>
      </motion.div>
    </div>
  );
}
