import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Check, RotateCcw, Loader2, Sparkles, Mic, FileText, CheckCircle2 } from 'lucide-react';
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
    <div className="card-elevated rounded-3xl p-6 md:p-7 bg-white border border-slate-200/80 shadow-md shadow-slate-200/50 relative overflow-hidden transition-all">
      {/* Subtle top ambient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan to-success opacity-80" />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText size={16} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Spoken Transcript
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Real-time speech-to-text capture</p>
          </div>

          {isListening && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-danger px-2.5 py-1 rounded-full bg-danger-soft border border-danger/20 ml-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-danger" />
              Recording Voice
            </span>
          )}
        </div>

        {/* Action Controls */}
        {hasContent && !isListening && !isTranscribing && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  <Check size={13} strokeWidth={3} /> Save Edits
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} strokeWidth={2.5} /> Revert
                </motion.button>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <Edit3 size={13} strokeWidth={2.5} /> Edit Transcript
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="min-h-[140px] flex flex-col justify-center">
        {isTranscribing ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-soft/60 flex items-center justify-center text-primary">
              <Loader2 size={24} className="animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">Transcribing speech with AI Whisper...</p>
              <p className="text-xs text-slate-500 font-medium">Accurately processing technical vocabulary & punctuation</p>
            </div>
          </div>
        ) : isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            autoFocus
            className="w-full h-36 bg-slate-50/80 border-2 border-primary/40 rounded-2xl p-4 text-slate-800 text-sm leading-relaxed outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none font-sans font-medium"
            placeholder="Edit your transcribed answer..."
          />
        ) : (
          <div className="text-sm leading-relaxed font-sans text-slate-800 font-medium">
            {hasContent ? (
              <p className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 text-slate-800 leading-relaxed">
                {displayText}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center py-7 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Mic size={22} />
                </div>
                <p className="text-sm font-bold text-slate-700 mb-0.5">Your spoken response will appear here</p>
                <p className="text-xs text-slate-400">Click the microphone below, speak your answer naturally, then click Stop.</p>
              </div>
            )}

            {isListening && (
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-primary ml-1.5 rounded-full align-middle"
              />
            )}
          </div>
        )}
      </div>

      {/* Footer Stats Bar */}
      {hasContent && !isTranscribing && (
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {detectedFillers.length > 0 ? (
              <span className="inline-flex items-center gap-1 font-bold text-warning bg-warning-soft px-2.5 py-1 rounded-lg border border-warning/20">
                <Sparkles size={12} /> {detectedFillers.length} filler word{detectedFillers.length > 1 ? 's' : ''} detected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-success bg-success-soft px-2.5 py-1 rounded-lg border border-success/20">
                <CheckCircle2 size={12} /> Crisp verbal flow · 0 fillers
              </span>
            )}
          </div>

          <span className="font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
            {wordCount} {wordCount === 1 ? 'word' : 'words'} captured
          </span>
        </div>
      )}
    </div>
  );
}
