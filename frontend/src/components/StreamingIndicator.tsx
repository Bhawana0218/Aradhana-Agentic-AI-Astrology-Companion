import { motion } from 'framer-motion';

export function StreamingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5" role="status" aria-label="Aradhana is thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-aurora-light"
          animate={{
            y: [0, -5, 0],
            opacity: [0.35, 1, 0.35],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
