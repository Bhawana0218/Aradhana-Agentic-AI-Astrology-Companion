import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Globe, Star, Zap, BookOpen } from 'lucide-react';
import type { ToolActivity, ToolActivityState } from '../types';
import { TOOL_DISPLAY } from '../lib/constants';
import { useTranslation } from '../i18n';
import clsx from 'clsx';

interface ToolConfig {
  labelKey: string;
  runningLabelKey: string;
  doneLabelKey: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

const TOOL_CONFIG: Record<string, ToolConfig> = {
  geocode_place: {
    labelKey: 'toolActivity.geocodeLabel',
    runningLabelKey: 'toolActivity.geocodeRunning',
    doneLabelKey: 'toolActivity.geocodeDone',
    icon: <Globe className="w-3.5 h-3.5" />,
    color: 'text-teal',
    bg: 'bg-teal/8',
    border: 'border-teal/20',
  },
  compute_birth_chart: {
    labelKey: 'toolActivity.birthChartLabel',
    runningLabelKey: 'toolActivity.birthChartRunning',
    doneLabelKey: 'toolActivity.birthChartDone',
    icon: <Star className="w-3.5 h-3.5" />,
    color: 'text-aurora-light',
    bg: 'bg-aurora/8',
    border: 'border-aurora/20',
  },
  get_daily_transits: {
    labelKey: 'toolActivity.transitsLabel',
    runningLabelKey: 'toolActivity.transitsRunning',
    doneLabelKey: 'toolActivity.transitsDone',
    icon: <Zap className="w-3.5 h-3.5" />,
    color: 'text-sol-light',
    bg: 'bg-sol/8',
    border: 'border-sol/20',
  },
  knowledge_lookup: {
    labelKey: 'toolActivity.knowledgeLabel',
    runningLabelKey: 'toolActivity.knowledgeRunning',
    doneLabelKey: 'toolActivity.knowledgeDone',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    color: 'text-mystic',
    bg: 'bg-mystic/8',
    border: 'border-mystic/20',
  },
};

const DEFAULT_CONFIG: ToolConfig = {
  labelKey: 'toolActivity.defaultLabel',
  runningLabelKey: 'toolActivity.defaultRunning',
  doneLabelKey: 'toolActivity.defaultDone',
  icon: <Loader2 className="w-3.5 h-3.5" />,
  color: 'text-starlight-dim',
  bg: 'bg-nebula',
  border: 'border-subtle',
};

// ─── Inline badge (inside completed messages) ─────────────────────────────────

interface BadgeProps {
  activity: ToolActivity;
}

export function ToolActivityBadge({ activity }: BadgeProps) {
  const { t } = useTranslation();
  const config = TOOL_CONFIG[activity.tool] ?? DEFAULT_CONFIG;
  const isDone = activity.type === 'tool_end';

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.bg, config.border, config.color
      )}
    >
      {isDone ? <CheckCircle2 className="w-3 h-3 text-teal" /> : <Loader2 className="w-3 h-3 animate-spin" />}
      <span>{isDone ? t(config.doneLabelKey) : t(config.runningLabelKey)}</span>
    </div>
  );
}

// ─── Timeline card (premium animated version used during streaming) ────────────

function TimelineCard({ tool, status }: { tool: string; status: 'running' | 'done' | 'pending' }) {
  const { t } = useTranslation();
  const config = TOOL_CONFIG[tool] ?? DEFAULT_CONFIG;
  const isRunning = status === 'running';
  const isDone = status === 'done';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all',
        config.bg, config.border,
        isRunning && 'shadow-sm border-l-2 border-l-aurora/40',
        isDone && 'border-l-2 border-l-teal/40'
      )}
    >
      {/* Icon */}
      <div className={clsx(
        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border',
        isDone ? 'bg-teal/15 border-teal/25' : 'bg-aurora/15 border-aurora/25'
      )}>
        {isDone
          ? <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
          : <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
              {config.icon}
            </motion.div>
        }
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className={clsx('text-xs font-medium', isDone ? 'text-teal' : config.color)}>
          {t(config.labelKey)}
        </div>
        <div className={clsx('text-[10px]', isDone ? 'text-starlight-muted/60' : 'text-starlight-muted/50')}>
          {isDone ? t('toolActivity.completed') : t('toolActivity.processing')}
        </div>
      </div>

      {/* Status dot */}
      <div className="flex-shrink-0">
        {isRunning ? (
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-aurora"
          />
        ) : (
          <div className="w-2 h-2 rounded-full bg-teal/60" />
        )}
      </div>
    </motion.div>
  );
}

// ─── Timeline container (shows during streaming, built from store toolActivity) ─

interface TimelineProps {
  currentTool: string | null;
  isStreaming: boolean;
}

export function ToolTimeline({ currentTool, isStreaming }: TimelineProps) {
  const toolKeys = Object.keys(TOOL_CONFIG);
  const completedIdx = currentTool ? toolKeys.indexOf(currentTool) - 1 : toolKeys.length - 1;

  return (
    <div className="max-w-md mx-auto my-3 space-y-1.5 px-2">
      <AnimatePresence mode="popLayout">
        {isStreaming && currentTool && toolKeys.map((key, i) => {
          if (i > completedIdx + 1) return null;
          const status = i < completedIdx ? 'done' : i === completedIdx + 1 ? 'running' : 'pending';
          return <TimelineCard key={key} tool={key} status={status} />;
        })}
      </AnimatePresence>
    </div>
  );
}

// ─── Live activity badge (legacy, used in ChatPage footer) ────────────────────

interface LiveBadgeProps {
  activity: ToolActivityState | null;
}

export function LiveToolActivityBadge({ activity }: LiveBadgeProps) {
  return (
    <AnimatePresence>
      {activity && activity.status === 'running' && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex justify-center py-1.5"
        >
          <LiveToolPill tool={activity.tool} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LiveToolPill({ tool }: { tool: string }) {
  const { t } = useTranslation();
  const config = TOOL_CONFIG[tool] ?? DEFAULT_CONFIG;

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border',
        config.bg, config.border
      )}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className={config.color}
      >
        {config.icon}
      </motion.div>
      <span className={clsx(config.color, 'opacity-80')}>{t(config.runningLabelKey)}</span>
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="w-1 h-1 rounded-full"
        style={{ background: 'currentColor' }}
      />
    </div>
  );
}
