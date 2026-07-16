import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  color?: string; // e.g., 'bg-accent' or specific color hex
  className?: string;
}

export function ProgressBar({ 
  progress, 
  label, 
  showValue = true,
  color = 'bg-accent',
  className = '' 
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2 text-sm font-medium">
          {label && <span className="text-text-secondary">{label}</span>}
          {showValue && <span className="text-text-primary">{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-surface-lighter rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color.startsWith('bg-') ? color : ''}`}
          style={!color.startsWith('bg-') ? { backgroundColor: color } : {}}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
