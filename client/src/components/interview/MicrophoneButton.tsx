/**
 * MicrophoneButton — Animated Voice Input Component
 *
 * Displays a pulsing, animated microphone button that reflects the
 * current listening state. Central UI element for the interview flow.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square } from 'lucide-react';

interface MicrophoneButtonProps {
  isListening: boolean;
  isDisabled?: boolean;
  onStart: () => void;
  onStop: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { button: 'w-14 h-14', icon: 20, ring: 'w-20 h-20' },
  md: { button: 'w-20 h-20', icon: 28, ring: 'w-28 h-28' },
  lg: { button: 'w-24 h-24', icon: 36, ring: 'w-36 h-36' },
};

export default function MicrophoneButton({
  isListening,
  isDisabled = false,
  onStart,
  onStop,
  size = 'lg',
}: MicrophoneButtonProps) {
  const { button, icon, ring } = sizeMap[size];

  const handleClick = () => {
    if (isDisabled) return;
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated outer rings when listening */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              className={`absolute ${ring} rounded-full border-2 border-accent-primary`}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 1.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className={`absolute ${ring} rounded-full border-2 border-accent-primary`}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, ease: 'easeOut' }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Microphone Button */}
      <motion.button
        id="mic-button"
        className={`relative ${button} rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-accent-primary/50`}
        style={{
          background: isListening
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : isDisabled
            ? 'var(--surface-muted)'
            : 'linear-gradient(135deg, var(--accent-primary, #7c3aed), var(--accent-secondary, #4f46e5))',
          boxShadow: isListening
            ? '0 0 30px rgba(239, 68, 68, 0.5), 0 8px 24px rgba(0,0,0,0.3)'
            : isDisabled
            ? 'none'
            : '0 0 30px rgba(124, 58, 237, 0.4), 0 8px 24px rgba(0,0,0,0.3)',
        }}
        onClick={handleClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
        aria-pressed={isListening}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <Square size={icon} className="text-white fill-white" />
          </motion.div>
        ) : (
          <Mic
            size={icon}
            className={isDisabled ? 'text-text-muted' : 'text-white'}
          />
        )}
      </motion.button>
    </div>
  );
}

