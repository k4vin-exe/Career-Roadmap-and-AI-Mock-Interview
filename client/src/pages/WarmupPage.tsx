/**
 * WarmupPage — Conversational AI Interview Warmup
 * Cohesive single-column studio layout, interactive voice capture,
 * speech telemetry, and structured introduction feedback.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Bot,
  Briefcase,
  RotateCcw,
  FastForward,
} from 'lucide-react';

import { useInterview } from '../context/InterviewContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { computeSpeechMetrics } from '../utils/speechMetrics';
import { evaluateWarmup } from '../services/api';
import type { WarmupEvaluation } from '../utils/types';

// ── Mini Score Progress Bar ───────────────────────────────────────────────
function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const color = score >= 75 ? '#45a66b' : score >= 55 ? '#d99a32' : '#d95757';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-slate-700 w-36 sm:w-44 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden relative">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-black w-8 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

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

  const greetingText = `Hi ${userName}! Welcome, and thanks for taking the time to interview today. I'm really looking forward to our conversation. To get started, could you tell me a little about yourself — your background, recent projects, and what brings you to this ${role} role?`;

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
        communicationClarity: 75,
        confidencePresence: 75,
        backgroundRelevance: 80,
        structureCoherence: 75,
        highlights: ['Clear and friendly self-introduction', 'Relevant career highlights mentioned'],
        suggestions: ['Quantify project impact with measurable outcomes', 'Connect past work directly to the target role requirements'],
        transitionMessage: `Great to meet you, ${userName}! Now let's dive right into your technical questions.`,
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
      const durationMs = Math.max(2500, wordCount * 380);
      setTimeout(() => navigate('/interview'), durationMs);
    } else {
      setTimeout(() => navigate('/interview'), 1200);
    }
  }, [warmupResult, voiceEnabled, speak, stopSpeaking, navigate]);

  const handleStartWarmup = useCallback(() => {
    setHasStarted(true);
    if (voiceEnabled) speak(greetingText);
  }, [voiceEnabled, speak, greetingText]);

  if (!session) {
    navigate('/setup');
    return null;
  }

  const wordCount = editedTranscript.trim() ? editedTranscript.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-2">
      {/* ── Top Session Header Card ── */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 md:p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Briefcase size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">{role}</span>
              <span className="text-[11px] font-semibold text-primary bg-primary-soft/60 px-2 py-0.5 rounded-md border border-primary/20">
                Warmup Stage
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Icebreaker & Self-Introduction</p>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => {
              setVoiceEnabled((v) => !v);
              if (isSpeaking) stopSpeaking();
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              voiceEnabled
                ? 'border-primary/30 bg-primary-soft/60 text-primary hover:bg-primary-soft'
                : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
            }`}
            title={voiceEnabled ? 'Disable AI voice narration' : 'Enable AI voice narration'}
          >
            {voiceEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>

          <button
            onClick={() => {
              stopSpeaking();
              navigate('/interview');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-primary/30 text-xs font-bold text-slate-600 hover:text-primary transition-all cursor-pointer bg-white"
            title="Skip warmup and jump to technical questions"
          >
            <FastForward size={13} /> Skip to Questions
          </button>
        </div>
      </div>

      {/* ── Warmup Onboarding Card (If not started yet) ── */}
      {!hasStarted && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 text-center flex flex-col items-center gap-5 relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-md shadow-primary/30">
            <User size={30} strokeWidth={2.2} />
          </div>

          <div className="max-w-md">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
              Welcome to Your Warmup
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Start with a relaxed 60-second introduction. The AI interviewer will greet you, and you can practice
              speaking naturally before tackling technical questions.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStartWarmup}
            className="px-8 py-3.5 rounded-xl text-sm font-extrabold text-white shadow-md flex items-center gap-2 cursor-pointer transition-all"
            style={{
              background: 'linear-gradient(135deg, #8067e8 0%, #5d45c7 100%)',
              boxShadow: '0 8px 20px rgba(128, 103, 232, 0.35)',
            }}
          >
            Start Warmup Greeting <ChevronRight size={16} strokeWidth={2.5} />
          </motion.button>
        </motion.div>
      )}

      {/* ── Active Warmup Interface ── */}
      {hasStarted && (
        <div className="flex flex-col gap-6">
          {/* AI Interviewer Greeting Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="relative flex items-center justify-center">
                {isSpeaking && (
                  <motion.div
                    className="absolute inset-[-4px] rounded-2xl border-2 border-primary/40 pointer-events-none"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.2, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                    isSpeaking
                      ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/30'
                      : 'bg-primary-soft/80 text-primary border border-primary/20'
                  }`}
                >
                  <Bot size={22} />
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-black text-primary uppercase tracking-wider">
                  AI Interviewer
                </span>
                {isSpeaking && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-primary animate-pulse">
                    <Sparkles size={11} /> Speaking...
                  </span>
                )}
              </div>
              <p className="text-sm md:text-base text-slate-800 font-medium leading-relaxed">
                {greetingText}
              </p>
            </div>
          </div>

          {/* Candidate Introduction Response Console */}
          {(phase === 'greeting' || phase === 'listening') && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Your Introduction
                </span>
                {wordCount > 0 && (
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </span>
                )}
              </div>

              <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                placeholder="Speak your introduction or type directly here..."
                rows={4}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-800 text-sm leading-relaxed outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all resize-none font-sans font-medium"
              />

              {interimTranscript && (
                <p className="text-xs text-slate-400 italic">
                  Transcribing: {interimTranscript}...
                </p>
              )}

              {micError && (
                <div className="p-2.5 bg-danger-soft text-danger text-xs font-semibold rounded-xl border border-danger/20">
                  {micError}
                </div>
              )}

              {/* Console Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="w-24">
                  {editedTranscript.trim().length > 0 && !isListening && (
                    <button
                      onClick={() => {
                        resetTranscript();
                        setEditedTranscript('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:text-danger hover:border-danger/30 transition-all cursor-pointer"
                    >
                      <RotateCcw size={12} /> Clear
                    </button>
                  )}
                </div>

                {/* Microphone Toggle */}
                {micSupported && (
                  <div className="flex flex-col items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={handleToggleMic}
                      className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer border-none transition-all shadow-md ${
                        isListening
                          ? 'bg-danger text-white shadow-danger/30'
                          : 'bg-primary text-white shadow-primary/30'
                      }`}
                      title={isListening ? 'Click to stop speaking' : 'Click to start speaking'}
                    >
                      {isListening ? <MicOff size={22} strokeWidth={2.4} /> : <Mic size={22} strokeWidth={2.4} />}
                    </motion.button>
                    <span className="text-[11px] font-bold text-slate-400">
                      {isListening ? 'Stop' : 'Speak'}
                    </span>
                  </div>
                )}

                {/* Submit Answer */}
                <div className="w-24 flex justify-end">
                  {editedTranscript.trim().length > 5 && !isListening && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
                    >
                      <Send size={12} /> Submit
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Submitting State */}
          {phase === 'submitting' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-10 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm font-bold text-slate-800">Analyzing your introduction...</p>
              <p className="text-xs text-slate-400">Evaluating clarity, poise, and background alignment</p>
            </div>
          )}

          {/* Warmup Feedback */}
          {phase === 'feedback' && warmupResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-5"
            >
              {/* Score breakdown card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col gap-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  Introduction Telemetry
                </span>
                <div className="flex flex-col gap-3">
                  <ScoreBar label="Communication Clarity" score={warmupResult.communicationClarity} delay={0.05} />
                  <ScoreBar label="Confidence & Poise" score={warmupResult.confidencePresence} delay={0.1} />
                  <ScoreBar label="Background Relevance" score={warmupResult.backgroundRelevance} delay={0.15} />
                  <ScoreBar label="Narrative Flow" score={warmupResult.structureCoherence} delay={0.2} />
                </div>
              </div>

              {/* Highlights & Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {warmupResult.highlights && warmupResult.highlights.length > 0 && (
                  <div className="bg-white rounded-2xl border border-success/30 shadow-xs p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 size={16} className="text-success" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-success">
                        What Went Well
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {warmupResult.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-success font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {warmupResult.suggestions && warmupResult.suggestions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-warning/30 shadow-xs p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={16} className="text-warning" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-warning">
                        Quick Interview Tips
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {warmupResult.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-warning font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* AI Interviewer Transition Message */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                  <Bot size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary mb-1">Interviewer Transition</p>
                  <p className="text-sm text-slate-700 font-medium italic">
                    "{warmupResult.transitionMessage}"
                  </p>
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-center pt-2">
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleStartInterview}
                  className="px-8 py-3.5 rounded-2xl text-sm font-extrabold text-white shadow-lg cursor-pointer transition-all flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #8067e8 0%, #5d45c7 100%)',
                    boxShadow: '0 8px 24px rgba(128, 103, 232, 0.35)',
                  }}
                >
                  Start Technical Questions <ChevronRight size={18} strokeWidth={2.5} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Transitioning state */}
          {phase === 'transitioning' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 size={36} className="animate-spin text-primary" />
              <p className="text-base font-bold text-slate-800">Transitioning to live interview...</p>
              <p className="text-xs text-slate-400">Loading your customized question set</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
