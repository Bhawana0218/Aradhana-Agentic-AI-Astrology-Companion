import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ChevronRight, ChevronLeft, MapPin, Calendar, Clock, User, Star, Globe, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { geocodePlace } from '../lib/api';
import { useTranslation } from '../i18n';
import clsx from 'clsx';

interface StepProps {
  onNext: (data: Record<string, string>) => void;
  onBack?: () => void;
  defaultValues?: Record<string, string>;
}

const STEP_KEYS = ['name', 'date', 'time', 'place', 'confirm'] as const;
type StepKey = (typeof STEP_KEYS)[number];

const stepIcons: Record<StepKey, typeof Star> = {
  name: User,
  date: Calendar,
  time: Clock,
  place: MapPin,
  confirm: Sparkles,
};

function NameStep({ onNext, defaultValues }: StepProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [touched, setTouched] = useState(false);
  const valid = name.trim().length > 0 && name.length <= 60;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}>
          <Star className="w-8 h-8 text-sol mx-auto" />
        </motion.div>
        <h3 className="font-serif text-xl text-starlight tracking-wide">{t('birthWizard.name.title')}</h3>
        <p className="text-sm text-starlight-muted">{t('birthWizard.name.desc')}</p>
      </div>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-starlight-muted/50" />
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setTouched(true); }}
          onKeyDown={(e) => e.key === 'Enter' && valid && onNext({ name: name.trim() })}
          placeholder={t('birthWizard.name.placeholder')}
          className="input-premium pl-10"
          autoFocus
          autoComplete="name"
        />
      </div>
      {touched && !valid && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-rose-cosmos/80">
          {t('birthWizard.name.error')}
        </motion.p>
      )}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onNext({ name: name.trim() })}
        disabled={!valid}
        className={clsx(
          'w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all',
          valid ? 'btn-gradient' : 'opacity-30 cursor-not-allowed bg-space/50 border border-starlight/10 text-starlight-muted'
        )}
      >
        {t('birthWizard.next')} <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

function DateStep({ onNext, onBack, defaultValues }: StepProps) {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(defaultValues?.date ?? '');
  const [touched, setTouched] = useState(false);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && new Date(date) <= new Date();
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}>
          <Calendar className="w-8 h-8 text-sol mx-auto" />
        </motion.div>
        <h3 className="font-serif text-xl text-starlight tracking-wide">{t('birthWizard.date.title')}</h3>
        <p className="text-sm text-starlight-muted">{t('birthWizard.date.desc')}</p>
      </div>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-starlight-muted/50" />
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setTouched(true); }}
          onKeyDown={(e) => e.key === 'Enter' && valid && onNext({ date })}
          max={today}
          className="input-premium pl-10"
          autoFocus
        />
      </div>
      {touched && !valid && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-rose-cosmos/80">
          {t('birthWizard.date.error')}
        </motion.p>
      )}
      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-3 rounded-xl text-sm border border-starlight/10 text-starlight-muted hover:bg-starlight/5 transition-all flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> {t('birthWizard.back')}
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onNext({ date })}
          disabled={!valid}
          className={clsx(
            'flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all',
            valid ? 'btn-gradient' : 'opacity-30 cursor-not-allowed bg-space/50 border border-starlight/10 text-starlight-muted'
          )}
        >
          {t('birthWizard.next')} <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function TimeStep({ onNext, onBack, defaultValues }: StepProps) {
  const { t } = useTranslation();
  const [time, setTime] = useState(defaultValues?.time ?? '12:00');
  const [unknown, setUnknown] = useState(!defaultValues?.time);
  const [touched, setTouched] = useState(false);
  const valid = unknown || /^\d{2}:\d{2}$/.test(time);
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}>
          <Clock className="w-8 h-8 text-sol mx-auto" />
        </motion.div>
        <h3 className="font-serif text-xl text-starlight tracking-wide">{t('birthWizard.time.title')}</h3>
        <p className="text-sm text-starlight-muted">{t('birthWizard.time.desc')}</p>
      </div>
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-starlight-muted/50" />
        <input
          type="time"
          value={time}
          onChange={(e) => { setTime(e.target.value); setTouched(true); setUnknown(false); }}
          onKeyDown={(e) => e.key === 'Enter' && valid && onNext({ time, timeUnknown: 'false' })}
          disabled={unknown}
          className={clsx('input-premium pl-10', unknown && 'opacity-30 cursor-not-allowed')}
          autoFocus={!unknown}
        />
      </div>
      <label className="flex items-center gap-3 cursor-pointer select-none group">
        <div
          className={clsx(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            unknown
              ? 'bg-aurora/20 border-aurora/50 group-hover:bg-aurora/30'
              : 'border-starlight/20 group-hover:border-starlight/40'
          )}
        >
          {unknown && <Check className="w-3 h-3 text-aurora-light" strokeWidth={3} />}
        </div>
        <input
          type="checkbox"
          checked={unknown}
          onChange={(e) => { setUnknown(e.target.checked); setTouched(true); }}
          className="sr-only"
        />
        <span className="text-sm text-starlight-muted">{t('birthWizard.time.unknown')}</span>
      </label>
      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-3 rounded-xl text-sm border border-starlight/10 text-starlight-muted hover:bg-starlight/5 transition-all flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> {t('birthWizard.back')}
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onNext({ time: unknown ? '12:00' : time, timeUnknown: String(unknown) })}
          disabled={!valid}
          className={clsx(
            'flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all',
            valid ? 'btn-gradient' : 'opacity-30 cursor-not-allowed bg-space/50 border border-starlight/10 text-starlight-muted'
          )}
        >
          {t('birthWizard.next')} <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function PlaceStep({ onNext, onBack, defaultValues }: StepProps) {
  const { t } = useTranslation();
  const [place, setPlace] = useState(defaultValues?.place ?? '');
  const [touched, setTouched] = useState(false);
  const [geoWarn, setGeoWarn] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const valid = place.trim().length >= 2 && !geocoding;

  const handleSubmit = useCallback(async () => {
    if (!valid) return;
    setGeocoding(true);
    setGeoWarn(null);
    try {
      const result = await geocodePlace(place.trim());
      if (result.error) {
        setGeoWarn('Could not verify this location. You can still proceed.');
      }
      onNext({
        place: result.place ?? place.trim(),
        lat: String(result.lat ?? ''),
        lon: String(result.lon ?? ''),
        timezone: result.timezone ?? '',
      });
    } catch {
      setGeoWarn('Location verification unavailable. You can still proceed.');
      onNext({
        place: place.trim(),
        lat: '',
        lon: '',
        timezone: '',
      });
    } finally {
      setGeocoding(false);
    }
  }, [place, valid, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}>
          <Globe className="w-8 h-8 text-sol mx-auto" />
        </motion.div>
        <h3 className="font-serif text-xl text-starlight tracking-wide">{t('birthWizard.place.title')}</h3>
        <p className="text-sm text-starlight-muted">{t('birthWizard.place.desc')}</p>
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-starlight-muted/50" />
        <input
          type="text"
          value={place}
          onChange={(e) => { setPlace(e.target.value); setTouched(true); setGeoWarn(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={t('birthWizard.place.placeholder')}
          className="input-premium pl-10"
          autoFocus
          autoComplete="off"
        />
        {geocoding && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aurora animate-spin" />}
      </div>
      {touched && !valid && !geoWarn && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-rose-cosmos/80">
          {t('birthWizard.place.error')}
        </motion.p>
      )}
      {geoWarn && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-amber-400/80">
          {geoWarn}
        </motion.p>
      )}
      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-3 rounded-xl text-sm border border-starlight/10 text-starlight-muted hover:bg-starlight/5 transition-all flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> {t('birthWizard.back')}
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!valid}
          className={clsx(
            'flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all',
            valid ? 'btn-gradient' : 'opacity-30 cursor-not-allowed bg-space/50 border border-starlight/10 text-starlight-muted'
          )}
        >
          {geocoding ? (
            <>{t('birthWizard.verifying')} <Loader2 className="w-4 h-4 animate-spin" /></>
          ) : (
            <>{t('birthWizard.next')} <ChevronRight className="w-4 h-4" /></>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

function ConfirmStep({ data, onConfirm, onBack }: { data: Record<string, string>; onConfirm: () => void; onBack: () => void }) {
  const { t } = useTranslation();
  const details = [
    { label: t('birthWizard.confirm.labelName'), value: data.name, icon: User },
    { label: t('birthWizard.confirm.labelDate'), value: data.date, icon: Calendar },
    { label: t('birthWizard.confirm.labelTime'), value: data.timeUnknown === 'true' ? t('birthWizard.confirm.unknownTime') : data.time, icon: Clock },
    { label: t('birthWizard.confirm.labelPlace'), value: data.place, icon: MapPin },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}>
          <Sparkles className="w-8 h-8 text-sol mx-auto" />
        </motion.div>
        <h3 className="font-serif text-xl text-starlight tracking-wide">{t('birthWizard.confirm.title')}</h3>
        <p className="text-sm text-starlight-muted">{t('birthWizard.confirm.desc')}</p>
      </div>
      <div className="space-y-2">
        {details.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="flex items-center gap-3 bg-space-mid/60 rounded-lg px-4 py-2.5 border border-starlight/5"
          >
            <Icon className="w-4 h-4 text-aurora-light" />
            <span className="text-xs text-starlight-muted w-12">{label}</span>
            <span className="text-sm text-starlight font-medium">{value}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onBack} className="px-4 py-3 rounded-xl text-sm border border-starlight/10 text-starlight-muted hover:bg-starlight/5 transition-all flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> {t('birthWizard.back')}
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 btn-gradient"
        >
          <Sparkles className="w-4 h-4" /> {t('birthWizard.complete')}
        </motion.button>
      </div>
    </motion.div>
  );
}

export function BirthWizard() {
  const { t } = useTranslation();
  const { birthDetails, setBirthDetails, showBirthForm, setShowBirthForm } = useChatStore();
  const [stepIdx, setStepIdx] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({
    name: birthDetails?.name ?? '',
    date: birthDetails?.date ?? '',
    time: birthDetails?.time ?? '12:00',
    timeUnknown: birthDetails?.time ? 'false' : 'true',
    place: birthDetails?.place ?? '',
  });
  const [saved, setSaved] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const stepKeys = ['name', 'date', 'time', 'place', 'confirm'] as const;
  const currentStep = stepKeys[stepIdx];

  const handleNext = useCallback((data: Record<string, string>) => {
    const merged = { ...formData, ...data };
    setFormData(merged);
    setDirection('forward');
    setStepIdx((i) => Math.min(i + 1, stepKeys.length - 1));
  }, [formData]);

  const handleBack = useCallback(() => {
    setDirection('backward');
    setStepIdx((i) => Math.max(i - 1, 0));
  }, []);

  const handleConfirm = useCallback(() => {
    setBirthDetails({
      name: formData.name,
      date: formData.date,
      time: formData.timeUnknown === 'true' ? '12:00' : formData.time || '12:00',
      place: formData.place,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lon: formData.lon ? parseFloat(formData.lon) : undefined,
      timezone: formData.timezone || undefined,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowBirthForm(false); }, 1200);
  }, [formData, setBirthDetails, setShowBirthForm]);

  const clearDetails = useCallback(() => {
    setBirthDetails(null);
    setShowBirthForm(true);
    setStepIdx(0);
    setFormData({ name: '', date: '', time: '12:00', timeUnknown: 'true', place: '' });
  }, [setBirthDetails, setShowBirthForm]);

  if (!showBirthForm && birthDetails) {
    return (
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto px-4">
        <div className="flex items-center gap-3 bg-glass-gradient border border-aurora/10 rounded-2xl px-5 py-3 shadow-lg backdrop-blur-xl">
          <Sparkles className="w-4 h-4 text-aurora-light flex-shrink-0" />
          <span className="text-xs text-starlight/70 truncate leading-tight">
            <span className="text-starlight font-medium">{birthDetails.name || t('birthWizard.seeker')}</span>
            {' · '}{birthDetails.place}{' · '}{birthDetails.date}
          </span>
          <button onClick={() => setShowBirthForm(true)} className="text-xs text-aurora-light/60 hover:text-aurora-light ml-auto flex-shrink-0 transition-colors">
            {t('birthWizard.edit')}
          </button>
          <button onClick={clearDetails} className="p-1 rounded-lg hover:bg-aurora/10 transition-colors flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-starlight-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4">
      <AnimatePresence mode="wait">
        {showBirthForm && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* Progress bar */}
            <div className="flex items-center justify-center mb-6">
              {stepKeys.slice(0, -1).map((key, i) => {
                const Icon = stepIcons[key];
                const isActive = i === stepIdx;
                const isDone = i < stepIdx;
                return (
                  <div key={key} className="flex items-center">
                    <div
                      className={clsx(
                        'step-dot',
                        isDone && 'step-dot-done',
                        isActive && 'step-dot-active',
                        !isDone && !isActive && 'step-dot-pending'
                      )}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    {i < stepKeys.length - 2 && (
                      <div
                        className={clsx(
                          'step-line w-12 md:w-20',
                          isDone && 'step-line-done',
                          isActive && 'step-line-active',
                          !isDone && !isActive && 'step-line-pending'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step labels */}
            <div className="flex justify-center gap-2 mb-6">
              {stepKeys.slice(0, -1).map((key, i) => (
                <span
                  key={key}
                  className={clsx(
                    'text-[10px] uppercase tracking-widest transition-all',
                    i === stepIdx ? 'text-aurora-light' : i < stepIdx ? 'text-teal/60' : 'text-starlight-muted/30'
                  )}
                >
                  {key === 'name' ? t('birthWizard.stepName') : key === 'date' ? t('birthWizard.stepDate') : key === 'time' ? t('birthWizard.stepTime') : t('birthWizard.stepPlace')}
                </span>
              ))}
            </div>

            {/* Wizard card */}
            <div className="glass-card-premium rounded-2xl px-6 py-7">
              <AnimatePresence mode="wait" custom={direction}>
                {currentStep === 'name' && (
                  <NameStep key="name" onNext={handleNext} defaultValues={formData} />
                )}
                {currentStep === 'date' && (
                  <DateStep key="date" onNext={handleNext} onBack={handleBack} defaultValues={formData} />
                )}
                {currentStep === 'time' && (
                  <TimeStep key="time" onNext={handleNext} onBack={handleBack} defaultValues={formData} />
                )}
                {currentStep === 'place' && (
                  <PlaceStep key="place" onNext={handleNext} onBack={handleBack} defaultValues={formData} />
                )}
                {currentStep === 'confirm' && (
                  <ConfirmStep key="confirm" data={formData} onConfirm={handleConfirm} onBack={handleBack} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
