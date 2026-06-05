import { motion } from 'framer-motion';
import { Sparkles, Star, Moon, Sun } from 'lucide-react';
import type { SuggestedPrompt } from '../types';
import { useTranslation } from '../i18n';

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

interface Props {
  onPromptClick: (text: string) => void;
}

export function WelcomeScreen({ onPromptClick }: Props) {
  const { t } = useTranslation();

  const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
    { icon: '✨', text: t('welcomeScreen.promptChartTitle'), category: 'chart' },
    { icon: '🌙', text: t('welcomeScreen.promptTodayTitle'), category: 'transit' },
    { icon: '♄', text: t('welcomeScreen.promptSaturnTitle'), category: 'question' },
    { icon: '💫', text: t('welcomeScreen.promptVenusMarsTitle'), category: 'question' },
    { icon: '☿', text: t('welcomeScreen.promptMercuryTitle'), category: 'transit' },
    { icon: '🔮', text: t('welcomeScreen.promptNorthNodeTitle'), category: 'question' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
      {/* Zodiac ring decoration */}
      <div className="relative mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-aurora-glow blur-2xl scale-150" />

          {/* Main orb */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-aurora/20 to-mystic/10 border border-aurora/25 flex items-center justify-center shadow-aurora">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-2 rounded-full border border-dashed border-aurora/15"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-10 h-10 text-aurora-light" />
            </motion.div>
          </div>

          {/* Orbiting planets */}
          {[
            { icon: <Sun className="w-3.5 h-3.5 text-sol" />, delay: 0, radius: 56 },
            { icon: <Moon className="w-3 h-3 text-starlight-dim" />, delay: 3, radius: 56 },
            { icon: <Star className="w-3 h-3 text-mystic" />, delay: 6, radius: 56 },
          ].map((planet, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2"
              animate={{ rotate: 360 }}
              transition={{
                duration: 12 + i * 4,
                repeat: Infinity,
                ease: 'linear',
                delay: planet.delay,
              }}
              style={{ marginTop: -8, marginLeft: -8 }}
            >
              <div
                style={{ transform: `translateX(${planet.radius}px)` }}
                className="w-4 h-4 rounded-full bg-nebula-light border border-starlight/10 flex items-center justify-center"
              >
                {planet.icon}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-3"
      >
        <h2 className="font-display text-3xl text-starlight tracking-wide text-glow-starlight mb-1">
          {t('welcomeScreen.title')}
        </h2>
        <p className="font-serif text-lg italic text-starlight-dim/80">
          {t('welcomeScreen.subtitle')}
        </p>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="text-center text-sm text-starlight-muted max-w-sm leading-relaxed mb-8"
      >
        {t('welcomeScreen.hint')}
      </motion.p>

      {/* Zodiac strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="flex gap-3 mb-8 overflow-hidden"
      >
        {ZODIAC_SYMBOLS.map((sym, i) => (
          <motion.span
            key={i}
            className="font-serif text-lg text-starlight/15 select-none"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.25,
              ease: 'easeInOut',
            }}
          >
            {sym}
          </motion.span>
        ))}
      </motion.div>

      {/* Prompt suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <p className="text-center text-xs text-starlight-muted/50 uppercase tracking-widest mb-3 font-medium">
          {t('welcomeScreen.getStarted')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.07 }}
              onClick={() => onPromptClick(prompt.text)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-card border border-starlight/6 hover:border-aurora/25 text-left transition-all group"
            >
              <span className="text-lg flex-shrink-0">{prompt.icon}</span>
              <span className="text-xs text-starlight-dim group-hover:text-starlight leading-relaxed transition-colors">
                {prompt.text}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-[10px] text-center text-starlight-muted/40 max-w-xs leading-relaxed"
      >
        {t('welcomeScreen.disclaimer')}
      </motion.p>
    </div>
  );
}
