/**
 * MicrophoneButton — Broadcast Studio Condenser Microphone
 * Multi-layer soundwave pulse halo, metallic glassmorphic bevel,
 * and responsive micro-animations for high-fidelity speech recording.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square } from 'lucide-react';

interface MicrophoneButtonProps {
  isListening: boolean;
  isDisabled?: boolean;
  onStart: () => void;
  onStop: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { button: 56, icon: 22, ring: 76 },
  md: { button: 72, icon: 28, ring: 96 },
  lg: { button: 84, icon: 32, ring: 114 },
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
    <div className="relative flex flex-col items-center justify-center">
      {/* Outer Glow Halo Rings when Recording */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: ring + 44,
                height: ring + 44,
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0) 70%)',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0.2, 0.7] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute rounded-full border-2 border-danger/40 pointer-events-none"
              style={{ width: ring, height: ring }}
              initial={{ scale: 0.9, opacity: 0.9 }}
              animate={{ scale: [1, 1.4, 1.7], opacity: [0.8, 0.3, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute rounded-full border border-danger/25 pointer-events-none"
              style={{ width: ring - 12, height: ring - 12 }}
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: [1, 1.3, 1.6], opacity: [0.7, 0.2, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.45, ease: 'easeOut' }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Broadcast Button */}
      <motion.button
        id="mic-button"
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.05, y: -2 } : {}}
        whileTap={!isDisabled ? { scale: 0.94 } : {}}
        className="relative z-10 rounded-full flex items-center justify-center cursor-pointer select-none transition-all"
        style={{
          width: button,
          height: button,
          background: isListening
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)'
            : isDisabled
            ? 'var(--surface-muted)'
            : 'linear-gradient(135deg, #8067e8 0%, #684fe2 50%, #5d45c7 100%)',
          boxShadow: isListening
            ? '0 12px 35px rgba(239, 68, 68, 0.45), 0 0 0 5px rgba(254, 226, 226, 0.85), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
            : isDisabled
            ? 'none'
            : '0 12px 30px rgba(128, 103, 232, 0.38), 0 0 0 5px rgba(235, 230, 255, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: 'none',
        }}
        title={isListening ? 'Click or press [Spacebar] to stop recording' : 'Click or press [Spacebar] to start speaking'}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            className="flex items-center justify-center"
          >
            <Square size={icon - 4} className="text-white fill-white rounded-xs" />
          </motion.div>
        ) : (
          <Mic
            size={icon}
            className={isDisabled ? 'text-slate-400 opacity-60' : 'text-white'}
            strokeWidth={isDisabled ? 2 : 2.5}
          />
        )}
      </motion.button>
    </div>
  );
}
