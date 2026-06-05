import { motion } from 'framer-motion';
import clsx from 'clsx';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function TabBar({ tabs, active, onChange, className }: Props) {
  return (
    <div className={clsx('flex gap-1 p-1 rounded-2xl glass-card border border-starlight/6', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'relative px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2',
            active === tab.id
              ? 'text-aurora-light'
              : 'text-starlight-muted hover:text-starlight'
          )}
        >
          {active === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-xl bg-aurora/10 border border-aurora/20"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
          {tab.count !== undefined && (
            <span className={clsx('relative z-10 text-[10px] px-1.5 py-0.5 rounded-full', active === tab.id ? 'bg-aurora/20 text-aurora-light' : 'bg-starlight/5 text-starlight-muted')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
