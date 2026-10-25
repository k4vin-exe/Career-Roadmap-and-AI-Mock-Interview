import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Check, RotateCcw, Loader2, Sparkles, Mic } from 'lucide-react';
import { detectFillerWords } from '../../utils/speechMetrics';

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

  useEffect(() => {
    setEditedText(transcript);
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

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
  const hasContent = displayText.trim().length > 0;
  const wordCount = displayText.split(/\s+/).filter(Boolean).length;
  const detectedFillers = detectFillerWords(displayText);

  return (
    <div className="card shadow-sm rounded-2xl p-6 bg-surface-solid border border-border relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">
            Your Spoken Response
          </p>
          {isListening && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-danger px-2 py-0.5 rounded-full bg-danger-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-danger animate-ping" />
              Recording
            </span>
          )}
        </div>

        {hasContent && !isListening && !isTranscribing && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-2xs hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  <Check size={13} strokeWidth={3} /> Save Edits
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-muted text-text-secondary text-xs font-semibold hover:bg-surface-muted/80 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} strokeWidth={2.5} /> Revert
                </motion.button>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-text-secondary text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit3 size={13} strokeWidth={2.5} /> Edit Text
              </motion.button>
            )}
          </div>
        )}
      </div>

      <div className="min-h-[140px] flex flex-col justify-center">
        {isTranscribing ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 size={24} className="text-primary animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">Transcribing speech with AI Whisper...</p>
              <p className="text-xs text-text-muted">Analyzing verbal pronunciation and structure</p>
            </div>
          </div>
        ) : isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            autoFocus
            className="w-full h-36 bg-surface-muted border-2 border-primary/30 rounded-xl p-4 text-text-primary text-sm leading-relaxed outline-none focus:border-primary transition-all resize-none font-sans"
          />
        ) : (
          <div className="text-sm leading-relaxed font-sans text-text-primary">
            {hasContent ? (
              displayText
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-text-muted">
                <Mic size={22} className="opacity-40 mb-2" />
                <p className="text-sm font-medium">Your voice transcript will appear here after speaking.</p>
                <p className="text-xs opacity-75">Click the mic, speak your response, then click Stop to transcribe.</p>
              </div>
            )}

            {isListening && (
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="inline-block w-1.5 h-4 bg-primary ml-1.5 rounded-full align-middle"
              />
            )}
          </div>
        )}
      </div>

      {hasContent && !isTranscribing && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60 text-xs text-text-muted flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {detectedFillers.length > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-warning bg-warning-soft px-2 py-0.5 rounded-md">
                <Sparkles size={11} /> {detectedFillers.length} filler word{detectedFillers.length > 1 ? 's' : ''} detected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-success bg-success-soft px-2 py-0.5 rounded-md">
                <Check size={11} /> Crisp verbal flow
              </span>
            )}
          </div>
          <span className="font-semibold text-text-secondary">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
      )}
    </div>
  );
}
