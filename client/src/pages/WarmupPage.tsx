/**
 * WarmupPage — Extraordinary Redesign
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Send,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  Volume2,
  VolumeX,
  Loader2,
  User,
  Sparkles,
  Bot
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { computeSpeechMetrics } from '../utils/speechMetrics';
import { evaluateWarmup } from '../services/api';
import type { WarmupEvaluation } from '../utils/types';

// ─── Mini score bar ───────────────────────────────────────────────────────────
function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const color = score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', width: 140, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 100, background: 'var(--surface-muted)', overflow: 'hidden', position: 'relative' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 100, background: color, boxShadow: `0 0 10px ${color}80` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay, duration: 1, type: 'spring', bounce: 0.2 }}
        />
      </div>
      <span style={{ fontSize: 13, fontWeight: 900, width: 32, textAlign: 'right', color }}>{score}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WarmupPage() {
  const { state } = useInterview();
  const navigate = useNavigate();

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis({ rate: 0.95, pitch: 1 });

  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported: micSupported,
    error: micError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ continuous: true, interimResults: true, confidenceThreshold: 0.3 });

  type Phase = 'greeting' | 'listening' | 'submitting' | 'feedback' | 'transitioning';
  const [phase, setPhase] = useState<Phase>('greeting');
  const [editedTranscript, setEditedTranscript] = useState('');
  const [warmupResult, setWarmupResult] = useState<WarmupEvaluation | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const session = state.session;
  const userName = session?.userName ?? 'there';
  const role = session?.role ?? 'Software Engineer';

  const greetingText = `Hi ${userName}! Welcome, and thanks for taking the time to interview today. I'm really looking forward to our conversation. To get started, could you just tell me a little about yourself — your background, what you've been working on, and what brings you to this ${role} role?`;

  useEffect(() => {
    if (transcript) setEditedTranscript(transcript);
  }, [transcript]);

  const handleToggleMic = useCallback(() => {
    if (isSpeaking) stopSpeaking();
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setEditedTranscript('');
      startListening();
      setPhase('listening');
    }
  }, [isListening, isSpeaking, startListening, stopListening, stopSpeaking, resetTranscript]);

  const handleSubmit = useCallback(async () => {
    if (!session || !editedTranscript.trim()) return;
    stopListening();
    stopSpeaking();
    setPhase('submitting');

    const metrics = computeSpeechMetrics(editedTranscript);

    try {
      const result = await evaluateWarmup(session.sessionId, {
        name: userName,
        transcript: editedTranscript,
        totalWords: metrics.totalWords,
        fluencyScore: metrics.fluencyScore,
      });
      setWarmupResult(result);
      setPhase('feedback');
    } catch {
      setWarmupResult({
        communicationClarity: 70,
        confidencePresence: 70,
        backgroundRelevance: 70,
        structureCoherence: 70,
        highlights: ['Good effort on your introduction'],
        suggestions: ['Be more specific about past projects next time'],
        transitionMessage: `Great to meet you, ${userName}! Let's get into the technical questions now.`,
      });
      setPhase('feedback');
    }
  }, [session, editedTranscript, userName, stopListening, stopSpeaking]);

  const handleStartInterview = useCallback(() => {
    if (!warmupResult) return;
    setPhase('transitioning');
    stopSpeaking();
    if (voiceEnabled) {
      speak(warmupResult.transitionMessage);
      const wordCount = warmupResult.transitionMessage.split(' ').length;
      const durationMs = Math.max(3000, wordCount * 420);
      setTimeout(() => navigate('/interview'), durationMs);
    } else {
      setTimeout(() => navigate('/interview'), 1500);
    }
  }, [warmupResult, voiceEnabled, speak, stopSpeaking, navigate]);

  const handleStartWarmup = useCallback(() => {
    setHasStarted(true);
    if (voiceEnabled) speak(greetingText);
  }, [voiceEnabled, speak, greetingText]);

  if (!session) return null;

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 64px)', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Dynamic Background */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%', width: '120%', height: '140%', zIndex: 0,
        background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(236,72,153,0.05) 0%, transparent 50%)',
        pointerEvents: 'none', filter: 'blur(80px)'
      }} />

      {/* ── Start Overlay ── */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)' }}
          >
            <div style={{ textAlign: 'center', maxWidth: 400, padding: 48, background: '#fff', borderRadius: 32, boxShadow: '0 30px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 24px', borderRadius: 24, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(99,102,241,0.3)' }}>
                <User size={36} color="#fff" strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.5px' }}>Introduction Phase</h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 }}>
                The AI interviewer will greet you and ask you to introduce yourself.
              </p>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(99,102,241,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartWarmup}
                style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'var(--primary)', color: '#fff', fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                Start Warmup <ChevronRight size={18} strokeWidth={2.5} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ width: '100%', maxWidth: 760, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.5px' }}>Interview Warmup</h1>
            <p style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 700, margin: '4px 0 0' }}>{role} • Introduction Phase</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) stopSpeaking(); }}
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface-solid)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
            title={voiceEnabled ? 'Mute AI voice' : 'Enable AI voice'}
          >
            {voiceEnabled ? <Volume2 size={18} color="var(--primary)" /> : <VolumeX size={18} color="var(--text-muted)" />}
          </motion.button>
        </motion.div>

        {/* ── AI Interviewer Greeting Chat Bubble ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, originX: 0, originY: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          style={{ alignSelf: 'flex-start', maxWidth: '85%' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <motion.div
              animate={isSpeaking ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 1.5, repeat: isSpeaking ? Infinity : 0 }}
              style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}
            >
              <Bot size={24} color="#fff" />
            </motion.div>
            <div style={{ background: 'var(--surface-solid)', padding: '20px 24px', borderRadius: '24px 24px 24px 4px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                {isSpeaking ? <><Sparkles size={12} className="animate-pulse" /> Speaking...</> : 'Interviewer'}
              </p>
              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{greetingText}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Transcript / Answer Area ── */}
        <AnimatePresence mode="wait">
          {(phase === 'greeting' || phase === 'listening') && (
            <motion.div
              key="answer-area"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
              transition={{ delay: 0.3 }}
              style={{ alignSelf: 'flex-end', width: '100%' }}
            >
              <div style={{ background: '#fff', padding: 24, borderRadius: '24px 4px 24px 24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Your Answer</p>
                <textarea
                  value={editedTranscript}
                  onChange={e => setEditedTranscript(e.target.value)}
                  placeholder="Your answer will appear here as you speak. You can also type or edit it directly..."
                  rows={4}
                  style={{ width: '100%', background: 'transparent', color: 'var(--text)', fontSize: 16, lineHeight: 1.6, fontWeight: 500, resize: 'none', outline: 'none', border: 'none' }}
                />
                {interimTranscript && (
                  <p style={{ fontSize: 15, color: 'var(--text-muted)', fontStyle: 'italic', margin: '8px 0 0' }}>{interimTranscript}...</p>
                )}
                {micError && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--danger-soft)', borderRadius: 8, color: 'var(--danger-text)', fontSize: 13, fontWeight: 600 }}>
                    {micError}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Controls ── */}
        <AnimatePresence mode="wait">
          {(phase === 'greeting' || phase === 'listening') && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 10 }}
            >
              {micSupported && (
                <div style={{ position: 'relative' }}>
                  {isListening && (
                    <motion.div
                      style={{ position: 'absolute', inset: -10, borderRadius: '50%', background: 'rgba(239,68,68,0.2)', zIndex: 0 }}
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleMic}
                    style={{
                      position: 'relative', zIndex: 1, width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: isListening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'var(--surface-solid)',
                      color: isListening ? '#fff' : 'var(--text)',
                      boxShadow: isListening ? '0 10px 30px rgba(239,68,68,0.4)' : '0 10px 20px rgba(0,0,0,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {isListening ? <MicOff size={28} strokeWidth={2.5} /> : <Mic size={28} strokeWidth={2.5} />}
                  </motion.button>
                </div>
              )}

              {editedTranscript.trim().length > 10 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(99,102,241,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  style={{
                    padding: '0 32px', height: 60, borderRadius: 30, background: 'var(--primary)', color: '#fff', fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 20px rgba(99,102,241,0.2)'
                  }}
                >
                  <Send size={18} strokeWidth={2.5} /> Submit Answer
                </motion.button>
              )}
            </motion.div>
          )}

          {phase === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 0' }}
            >
              <Loader2 size={40} className="animate-spin" color="var(--primary)" />
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Analyzing your introduction...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Warmup Feedback ── */}
        <AnimatePresence>
          {phase === 'feedback' && warmupResult && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 20 }}
            >
              <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.03)' }}>
                <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>Introduction Analysis</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <ScoreBar label="Communication Clarity"   score={warmupResult.communicationClarity}   delay={0.1} />
                  <ScoreBar label="Confidence & Presence"   score={warmupResult.confidencePresence}     delay={0.2} />
                  <ScoreBar label="Background Relevance"    score={warmupResult.backgroundRelevance}    delay={0.3} />
                  <ScoreBar label="Structure & Coherence"   score={warmupResult.structureCoherence}     delay={0.4} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {warmupResult.highlights?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ background: 'var(--success-soft)', borderRadius: 24, padding: 24, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <CheckCircle2 size={18} color="#10b981" strokeWidth={2.5} />
                      <p style={{ fontSize: 14, color: '#10b981', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>What went well</p>
                    </div>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
                      {warmupResult.highlights.map((h, i) => (
                        <li key={i} style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, display: 'flex', gap: 10 }}>
                          <span style={{ color: '#10b981', fontWeight: 900 }}>•</span> {h}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
                {warmupResult.suggestions?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ background: 'var(--warning-soft)', borderRadius: 24, padding: 24, border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <Lightbulb size={18} color="#f59e0b" strokeWidth={2.5} />
                      <p style={{ fontSize: 14, color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Quick Tips</p>
                    </div>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
                      {warmupResult.suggestions.map((s, i) => (
                        <li key={i} style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, display: 'flex', gap: 10 }}>
                          <span style={{ color: '#f59e0b', fontWeight: 900 }}>•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} style={{ alignSelf: 'flex-start', maxWidth: '85%', marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={20} color="#fff" />
                  </div>
                  <div style={{ background: 'var(--surface-solid)', padding: '16px 20px', borderRadius: '20px 20px 20px 4px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.5, margin: 0, fontStyle: 'italic', fontWeight: 500 }}>"{warmupResult.transitionMessage}"</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 15px 30px rgba(99,102,241,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartInterview}
                  style={{ padding: '0 40px', height: 64, borderRadius: 32, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontSize: 18, fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  Let's Start the Interview <ChevronRight size={22} strokeWidth={3} />
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {phase === 'transitioning' && (
            <motion.div
              key="transitioning"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '60px 0' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} color="var(--primary)" className="animate-spin" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', margin: '0 0 8px' }}>Moving to the interview...</p>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>Get ready for your technical questions</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(phase === 'greeting' || phase === 'listening') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => navigate('/interview')} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>
              Skip warmup and go straight to questions
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
