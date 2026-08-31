/**
 * TranscriptDisplay — Live Speech Transcript Component
 *
 * Shows the candidate's speech in real time with animated interim results,
 * a character count, and an editable correction textarea.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, RotateCcw } from 'lucide-react';

interface TranscriptDisplayProps {
  transcript: string;
  isListening: boolean;
  isTranscribing: boolean;
  onTranscriptChange: (edited: string) => void;
}

export default function TranscriptDisplay({
  transcript,
  isListening,
  isTranscribing,
  onTranscriptChange,
}: TranscriptDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  // Sync editable text when new transcript arrives
  useEffect(() => {
    setEditedText(transcript);
    onTranscriptChange(transcript);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const handleSaveEdit = () => {
    onTranscriptChange(editedText);
    setIsEditing(false);
  };

  const handleReset = () => {
    setEditedText(transcript);
    setIsEditing(false);
    onTranscriptChange(transcript);
  };

  const displayText = isEditing ? editedText : transcript;
  const hasContent = transcript.trim().length > 0;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Your Answer
        </h3>
        {hasContent && !isListening && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <motion.button
                  id="transcript-save-btn"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  <Check size={13} /> Save
                </motion.button>
                <motion.button
                  id="transcript-reset-btn"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20 transition-colors"
                >
                  <RotateCcw size={13} /> Reset
                </motion.button>
              </>
            ) : (
              <motion.button
                id="transcript-edit-btn"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20 transition-colors"
              >
                <Edit3 size={13} /> Edit
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Transcript content area */}
      <div className="min-h-[180px]">
        {isEditing ? (
          <textarea
            id="transcript-textarea"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-text-primary text-base resize-none focus:outline-none focus:border-accent-primary/50 transition-colors"
            placeholder="Edit your answer here..."
            autoFocus
          />
        ) : (
          <div className="relative text-base leading-relaxed">
            {/* Finalized transcript text */}
            <span className="text-text-primary">{displayText}</span>

            {/* Transcribing loading state */}
            <AnimatePresence>
              {isTranscribing && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-text-muted italic flex items-center gap-2 mt-2"
                >
                  Transcribing audio...
                </motion.span>
              )}
            </AnimatePresence>

            {/* Blinking cursor when listening */}
            {isListening && (
              <motion.span
                className="inline-block w-0.5 h-5 bg-accent-primary ml-1 align-middle"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}

            {/* Empty state */}
            {!hasContent && !isListening && (
              <div className="flex flex-col items-start gap-4">
                <p className="text-text-muted italic">
                  Press the microphone button and start speaking. Your answer will appear here.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary"
                >
                  <Edit3 size={14} />
                  Or type your answer manually
                </button>
              </div>
            )}

            {/* Listening empty state */}
            {!hasContent && isListening && (
              <p className="text-text-muted italic">Listening...</p>
            )}
          </div>
        )}
      </div>

      {/* Word count */}
      {hasContent && (
        <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
          <span className="text-xs text-text-muted">
            {transcript.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
      )}
    </div>
  );
}
