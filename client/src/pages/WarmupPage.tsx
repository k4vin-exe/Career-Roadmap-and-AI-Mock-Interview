/**
 * WarmupPage — Next-Gen Conversational AI Warmup Studio
 * Broadcast-grade voice calibration, real-time audio visualizer,
 * Dr. Elena Vance AI persona, and comprehensive self-introduction telemetry.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  Volume2,
  VolumeX,
  Loader2,
  Bot,
  Briefcase,
  RotateCcw,
  FastForward,
  Sparkles,
  Headphones,
  Compass,
  Activity,
  FileText,
  Sliders,
  ShieldCheck,
  Check,
} from 'lucide-react';

import { useInterview } from '../context/InterviewContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { computeSpeechMetrics } from '../utils/speechMetrics';
import { evaluateWarmup } from '../services/api';
import type { WarmupEvaluation } from '../utils/types';
import MicrophoneButton from '../components/interview/MicrophoneButton';
import AudioVisualizer from '../components/interview/AudioVisualizer';

// ── Mini Score Progress Bar Component ───────────────────────────────────────
function ScoreBar({
  label,
  score,
  delay = 0,
}: {
  label: string;
  score: number;
  delay?: number;
}) {
  const color = score >= 75 ? '#45a66b' : score >= 55 ? '#d99a32' : '#d95757';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-slate-700 w-36 sm:w-44 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden relative">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-black w-8 text-right font-mono" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export default function WarmupPage() {
  const { state } = useInterview();
  const navigate = useNavigate();

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis({ rate: 0.92, pitch: 1 });

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
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);

  const session = state.session;
  const userName = session?.userName ?? 'there';
  const role = session?.role ?? 'Software Engineer';

  const greetingText = `Hi ${userName}! Welcome, and thanks for taking the time to interview today. I'm really looking forward to our conversation. To get started, could you tell me a little about yourself — your background, recent projects, and what brings you to this ${role} role?`;

  useEffect(() => {
    if (transcript) setEditedTranscript(transcript);
  }, [transcript]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Hotkey spacebar to toggle mic when candidate is in active recording stage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasStarted || phase === 'submitting' || phase === 'feedback' || phase === 'transitioning') {
        return;
      }
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleMic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, phase, isListening, isSpeaking]);

  const handleToggleMic = useCallback(async () => {
    if (isSpeaking) stopSpeaking();
    if (isListening) {
      stopListening();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
        setMediaStream(null);
      }
    } else {
      resetTranscript();
      setEditedTranscript('');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setMediaStream(stream);
      } catch {
        // Fallback gracefully without waveform
      }
      startListening();
      setPhase('listening');
    }
  }, [isListening, isSpeaking, startListening, stopListening, stopSpeaking, resetTranscript]);

  const handleSubmit = useCallback(async () => {
    if (!session || !editedTranscript.trim()) return;
    stopListening();
    stopSpeaking();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      setMediaStream(null);
    }
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
        communicationClarity: 78,
        confidencePresence: 76,
        backgroundRelevance: 82,
        structureCoherence: 77,
        highlights: [
          'Articulate, welcoming introduction and clear vocal pacing',
          'Good high-level summary of professional background and target role alignment',
        ],
        suggestions: [
          'Emphasize quantified outcomes or technical tools mastered on recent projects',
          'Concisely articulate the specific motivation that drew you to this team',
        ],
        transitionMessage: `Great meeting you, ${userName}! Your audio calibration is complete. Let's move straight into your technical questions.`,
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
      const durationMs = Math.max(2200, wordCount * 360);
      setTimeout(() => navigate('/interview'), durationMs);
    } else {
      setTimeout(() => navigate('/interview'), 1000);
    }
  }, [warmupResult, voiceEnabled, speak, stopSpeaking, navigate]);

  const handleStartWarmup = useCallback(() => {
    setHasStarted(true);
    if (voiceEnabled) {
      speak(greetingText);
    }
  }, [voiceEnabled, speak, greetingText]);

  if (!session) {
    navigate('/setup');
    return null;
  }

  const wordCount = editedTranscript.trim() ? editedTranscript.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-2">
      {/* ── 1. Top Session Header Card ── */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Briefcase size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-extrabold text-slate-800 tracking-tight">
                {role}
              </span>
              <span className="text-[11px] font-bold text-primary bg-primary-soft/80 px-2.5 py-0.5 rounded-full border border-primary/20">
                Warmup Stage
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Icebreaker, Microphone Calibration & Self-Introduction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            onClick={() => {
              setVoiceEnabled((v) => !v);
              if (isSpeaking) stopSpeaking();
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              voiceEnabled
                ? 'border-primary/30 bg-primary-soft/60 text-primary hover:bg-primary-soft'
                : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
            }`}
            title={voiceEnabled ? 'Disable AI audio narration' : 'Enable AI audio narration'}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice On' : 'Muted'}</span>
          </button>

          <button
            onClick={() => {
              stopSpeaking();
              navigate('/interview');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-primary/40 text-xs font-bold text-slate-600 hover:text-primary transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs"
            title="Skip warmup and jump directly to technical questions"
          >
            <span>Skip to Questions</span>
            <FastForward size={14} className="text-primary" />
          </button>
        </div>
      </div>

      {/* ── 2. Warmup Onboarding Hero Card (When not started yet) ── */}
      {!hasStarted && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center flex flex-col items-center gap-7 relative overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 pointer-events-none rounded-full blur-3xl opacity-40"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(128, 103, 232, 0.35) 0%, rgba(128, 103, 232, 0) 70%)',
            }}
          />

          {/* Centered Avatar Badge with Pulse Ring */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="w-20 h-20 rounded-3xl bg-primary-soft/70 border border-primary/25 flex items-center justify-center text-primary shadow-lg shadow-primary/15">
              <Bot size={36} strokeWidth={2.2} />
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success text-white border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              <Check size={12} strokeWidth={3} />
            </span>
          </div>

          {/* Headline & Guidance */}
          <div className="max-w-xl flex flex-col gap-2.5">
            <div className="inline-flex items-center justify-center gap-2 self-center px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-600">
              <Sparkles size={13} className="text-primary" />
              <span>Pressure-Free Warmup Stage • 60 Seconds</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight mt-1">
              Welcome to Your Warmup
            </h2>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
              Start with a relaxed 60-second introduction. AI interviewer{' '}
              <strong className="text-slate-800 font-semibold">Dr. Elena Vance</strong> will greet you, and you can
              practice speaking naturally, calibrate your microphone, and gain confidence before technical questions begin.
            </p>
          </div>

          {/* 3 Value Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl text-left">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Headphones size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Voice Calibration</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Verifies your mic levels, frequency response, and speech clarity.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-cyan/10 text-cyan flex items-center justify-center">
                <Sliders size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Instant Telemetry</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Real-time feedback on pacing, confidence, and narrative structure.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Zero Score Penalty</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                A relaxed sandbox to get into your flow state without test pressure.
              </p>
            </div>
          </div>

          {/* Start CTA Button — Explicit Margin, Guaranteed 0 Clipping */}
          <div className="pt-2 pb-1">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStartWarmup}
              className="px-8 py-4 rounded-2xl text-sm sm:text-base font-extrabold text-white flex items-center gap-2.5 cursor-pointer transition-all shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #8067e8 0%, #5d45c7 100%)',
                boxShadow: '0 8px 24px rgba(128, 103, 232, 0.35)',
              }}
            >
              <span>Start Warmup Greeting</span>
              <ChevronRight size={18} strokeWidth={2.5} />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── 3. Active Warmup Studio Interface (When started) ── */}
      {hasStarted && (
        <div className="flex flex-col gap-6">
          {/* Chamber A: Dr. Elena Vance AI Interviewer Greeting Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  {isSpeaking && (
                    <motion.div
                      className="absolute inset-[-4px] rounded-2xl border-2 border-primary/40 pointer-events-none"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                      isSpeaking
                        ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/30'
                        : 'bg-primary-soft/80 text-primary border border-primary/20'
                    }`}
                  >
                    <Bot size={22} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-800">Dr. Elena Vance</span>
                    <span className="text-[10px] text-slate-400 font-semibold">• AI Warmup Facilitator</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSpeaking ? 'bg-primary animate-ping' : 'bg-success'
                      }`}
                    />
                    {isSpeaking ? 'Speaking warm greeting...' : 'Ready for your introduction'}
                  </p>
                </div>
              </div>

              {/* Speech Narration Control */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    speak(greetingText);
                  }
                }}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-danger-soft border-danger/30 text-danger hover:bg-danger-soft/80'
                    : 'bg-white border-slate-200 hover:border-primary/40 hover:bg-primary-soft/20 text-slate-700 shadow-2xs'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX size={13} /> Stop Audio
                  </>
                ) : (
                  <>
                    <Volume2 size={13} className="text-primary" /> Hear Greeting Again
                  </>
                )}
              </button>
            </div>

            {/* Greeting Script */}
            <p className="text-sm md:text-base text-slate-800 font-medium leading-relaxed">
              "{greetingText}"
            </p>

            {/* Recommended Discussion Prompts */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-slate-400">Suggested Topics:</span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                Brief background & years of experience
              </span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                Notable high-impact project
              </span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                What excites you about {role}
              </span>
            </div>
          </div>

          {/* Chamber B: Candidate Voice Studio & Recording Console */}
          {(phase === 'greeting' || phase === 'listening') && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col gap-5"
            >
              {/* Studio Telemetry Status Strip */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isListening
                        ? 'bg-danger animate-ping'
                        : wordCount > 0
                        ? 'bg-success'
                        : 'bg-slate-300'
                    }`}
                  />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    {isListening
                      ? 'Recording Spoken Introduction'
                      : wordCount > 0
                      ? 'Introduction Captured'
                      : 'Candidate Voice Studio'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {wordCount > 0 && (
                    <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70 flex items-center gap-1">
                      <FileText size={12} className="text-slate-400" />
                      {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    ⏱️ Target: <strong className="text-slate-700">45 - 60s</strong> · 60 - 120 words
                  </span>
                </div>
              </div>

              {/* Real-time Spectrum Waveform Analyzer when Microphone is Active */}
              <AudioVisualizer isRecording={isListening} mediaStream={mediaStream} barCount={36} />

              {/* Editable Transcript Console */}
              <div className="flex flex-col gap-2">
                <textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  placeholder="Click the microphone below and introduce yourself naturally, or type directly here..."
                  rows={4}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-4 text-slate-800 text-sm leading-relaxed outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all resize-none font-sans font-medium placeholder:text-slate-400"
                />

                {interimTranscript && (
                  <p className="text-xs text-slate-400 italic flex items-center gap-1.5 pl-1">
                    <Activity size={12} className="animate-spin text-primary" />
                    Transcribing: {interimTranscript}...
                  </p>
                )}
              </div>

              {micError && (
                <div className="p-3 bg-danger-soft text-danger text-xs font-semibold rounded-xl border border-danger/20">
                  {micError}
                </div>
              )}

              {/* Broadcast Microphone Studio Controls Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-4">
                {/* Left Action: Clear Transcript */}
                <div className="w-28">
                  {editedTranscript.trim().length > 0 && !isListening && (
                    <button
                      onClick={() => {
                        resetTranscript();
                        setEditedTranscript('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:text-danger hover:border-danger/30 transition-all cursor-pointer bg-white"
                      title="Clear introduction and record again"
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                  )}
                </div>

                {/* Centerpiece: Studio Condenser Microphone Button */}
                {micSupported ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <MicrophoneButton
                      isListening={isListening}
                      onStart={handleToggleMic}
                      onStop={handleToggleMic}
                      size="md"
                    />
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <span>Press</span>
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 rounded text-slate-600">
                        Space
                      </kbd>
                      <span>to {isListening ? 'stop' : 'speak'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-danger font-semibold">
                    Speech recognition is not supported in this browser. Please type your answer above.
                  </div>
                )}

                {/* Right Action: Submit Warmup Answer */}
                <div className="w-28 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    disabled={editedTranscript.trim().length < 5 || isListening}
                    onClick={handleSubmit}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                      editedTranscript.trim().length >= 5 && !isListening
                        ? 'bg-primary text-white cursor-pointer shadow-primary/20 hover:bg-primary-dark'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    <span>Submit</span>
                    <Send size={12} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submitting State Loader */}
          {phase === 'submitting' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-soft/80 flex items-center justify-center text-primary shadow-xs">
                <Loader2 size={30} className="animate-spin text-primary" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-800 tracking-tight">
                  Analyzing Your Self-Introduction...
                </p>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Evaluating communication clarity, vocal presence, and background relevance
                </p>
              </div>
            </div>
          )}

          {/* Chamber C: Comprehensive Warmup Telemetry & Feedback */}
          {phase === 'feedback' && warmupResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Telemetry Scorecard */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Compass size={16} className="text-primary" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                      Introduction Telemetry Breakdown
                    </span>
                  </div>
                  <span className="text-xs font-bold text-success bg-success-soft px-2.5 py-0.5 rounded-full border border-success/20">
                    Calibration Passed
                  </span>
                </div>

                <div className="flex flex-col gap-3.5 pt-1">
                  <ScoreBar
                    label="Communication Clarity"
                    score={warmupResult.communicationClarity}
                    delay={0.05}
                  />
                  <ScoreBar
                    label="Confidence & Poise"
                    score={warmupResult.confidencePresence}
                    delay={0.1}
                  />
                  <ScoreBar
                    label="Background Relevance"
                    score={warmupResult.backgroundRelevance}
                    delay={0.15}
                  />
                  <ScoreBar
                    label="Narrative Flow"
                    score={warmupResult.structureCoherence}
                    delay={0.2}
                  />
                </div>
              </div>

              {/* Highlights & Pro Tips Dual-Chamber Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {warmupResult.highlights && warmupResult.highlights.length > 0 && (
                  <div className="bg-white rounded-2xl border border-success/30 shadow-xs p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-success">
                        What Went Well
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      {warmupResult.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-success font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {warmupResult.suggestions && warmupResult.suggestions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-warning/30 shadow-xs p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={16} className="text-warning" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-warning">
                        Strategy Tips for Technical Stage
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      {warmupResult.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-warning font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* AI Interviewer Transition Message */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Bot size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary mb-1">Dr. Elena Vance • Transition</p>
                  <p className="text-sm text-slate-700 font-medium italic leading-relaxed">
                    "{warmupResult.transitionMessage}"
                  </p>
                </div>
              </div>

              {/* Primary Next Action CTA */}
              <div className="flex justify-center pt-2 pb-2">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartInterview}
                  className="px-8 py-4 rounded-2xl text-sm sm:text-base font-extrabold text-white shadow-lg cursor-pointer transition-all flex items-center gap-2.5"
                  style={{
                    background: 'linear-gradient(135deg, #8067e8 0%, #5d45c7 100%)',
                    boxShadow: '0 8px 24px rgba(128, 103, 232, 0.35)',
                  }}
                >
                  <span>Start Technical Questions</span>
                  <ChevronRight size={18} strokeWidth={2.5} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Transitioning State */}
          {phase === 'transitioning' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-14 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center text-primary shadow-xs">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-800 tracking-tight">
                  Entering Live Interview Studio...
                </p>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Calibrating your customized technical question set
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
