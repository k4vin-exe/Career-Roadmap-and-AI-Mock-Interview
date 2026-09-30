/**
 * WarmupPage — AI Interviewer Introduction & Self-Intro Phase
 *
 * Flow:
 *  1. AI greets the candidate by name and asks "Tell me about yourself"
 *  2. Candidate speaks their answer
 *  3. Submit → AI evaluates and shows warm feedback
 *  4. AI speaks transition message → navigate to /interview
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
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { computeSpeechMetrics } from '../utils/speechMetrics';
import { evaluateWarmup } from '../services/api';
import type { WarmupEvaluation } from '../utils/types';

// ─── Mini score bar ───────────────────────────────────────────────────────────
function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 55 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-40 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay, duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WarmupPage() {
  const { state } = useInterview();
  const navigate = useNavigate();

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis({ rate: 0.88, pitch: 0.95 });

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

  // ── State ──────────────────────────────────────────────────────────────────
  type Phase = 'greeting' | 'listening' | 'submitting' | 'feedback' | 'transitioning';
  const [phase, setPhase] = useState<Phase>('greeting');
  const [editedTranscript, setEditedTranscript] = useState('');
  const [warmupResult, setWarmupResult] = useState<WarmupEvaluation | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasGreeted, setHasGreeted] = useState(false);
  const hasGreetedRef = useRef(false);

  const session = state.session;
  const userName = session?.userName ?? 'there';
  const role = session?.role ?? 'Software Engineer';

  // ── Greeting message ───────────────────────────────────────────────────────
  const greetingText = `Hi ${userName}! Welcome, and thanks for taking the time to interview today. I'm really looking forward to our conversation. To get started, could you just tell me a little about yourself — your background, what you've been working on, and what brings you to this ${role} role?`;

  const [hasStarted, setHasStarted] = useState(false);

  // Keep editedTranscript in sync with live transcript
  useEffect(() => {
    if (transcript) setEditedTranscript(transcript);
  }, [transcript]);

  // ── Toggle mic ─────────────────────────────────────────────────────────────
  const handleToggleMic = useCallback(() => {
    if (isSpeaking) stopSpeaking(); // Stop AI so user can speak
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setEditedTranscript('');
      startListening();
      setPhase('listening');
    }
  }, [isListening, isSpeaking, startListening, stopListening, stopSpeaking, resetTranscript]);

  // ── Submit self-intro ──────────────────────────────────────────────────────
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
      // On error, still proceed with a default transition
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

  // ── Start interview after feedback ─────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-start py-10 px-4 md:px-6 relative"
      style={{ background: 'var(--bg)' }}>
      
      {/* ── Start Overlay ── */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
          >
            <div className="text-center space-y-6 max-w-sm px-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-soft flex items-center justify-center">
                <User size={28} className="text-accent-light" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Introduction Phase</h2>
                <p className="text-text-secondary text-sm leading-relaxed">
                  The AI interviewer will greet you and ask you to introduce yourself.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartWarmup}
                className="w-full btn btn-primary btn-lg justify-center"
              >
                Start Warmup
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-2xl space-y-6">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-text-primary">Interview Warmup</h1>
            <p className="text-xs text-text-muted mt-0.5">{role} · Introduction Phase</p>
          </div>
          <button
            onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) stopSpeaking(); }}
            className="p-2 rounded-xl bg-surface-solid border border-border shadow-sm hover:border-primary/20 transition-colors cursor-pointer"
            title={voiceEnabled ? 'Mute AI voice' : 'Enable AI voice'}
          >
            {voiceEnabled
              ? <Volume2 size={16} className="text-accent-light" />
              : <VolumeX size={16} className="text-text-muted" />}
          </button>
        </motion.div>

        {/* ── AI Interviewer Greeting Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card shadow-sm rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            {/* AI Avatar */}
            <div className="flex-shrink-0">
              <motion.div
                animate={isSpeaking ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-primary-text bg-primary-soft"
              >
                AI
              </motion.div>
            </div>
            <div>
              <p className="text-xs text-accent-light font-semibold mb-2 uppercase tracking-wide">
                {isSpeaking ? '🔊 Speaking…' : 'Interviewer'}
              </p>
              <p className="text-text-primary text-sm leading-relaxed">{greetingText}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Transcript / Answer Area ── */}
        <AnimatePresence mode="wait">
          {(phase === 'greeting' || phase === 'listening') && (
            <motion.div
              key="answer-area"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ delay: 0.2 }}
              className="card shadow-sm rounded-2xl p-5"
            >
              <p className="text-[11px] text-text-muted uppercase tracking-wide mb-3 font-semibold">Your Answer</p>

              {/* Editable transcript */}
              <textarea
                value={editedTranscript}
                onChange={e => setEditedTranscript(e.target.value)}
                placeholder="Your answer will appear here as you speak. You can also type or edit it directly."
                rows={5}
                className="w-full bg-transparent text-text-primary text-sm leading-relaxed resize-none outline-none placeholder:text-text-muted/50"
              />

              {/* Interim text */}
              {interimTranscript && (
                <p className="text-text-muted text-sm italic mt-1">{interimTranscript}…</p>
              )}

              {/* Error */}
              {micError && (
                <p className="text-error text-xs mt-2">{micError}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Controls ── */}
        <AnimatePresence mode="wait">
          {(phase === 'greeting' || phase === 'listening') && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-4"
            >
              {/* Mic button */}
              {micSupported && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleMic}
                  className="relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer"
                  style={{
                    background: isListening
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  }}
                >
                  {isListening && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '2px solid rgba(239,68,68,0.5)' }}
                      animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                  {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                </motion.button>
              )}

              {/* Submit button — only visible if there's text */}
              {editedTranscript.trim().length > 10 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Send size={15} />
                  Submit Answer
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Submitting spinner */}
          {phase === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <Loader2 size={28} className="animate-spin text-accent" />
              <p className="text-text-secondary text-sm">Analysing your introduction…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Warmup Feedback ── */}
        <AnimatePresence>
          {phase === 'feedback' && warmupResult && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Scores */}
              <div className="card shadow-sm rounded-2xl p-6">
                <p className="text-xs text-text-muted uppercase tracking-wide font-semibold mb-4">Introduction Analysis</p>
                <div className="space-y-3">
                  <ScoreBar label="Communication Clarity"   score={warmupResult.communicationClarity}   delay={0} />
                  <ScoreBar label="Confidence & Presence"   score={warmupResult.confidencePresence}     delay={0.05} />
                  <ScoreBar label="Background Relevance"    score={warmupResult.backgroundRelevance}    delay={0.1} />
                  <ScoreBar label="Structure & Coherence"   score={warmupResult.structureCoherence}     delay={0.15} />
                </div>
              </div>

              {/* Highlights */}
              {warmupResult.highlights?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card shadow-sm rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={15} className="text-success" />
                    <p className="text-xs text-success font-semibold uppercase tracking-wide">What went well</p>
                  </div>
                  <ul className="space-y-1.5">
                    {warmupResult.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Suggestions */}
              {warmupResult.suggestions?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="card shadow-sm rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={15} className="text-warning" />
                    <p className="text-xs text-warning font-semibold uppercase tracking-wide">Quick tips</p>
                  </div>
                  <ul className="space-y-1.5">
                    {warmupResult.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* AI transition message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card shadow-sm rounded-2xl p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent-light"
                    style={{ background: 'rgba(99,102,241,0.2)' }}>
                    AI
                  </div>
                  <p className="text-text-primary text-sm leading-relaxed italic">
                    "{warmupResult.transitionMessage}"
                  </p>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartInterview}
                  className="btn btn-primary btn-lg flex items-center gap-2"
                >
                  Let's Start the Interview
                  <ChevronRight size={16} />
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Transitioning */}
          {phase === 'transitioning' && (
            <motion.div
              key="transitioning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-2 border-transparent border-t-accent"
              />
              <div className="text-center">
                <p className="text-text-primary font-semibold mb-1">Moving to the interview…</p>
                <p className="text-text-muted text-sm">Get ready for your technical questions</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Skip option (for testing) ── */}
        {(phase === 'greeting' || phase === 'listening') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center"
          >
            <button
              onClick={() => navigate('/interview')}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer underline"
            >
              Skip warmup and go straight to questions
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}


