import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Clock, Sparkles, X, ChevronDown, ChevronUp,
  User as UserIcon, Check
} from 'lucide-react';
import { z } from 'zod';
import { useChatStore } from '../store/chatStore';
import clsx from 'clsx';

// ─── Validation Schema ────────────────────────────────────────────────────────

const birthSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .refine(
      (val) => {
        const d = new Date(val);
        const year = parseInt(val.split('-')[0], 10);
        return !isNaN(d.getTime()) && year >= 1800 && d <= new Date();
      },
      { message: 'Date must be between 1800 and today' }
    ),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Use HH:MM format')
    .optional()
    .or(z.literal('')),
  place: z.string().min(2, 'Enter a city or place name').max(120),
  timeUnknown: z.boolean().optional(),
});

type BirthFormData = z.infer<typeof birthSchema>;

// ─── Helper ───────────────────────────────────────────────────────────────────

function InputWrapper({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs text-starlight-dim font-medium tracking-wide">
        <span className="text-aurora/70">{icon}</span>
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-rose-cosmos text-xs pl-0.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  'w-full bg-space/70 border border-starlight/8 rounded-xl px-3.5 py-2.5 text-sm text-starlight placeholder:text-starlight-muted/50 focus:outline-none focus:border-aurora/40 focus:bg-space/90 input-cosmic transition-all duration-200';

// ─── Main Component ───────────────────────────────────────────────────────────

export function BirthDetailsForm() {
  const { birthDetails, setBirthDetails, showBirthForm, setShowBirthForm } = useChatStore();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BirthFormData>({
    resolver: zodResolver(birthSchema),
    defaultValues: {
      name: birthDetails?.name ?? '',
      date: birthDetails?.date ?? '',
      time: birthDetails?.time ?? '',
      place: birthDetails?.place ?? '',
      timeUnknown: !birthDetails?.time,
    },
  });

  const timeUnknown = watch('timeUnknown');

  const onSubmit = async (data: BirthFormData) => {
    setBirthDetails({
      name: data.name,
      date: data.date,
      time: data.timeUnknown ? '12:00' : data.time || '12:00',
      place: data.place,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowBirthForm(false);
    }, 1200);
  };

  const clearDetails = () => {
    setBirthDetails(null);
    setShowBirthForm(true);
  };

  // ── Saved banner ──────────────────────────────────────────────────────────

  if (!showBirthForm && birthDetails) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-3 mt-2 mb-1"
      >
        <div className="flex items-center gap-3 bg-aurora-glow border border-aurora/20 rounded-2xl px-4 py-2.5">
          <div className="w-7 h-7 rounded-full bg-aurora/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-aurora-light" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-starlight/80 truncate">
              <span className="text-starlight font-medium">{birthDetails.name || 'Seeker'}</span>
              {' · '}
              <span className="text-starlight-dim">{birthDetails.place}</span>
              {' · '}
              <span className="text-starlight-dim">{birthDetails.date}</span>
              {birthDetails.time && birthDetails.time !== '12:00' && (
                <span className="text-starlight-dim"> at {birthDetails.time}</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowBirthForm(true)}
            className="text-xs text-aurora/60 hover:text-aurora transition-colors px-2 py-1 rounded-lg hover:bg-aurora/10 flex-shrink-0"
          >
            Edit
          </button>
          <button
            onClick={clearDetails}
            className="p-1.5 rounded-lg hover:bg-aurora/15 transition-colors flex-shrink-0"
            aria-label="Clear birth details"
          >
            <X className="w-3 h-3 text-starlight-muted hover:text-starlight" />
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {showBirthForm && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: 8 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mx-3 mt-2 mb-1 overflow-hidden"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="glass-card rounded-2xl p-4 space-y-3.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sol-glow border border-sol/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-sol" />
                </div>
                <div>
                  <h3 className="font-display text-sm text-starlight font-medium tracking-wide">
                    Your Celestial Profile
                  </h3>
                  <p className="text-xs text-starlight-muted">For accurate birth chart readings</p>
                </div>
              </div>
              {birthDetails && (
                <button
                  type="button"
                  onClick={() => setShowBirthForm(false)}
                  className="p-1.5 rounded-lg hover:bg-starlight/5 transition-colors"
                >
                  <ChevronUp className="w-4 h-4 text-starlight-muted" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-aurora/20 to-transparent" />

            {/* Name */}
            <InputWrapper
              label="Your Name"
              icon={<UserIcon className="w-3 h-3" />}
              error={errors.name?.message}
            >
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                {...register('name')}
                className={inputClass}
                autoComplete="name"
              />
            </InputWrapper>

            {/* Date + Time row */}
            <div className="grid grid-cols-2 gap-3">
              <InputWrapper
                label="Date of Birth"
                icon={<Calendar className="w-3 h-3" />}
                error={errors.date?.message}
              >
                <input
                  type="date"
                  {...register('date')}
                  className={inputClass}
                  max={new Date().toISOString().split('T')[0]}
                  min="1800-01-01"
                />
              </InputWrapper>

              <InputWrapper
                label="Time of Birth"
                icon={<Clock className="w-3 h-3" />}
                error={errors.time?.message}
              >
                <input
                  type="time"
                  {...register('time')}
                  disabled={timeUnknown}
                  className={clsx(inputClass, timeUnknown && 'opacity-35 cursor-not-allowed')}
                />
              </InputWrapper>
            </div>

            {/* Time unknown checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <div
                className={clsx(
                  'w-4 h-4 rounded border flex items-center justify-center transition-all',
                  timeUnknown
                    ? 'bg-aurora border-aurora'
                    : 'border-starlight/20 bg-transparent'
                )}
              >
                {timeUnknown && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <input type="checkbox" {...register('timeUnknown')} className="sr-only" />
              <span className="text-xs text-starlight-muted">Birth time unknown (will use noon)</span>
            </label>

            {/* Place */}
            <InputWrapper
              label="Birth City"
              icon={<MapPin className="w-3 h-3" />}
              error={errors.place?.message}
            >
              <input
                type="text"
                placeholder="e.g. Mumbai, India"
                {...register('place')}
                className={inputClass}
                autoComplete="off"
              />
            </InputWrapper>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                'w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2',
                saved
                  ? 'bg-teal/20 border border-teal/30 text-teal'
                  : 'btn-primary'
              )}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save My Birth Details</span>
                </>
              )}
            </motion.button>

            {/* Disclaimer */}
            <p className="text-[10px] text-center text-starlight-muted/60 leading-relaxed">
              Your details are used only for chart calculations and stored locally.
            </p>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
