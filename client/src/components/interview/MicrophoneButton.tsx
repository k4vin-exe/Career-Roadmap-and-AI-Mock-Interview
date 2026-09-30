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
  sm: { button: 64, icon: 24 },
  md: { button: 80, icon: 32 },
  lg: { button: 100, icon: 40 },
};

export default function MicrophoneButton({
  isListening,
  isDisabled = false,
  onStart,
  onStop,
  size = 'lg',
}: MicrophoneButtonProps) {
  const { button, icon } = sizeMap[size];

  const handleClick = () => {
    if (isDisabled) return;
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: '2px solid rgba(239,68,68,0.4)', zIndex: 0 }}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: '2px solid rgba(239,68,68,0.3)', zIndex: 0 }}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, ease: 'easeOut' }}
            />
          </>
        )}
      </AnimatePresence>

      <motion.button
        id="mic-button"
        onClick={handleClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        style={{
          position: 'relative', zIndex: 1,
          width: button, height: button, borderRadius: '50%', border: 'none', cursor: isDisabled ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isListening
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : isDisabled
            ? 'var(--surface-muted)'
            : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          boxShadow: isListening
            ? '0 15px 40px rgba(239, 68, 68, 0.4)'
            : isDisabled
            ? 'none'
            : '0 15px 40px rgba(99,102,241,0.4)',
          transition: 'background 0.3s, box-shadow 0.3s',
        }}
      >
        {isListening ? (
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
            <Square size={icon} color="#fff" fill="#fff" />
          </motion.div>
        ) : (
          <Mic size={icon} color={isDisabled ? 'var(--text-muted)' : '#fff'} strokeWidth={isDisabled ? 2 : 2.5} />
        )}
      </motion.button>
    </div>
  );
}
