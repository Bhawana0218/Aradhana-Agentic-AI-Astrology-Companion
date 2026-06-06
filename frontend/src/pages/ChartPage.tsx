import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useChart } from '../hooks/useAstroData';
import { useTranslation } from '../i18n';
import { BirthChartWheel } from '../components/BirthChartWheel';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Sparkles, AlertTriangle, Compass, RefreshCw, MapPin, Calendar, Clock, User } from 'lucide-react';

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};
const PLANET_COLORS: Record<string, string> = {
  Sun: '#f4a236', Moon: '#e8d5a3', Mercury: '#9d93f8',
  Venus: '#f9a8d4', Mars: '#fb7185', Jupiter: '#fbbf24',
  Saturn: '#d4a373', Uranus: '#7dd3fc', Neptune: '#818cf8', Pluto: '#c084fc',
};

export function ChartPage() {
  const { t } = useTranslation();
  const { birthDetails, setShowBirthForm } = useChatStore();
  const { chart, loading, error, refetch } = useChart();
  const [activePlanet, setActivePlanet] = useState<string | null>(null);

  if (!birthDetails?.date || !birthDetails?.place) {
    return (
      <div className="px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Compass className="w-16 h-16 text-aurora/30 mx-auto mb-4" />
          <h2 className="font-display text-xl text-starlight tracking-wide mb-2">{t('chart.noTitle')}</h2>
          <p className="text-sm text-starlight-muted max-w-md mx-auto mb-6 leading-relaxed">
            {t('chart.noDesc')}
          </p>
          <Link
            to="/chat"
            onClick={() => setShowBirthForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-sm"
          >
            <Sparkles className="w-4 h-4" />
            {t('chart.cta')}
          </Link>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-4 py-16 max-w-3xl mx-auto">
        <LoadingSkeleton variant="chart" />
      </div>
    );
  }

  if (error || !chart) {
    return (
      <div className="px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <AlertTriangle className="w-10 h-10 text-rose-cosmos mx-auto mb-4" />
          <p className="text-sm text-rose-cosmos/80 mb-6">{error || t('chart.errorDesc')}</p>
          <button onClick={refetch} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl text-starlight tracking-wider mb-2">{t('chart.title')}</h1>
          <div className="flex items-center justify-center gap-4 flex-wrap text-xs text-starlight-muted">
            {birthDetails.name && (
              <span className="inline-flex items-center gap-1">
                <User className="w-3 h-3 text-aurora/60" /> {birthDetails.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-aurora/60" /> {birthDetails.place}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-aurora/60" /> {birthDetails.date}
            </span>
            {birthDetails.time && birthDetails.time !== '12:00' && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-aurora/60" /> {birthDetails.time}
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-4 border border-starlight/6">
              <BirthChartWheel
                planets={chart.planets}
                houses={chart.houses}
                ascendant={chart.ascendant}
                midheaven={chart.midheaven}
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-2xl p-4 border border-starlight/6">
              <h3 className="font-display text-sm text-starlight tracking-wide mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-aurora-light" />
                {t('chart.planets')}
              </h3>
              <div className="space-y-1.5">
                {chart.planets.map((p) => (
                  <motion.div
                    key={p.name}
                    whileHover={{ x: 4 }}
                    onMouseEnter={() => setActivePlanet(p.name)}
                    onMouseLeave={() => setActivePlanet(null)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      activePlanet === p.name
                        ? 'bg-aurora/10 border border-aurora/25'
                        : 'border border-transparent hover:bg-nebula-light'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: `${PLANET_COLORS[p.name] || '#e8d5a3'}20`, color: PLANET_COLORS[p.name] || '#e8d5a3', borderColor: `${PLANET_COLORS[p.name] || '#e8d5a3'}40`, borderWidth: 1 }}
                    >
                      {p.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-starlight">{p.name}</span>
                        {p.retrograde && <span className="text-[9px] text-rose-cosmos">℞</span>}
                      </div>
                      <div className="text-[10px] text-starlight-dim">{p.sign} &middot; {p.degree}°</div>
                    </div>
                    <span className="text-lg font-serif" style={{ color: PLANET_COLORS[p.name] || '#e8d5a3' }}>
                      {PLANET_SYMBOLS[p.name] || p.name[0]}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-starlight/6">
              <h3 className="font-display text-sm text-starlight tracking-wide mb-3">{t('chart.houses')}</h3>
              <div className="grid grid-cols-2 gap-1">
                {chart.houses.map((h) => (
                  <div key={h.house} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-nebula-light transition-colors">
                    <span className="text-[10px] font-medium text-aurora/60 w-4">{h.house}</span>
                    <span className="text-[10px] text-starlight-dim">{h.sign}</span>
                    <span className="text-[9px] text-starlight-muted">{h.degree}°</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-starlight/6">
              <h3 className="font-display text-sm text-starlight tracking-wide mb-3">{t('chart.keyPoints')}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-sol font-medium">{t('chart.ascendant')}</span>
                  <span className="text-starlight-dim">{chart.ascendant.sign} {chart.ascendant.degree}°</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-aurora-light font-medium">{t('chart.midheaven')}</span>
                  <span className="text-starlight-dim">{chart.midheaven.sign} {chart.midheaven.degree}°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
