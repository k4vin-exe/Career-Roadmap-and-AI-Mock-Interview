import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const hasContent = transcript.trim().length > 0;

  return (
    <div style={{ background: '#fff', padding: 32, borderRadius: '24px 4px 24px 24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          Your Answer
        </p>
        
        {hasContent && !isListening && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isEditing ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEdit}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(99,102,241,0.3)' }}
                >
                  <Check size={14} strokeWidth={3} /> Save
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: 'var(--surface-muted)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  <RotateCcw size={14} strokeWidth={2.5} /> Reset
                </motion.button>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: 'var(--surface-muted)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                <Edit3 size={14} strokeWidth={2.5} /> Edit
              </motion.button>
            )}
          </div>
        )}
      </div>

      <div style={{ minHeight: 180 }}>
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            autoFocus
            style={{ 
              width: '100%', height: 180, background: 'var(--surface-muted)', border: '2px solid var(--primary-soft)', 
              borderRadius: 16, padding: 20, color: 'var(--text)', fontSize: 16, lineHeight: 1.6, fontWeight: 500, 
              resize: 'none', outline: 'none', transition: 'all 0.2s'
            }}
          />
        ) : (
          <div style={{ fontSize: 16, color: hasContent ? 'var(--text)' : 'var(--text-muted)', lineHeight: 1.7, fontWeight: 500 }}>
            {hasContent ? (
              displayText
            ) : (
              <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Your voice transcript will appear here as you speak...</span>
            )}
            
            {isListening && (
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ display: 'inline-block', width: 4, height: 18, background: 'var(--primary)', marginLeft: 6, borderRadius: 2, verticalAlign: 'middle' }}
              />
            )}
          </div>
        )}
      </div>

      {hasContent && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
            {displayText.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
      )}
    </div>
  );
}
