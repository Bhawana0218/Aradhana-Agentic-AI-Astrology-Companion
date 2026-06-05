import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aurora/10 to-mystic/5 border border-aurora/15 flex items-center justify-center mb-4">
        {icon || <Sparkles className="w-7 h-7 text-aurora-light/60" />}
      </div>
      <h3 className="font-display text-lg text-starlight tracking-wide mb-2">{title}</h3>
      {description && <p className="text-sm text-starlight-muted max-w-sm leading-relaxed mb-6">{description}</p>}
      {action}
    </motion.div>
  );
}
