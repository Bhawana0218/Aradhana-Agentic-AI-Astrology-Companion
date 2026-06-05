import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Globe, Star, Zap, BookOpen } from 'lucide-react';
import type { ToolActivity, ToolActivityState } from '../types';

// ─── Config ───────────────────────────────────────────────────────────────────

interface ToolConfig {
  label: string;
  runningLabel: string;
  doneLabel: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

const TOOL_CONFIG: Record<string, ToolConfig> = {
  geocode_place: {
    label: 'Locating Place',
    runningLabel: 'Finding your place on Earth…',
    doneLabel: 'Place located',
    icon: <Globe className="w-3 h-3" />,
    color: 'text-teal',
    bg: 'bg-teal/10',
    border: 'border-teal/20',
  },
  compute_birth_chart: {
    label: 'Birth Chart',
    runningLabel: 'Calculating celestial alignments…',
    doneLabel: 'Birth chart computed',
    icon: <Star className="w-3 h-3" />,
    color: 'text-aurora-light',
    bg: 'bg-aurora/10',
    border: 'border-aurora/20',
  },
  get_daily_transits: {
    label: 'Daily Transits',
    runningLabel: 'Reading the cosmic clock…',
    doneLabel: 'Transits calculated',
    icon: <Zap className="w-3 h-3" />,
    color: 'text-sol-light',
    bg: 'bg-sol/10',
    border: 'border-sol/20',
  },
  knowledge_lookup: {
    label: 'Celestial Wisdom',
    runningLabel: 'Consulting the ancient scrolls…',
    doneLabel: 'Knowledge retrieved',
    icon: <BookOpen className="w-3 h-3" />,
    color: 'text-mystic',
    bg: 'bg-mystic/10',
    border: 'border-mystic/20',
  },
};

const DEFAULT_CONFIG: ToolConfig = {
  label: 'Tool',
  runningLabel: 'Processing…',
  doneLabel: 'Done',
  icon: <Loader2 className="w-3 h-3" />,
  color: 'text-starlight-dim',
  bg: 'bg-nebula',
  border: 'border-subtle',
};

// ─── Inline badge (for inside completed messages) ─────────────────────────────

interface BadgeProps {
  activity: ToolActivity;
}

export function ToolActivityBadge({ activity }: BadgeProps) {
  const config = TOOL_CONFIG[activity.tool] ?? DEFAULT_CONFIG;
  const isDone = activity.type === 'tool_end';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} border ${config.border} ${config.color}`}
    >
      {isDone ? (
        <CheckCircle2 className="w-3 h-3 text-green-400" />
      ) : (
        <span className={config.color}>{config.icon}</span>
      )}
      <span>{isDone ? config.doneLabel : config.runningLabel}</span>
    </div>
  );
}

// ─── Live activity (shown during streaming) ───────────────────────────────────

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
  const config = TOOL_CONFIG[tool] ?? DEFAULT_CONFIG;

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium ${config.bg} border ${config.border}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className={config.color}
      >
        {config.icon}
      </motion.div>
      <span className={`${config.color} opacity-80`}>{config.runningLabel}</span>
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className={`w-1 h-1 rounded-full ${config.bg.replace('bg-', 'bg-').replace('/10', '/80')}`}
        style={{ background: 'currentColor' }}
      />
    </div>
  );
}
