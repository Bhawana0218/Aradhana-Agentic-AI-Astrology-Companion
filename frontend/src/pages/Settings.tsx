import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Sparkles, Bell, Shield, Trash2, Palette, Bot, Globe, Brain, Heart, Zap, Eye } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { useChatStore } from '../store/chatStore';
import { toast } from '../components/Toast';
import type { Theme, AIPersona } from '../types';
import clsx from 'clsx';
import { useTranslation } from '../i18n';

export function Settings() {
  const { t } = useTranslation();
  const { language, setLanguage } = useChatStore();
  const [theme, setTheme] = useState<Theme>('cosmic');
  const [persona, setPersona] = useState<AIPersona>('wise');
  const [notifPrefs, setNotifPrefs] = useState({
    weekly: true, retrograde: true, eclipse: false, newmoon: true,
  });

  const THEMES: { id: Theme; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'cosmic', label: t('settings.themeCosmic'), icon: <Sparkles className="w-4 h-4" />, desc: t('settings.themeCosmicDesc') },
    { id: 'mystic', label: t('settings.themeMystic'), icon: <Moon className="w-4 h-4" />, desc: t('settings.themeMysticDesc') },
    { id: 'celestial', label: t('settings.themeCelestial'), icon: <Sun className="w-4 h-4" />, desc: t('settings.themeCelestialDesc') },
  ];

  const PERSONAS: { id: AIPersona; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'wise', label: t('settings.personaWise'), icon: <Brain className="w-4 h-4" />, desc: t('settings.personaWiseDesc') },
    { id: 'poetic', label: t('settings.personaPoetic'), icon: <Heart className="w-4 h-4" />, desc: t('settings.personaPoeticDesc') },
    { id: 'direct', label: t('settings.personaDirect'), icon: <Zap className="w-4 h-4" />, desc: t('settings.personaDirectDesc') },
    { id: 'nurturing', label: t('settings.personaNurturing'), icon: <Sparkles className="w-4 h-4" />, desc: t('settings.personaNurturingDesc') },
  ];

  const NOTIFICATIONS = [
    { id: 'weekly', label: t('settings.notifWeekly'), desc: t('settings.notifWeeklyDesc') },
    { id: 'retrograde', label: t('settings.notifRetrograde'), desc: t('settings.notifRetrogradeDesc') },
    { id: 'eclipse', label: t('settings.notifEclipse'), desc: t('settings.notifEclipseDesc') },
    { id: 'newmoon', label: t('settings.notifNewMoon'), desc: t('settings.notifNewMoonDesc') },
  ];

  const handleClearHistory = () => {
    if (window.confirm(t('settings.confirmClear'))) {
      useChatStore.getState().clearMessages();
      toast('success', t('settings.cleared'));
    }
  };

  const handleNotifToggle = (id: string) => {
    setNotifPrefs((prev) => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
    toast('success', t('settings.notifUpdated'));
  };

  return (
    <PageTransition>
      <div className="px-4 py-6 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl text-starlight tracking-wider mb-1">{t('settings.title')}</h1>
          <p className="text-sm text-starlight-muted">{t('settings.subtitle')}</p>
        </div>

        {/* Theme */}
        <div className="glass-card-premium rounded-2xl p-5 border border-starlight/6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-aurora-light" />
            <h2 className="font-display text-sm text-starlight tracking-wide">{t('settings.theme')}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => { setTheme(th.id); toast('success', t('settings.themeSet')); }}
                className={clsx(
                  'p-4 rounded-xl border text-center transition-all duration-200',
                  theme === th.id
                    ? 'bg-aurora/10 border-aurora/30 text-aurora-light'
                    : 'border-starlight/8 text-starlight-muted hover:border-starlight/20 hover:text-starlight'
                )}
              >
                <div className="flex justify-center mb-2">{th.icon}</div>
                <p className="text-xs font-medium">{th.label}</p>
                <p className="text-[9px] mt-0.5 opacity-60">{th.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* AI Personality */}
        <div className="glass-card-premium rounded-2xl p-5 border border-starlight/6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-4 h-4 text-aurora-light" />
            <h2 className="font-display text-sm text-starlight tracking-wide">{t('settings.aiPersona')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setPersona(p.id); toast('success', t('settings.personaSet')); }}
                className={clsx(
                  'p-3 rounded-xl border text-center transition-all duration-200',
                  persona === p.id
                    ? 'bg-aurora/10 border-aurora/30 text-aurora-light'
                    : 'border-starlight/8 text-starlight-muted hover:border-starlight/20 hover:text-starlight'
                )}
              >
                <div className="flex justify-center mb-1.5">{p.icon}</div>
                <p className="text-[11px] font-medium">{p.label}</p>
                <p className="text-[9px] mt-0.5 opacity-60">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="glass-card-premium rounded-2xl p-5 border border-starlight/6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-aurora-light" />
            <h2 className="font-display text-sm text-starlight tracking-wide">{t('settings.language')}</h2>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            className="w-full bg-nebula/60 border border-starlight/8 rounded-xl px-4 py-2.5 text-sm text-starlight focus:outline-none focus:border-aurora/30"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="gu">ગુજરાતી (Gujarati)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="ml">മലയാളം (Malayalam)</option>
            <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="glass-card-premium rounded-2xl p-5 border border-starlight/6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-aurora-light" />
            <h2 className="font-display text-sm text-starlight tracking-wide">{t('settings.notifications')}</h2>
          </div>
          <div className="space-y-3">
            {NOTIFICATIONS.map((n) => (
              <div key={n.id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-starlight">{n.label}</p>
                  <p className="text-[10px] text-starlight-muted">{n.desc}</p>
                </div>
                <button
                  onClick={() => handleNotifToggle(n.id)}
                  className={clsx(
                    'w-10 h-6 rounded-full border transition-all duration-200 relative',
                    notifPrefs[n.id as keyof typeof notifPrefs] ? 'bg-aurora border-aurora/50' : 'bg-nebula-light border-starlight/10'
                  )}
                >
                  <motion.div
                    animate={{ x: notifPrefs[n.id as keyof typeof notifPrefs] ? 16 : 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="w-4 h-4 rounded-full bg-white absolute top-1"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="glass-card-premium rounded-2xl p-5 border border-starlight/6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-aurora-light" />
            <h2 className="font-display text-sm text-starlight tracking-wide">{t('settings.privacy')}</h2>
          </div>
          <p className="text-xs text-starlight-muted mb-4">
            {t('settings.privacyText')}
          </p>
          <div className="flex items-center gap-2 text-xs text-starlight-dim">
            <Eye className="w-3.5 h-3.5 text-teal" />
            <span>{t('settings.privacyStorage')}</span>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card-premium rounded-2xl p-5 border border-rose-cosmos/20 mb-4">
          <h2 className="font-display text-sm text-rose-cosmos tracking-wide mb-2">{t('settings.dangerZone')}</h2>
          <p className="text-xs text-starlight-muted mb-4">{t('settings.dangerZoneText')}</p>
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-rose-cosmos bg-rose-cosmos/10 border border-rose-cosmos/25 hover:bg-rose-cosmos/15 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('settings.clearHistory')}
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
