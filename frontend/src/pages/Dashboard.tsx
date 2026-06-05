import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle, Compass, Sun, Star, ArrowRight, Shield, Globe, Zap } from 'lucide-react';
import { useTranslation } from '../i18n';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const featureIcons = [Compass, MessageCircle, Sun, Star];

const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export function Dashboard() {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const steps = [
    { icon: MessageCircle, title: t('dashboard.step1Title'), desc: t('dashboard.step1Desc') },
    { icon: Compass, title: t('dashboard.step2Title'), desc: t('dashboard.step2Desc') },
    { icon: Star, title: t('dashboard.step3Title'), desc: t('dashboard.step3Desc') },
    { icon: Sparkles, title: t('dashboard.step4Title'), desc: t('dashboard.step4Desc') },
  ];

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      {/* ── Hero ── */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative px-4 pt-20 pb-16 sm:pt-32 sm:pb-24 text-center overflow-hidden">
        {/* Zodiac background */}
        <div className="absolute top-0 left-0 right-0 h-40 flex justify-center gap-3 sm:gap-5 opacity-[0.03] text-5xl select-none pointer-events-none overflow-hidden">
          {[...ZODIAC, ...ZODIAC].map((sym, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -10, 0], opacity: [0.08, 0.2, 0.08] }}
              transition={{ duration: 5, repeat: Infinity, delay: i * 0.2 }}
              className="font-serif"
            >
              {sym}
            </motion.span>
          ))}
        </div>

        {/* Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-aurora/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-sol/4 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-mystic/4 rounded-full blur-[100px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="relative">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="inline-flex items-center justify-center mb-8"
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border border-dashed border-aurora/20"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-aurora/25 via-aurora/10 to-mystic/10 p-[1px]">
                <div className="w-full h-full rounded-full bg-space flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-aurora-light" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-starlight tracking-wide text-glow-starlight mb-4 leading-tight">
            {t('home.hero.heading1')}<br />
            <span className="bg-gradient-to-r from-aurora-light via-sol-light to-aurora-light bg-clip-text text-transparent">
              {t('home.hero.heading2')}
            </span>
          </h1>
          <p className="font-serif text-lg sm:text-xl italic text-starlight-dim/70 mb-2">
            {t('home.hero.subtitle')}
          </p>
          <p className="text-sm sm:text-base text-starlight-muted max-w-xl mx-auto leading-relaxed mb-10">
            {t('home.hero.desc')}
          </p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div variants={itemVariants}>
              <Link
                to="/chat"
                className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl btn-gradient text-sm font-medium shadow-lg shadow-aurora/20 hover:shadow-aurora/40 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" />
                {t('home.hero.cta')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                to="/chart"
                className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl glass-card-premium border border-starlight/8 hover:border-aurora/25 text-sm font-medium text-starlight-dim hover:text-starlight transition-all duration-300"
              >
                <Compass className="w-4 h-4" />
                {t('home.hero.sample')}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── Features ── */}
      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl text-starlight tracking-wider mb-3">
              {t('home.features.title')}
            </h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-aurora/60 to-transparent mx-auto rounded-full" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { key: 'chart', icon: featureIcons[0] },
              { key: 'chat', icon: featureIcons[1] },
              { key: 'transits', icon: featureIcons[2] },
              { key: 'languages', icon: featureIcons[3] },
            ].map(({ key, icon: Icon }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="glass-card-premium rounded-2xl p-6 border border-starlight/6 hover:border-aurora/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora/15 to-mystic/10 border border-aurora/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 text-aurora-light" />
                </div>
                <h3 className="font-display text-sm text-starlight tracking-wide mb-2">
                  {t(`home.features.${key}`)}
                </h3>
                <p className="text-xs text-starlight-muted/80 leading-relaxed">
                  {t(`home.features.${key}Desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl text-starlight tracking-wider mb-3">
              {t('dashboard.howItWorks')}
            </h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-aurora/60 to-transparent mx-auto rounded-full" />
            <p className="text-sm text-starlight-muted mt-3 max-w-md mx-auto">
              {t('dashboard.howItWorksDesc')}
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-aurora/30 via-aurora/10 to-transparent hidden sm:block" />

            <div className="space-y-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex items-start gap-5"
                  >
                    <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-aurora/20 to-mystic/10 border border-aurora/25 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-aurora-light" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-aurora/80 text-[10px] font-bold text-white flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <div className="glass-card-premium rounded-2xl px-5 py-4 flex-1 border border-starlight/6">
                      <h3 className="font-display text-sm text-starlight tracking-wide mb-1">{step.title}</h3>
                      <p className="text-xs text-starlight-muted/80">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust / Stats ── */}
      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Star, label: t('dashboard.statEphemeris'), desc: t('dashboard.statEphemerisDesc') },
              { icon: Globe, label: t('dashboard.statLanguages'), desc: t('dashboard.statLanguagesDesc') },
              { icon: Shield, label: t('dashboard.statPrivacy'), desc: t('dashboard.statPrivacyDesc') },
              { icon: Zap, label: t('dashboard.statCharts'), desc: t('dashboard.statChartsDesc') },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card rounded-2xl px-4 py-5 text-center border border-starlight/6"
                >
                  <Icon className="w-5 h-5 text-aurora-light mx-auto mb-2" />
                  <div className="font-display text-xs text-starlight tracking-wide">{stat.label}</div>
                  <div className="text-[10px] text-starlight-muted mt-0.5">{stat.desc}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="glass-card-premium rounded-3xl px-8 py-12 border border-aurora/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurora/40 to-transparent" />
            <Sparkles className="w-8 h-8 text-aurora-light mx-auto mb-4" />
            <h2 className="font-display text-2xl sm:text-3xl text-starlight tracking-wide mb-3">
              {t('dashboard.ctaTitle')}
            </h2>
            <p className="text-sm text-starlight-muted max-w-sm mx-auto mb-8">
              {t('dashboard.ctaDesc')}
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl btn-gradient text-sm font-medium shadow-lg shadow-aurora/20 hover:shadow-aurora/40 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" />
              {t('dashboard.ctaButton')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Zodiac footer strip ── */}
      <div className="flex justify-center gap-3 sm:gap-4 pb-8 overflow-hidden">
        {ZODIAC.map((sym, i) => (
          <motion.span
            key={i}
            className="font-serif text-xl sm:text-2xl text-starlight/10 select-none"
            animate={{ opacity: [0.06, 0.18, 0.06] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
          >
            {sym}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
