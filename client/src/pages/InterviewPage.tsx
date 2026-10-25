/**
 * InterviewPage — Ultra-Aesthetic, Minimalist AI Technical Interview Suite
 * Impeccably balanced single-stage flow, elegant typography, integrated interviewer persona,
 * live telemetry HUD, real-time audio visualizer, spacebar hotkey, and pristine alignment.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Volume2,
  VolumeX,
  Clock,
  Loader2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Bot,
  Lightbulb,
  CheckCircle2,
  Briefcase,
  Layers,
  Edit3,
  Check,
  RotateCcw,
  Gauge,
  FileText,
  Keyboard,
} from 'lucide-react';

import { useInterview } from '../context/InterviewContext';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { computeSpeechMetrics, detectFillerWords } from '../utils/speechMetrics';
import { submitAnswer, generateReport } from '../services/api';

import MicrophoneButton from '../components/interview/MicrophoneButton';
import EvaluationCard, { type ExtendedEvaluationData } from '../components/interview/EvaluationCard';
import AudioVisualizer from '../components/interview/AudioVisualizer';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function InterviewPage() {
  const { state, dispatch } = useInterview();
  const navigate = useNavigate();

  const {
    transcript,
    isRecording: isListening,
    isTranscribing,
    mediaStream,
    error: micError,
    startRecording: startListening,
    stopRecording: stopListening,
    resetTranscript,
  } = useAudioRecording();

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis({ rate: 0.88, pitch: 0.95 });

  const [editedTranscript, setEditedTranscript] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<ExtendedEvaluationData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasSpokenQuestion, setHasSpokenQuestion] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const showEvaluation = state.status === 'feedback';
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;

  useEffect(() => {
    if (!state.session) navigate('/setup');
  }, [state.session, navigate]);

  // Elapsed Question Timer
  useEffect(() => {
    if (showEvaluation) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setElapsedSeconds(0);
    setQuestionStartTime(Date.now());
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.currentQuestionIndex, showEvaluation]);

  // Auto-speak question on load
  useEffect(() => {
    if (!currentQuestion || hasSpokenQuestion) return;
    const timeout = setTimeout(() => {
      if (voiceEnabled) speak(currentQuestion.text);
      setHasSpokenQuestion(true);
      resetTranscript();
      setEditedTranscript('');
      setIsEditingTranscript(false);
      setEvaluation(null);
      setSubmitError(null);
      setShowTip(false);
      dispatch({ type: 'START_QUESTION' });
    }, 600);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentQuestionIndex]);

  // Keep editedTranscript in sync with live speech transcript
  useEffect(() => {
    if (transcript) setEditedTranscript(transcript);
  }, [transcript]);

  // Spacebar hotkey to toggle recording when not editing text
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showEvaluation || isSubmitting || isTranscribing) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (isListening) {
          stopListening();
        } else {
          if (isSpeaking) stopSpeaking();
          startListening();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, isSpeaking, isSubmitting, isTranscribing, showEvaluation, startListening, stopListening, stopSpeaking]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!state.session || !currentQuestion) return;
    setIsSubmitting(true);
    setSubmitError(null);
    stopListening();
    stopSpeaking();

    const questionDuration = Math.round((Date.now() - questionStartTime) / 1000);
    const metrics = computeSpeechMetrics(editedTranscript, questionDuration);

    try {
      const result = await submitAnswer(state.session.sessionId, {
        questionIndex: currentQuestion.index,
        transcript,
        editedTranscript,
        totalWords: metrics.totalWords,
        fillerWords: metrics.fillerWords,
        fillerWordCount: metrics.fillerWordCount,
        repeatedWords: metrics.repeatedWords,
        repeatedWordCount: metrics.repeatedWordCount,
        fluencyScore: metrics.fluencyScore,
        questionDuration,
      });

      const evalData = result.evaluation as any;
      setEvaluation({
        technicalAccuracy: evalData.technicalAccuracy ?? 7.5,
        communication: evalData.communication ?? 8,
        completeness: evalData.completeness ?? 7,
        problemSolving: evalData.problemSolving ?? 8,
        deliveryScore: evalData.deliveryScore ?? 8,
        pacingFeedback: evalData.pacingFeedback,
        fillerFeedback: evalData.fillerFeedback,
        structureFeedback: evalData.structureFeedback,
        strengths: evalData.strengths || [],
        weaknesses: evalData.weaknesses || [],
        missingConcepts: evalData.missingConcepts || [],
        idealAnswer: evalData.idealAnswer || '',
        suggestions: evalData.suggestions || [],
        encouragingFeedback: evalData.encouragingFeedback || evalData.feedback || '',
        feedback: evalData.encouragingFeedback || evalData.feedback || 'Good effort on this answer.',
        expectedPoints: evalData.strengths ?? evalData.expectedPoints ?? [],
        // Spoken delivery analytics
        transcript: editedTranscript || transcript,
        totalWords: metrics.totalWords,
        fillerWords: metrics.fillerWords,
        fillerWordCount: metrics.fillerWordCount,
        fluencyScore: metrics.fluencyScore,
        questionDuration,
        wordsPerMinute: metrics.wordsPerMinute,
        pacingRating: metrics.pacingRating,
      });

      dispatch({
        type: 'SUBMIT_ANSWER',
        payload: {
          questionIndex: currentQuestion.index,
          transcript,
          editedTranscript,
          evaluation: result.evaluation,
          ...metrics,
          questionDuration,
        },
      });
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    state.session,
    currentQuestion,
    editedTranscript,
    transcript,
    questionStartTime,
    stopListening,
    stopSpeaking,
    dispatch,
  ]);

  const handleNext = useCallback(async () => {
    if (isLastQuestion) {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await generateReport(state.session!.sessionId);
      } catch (_) {}
      dispatch({ type: 'COMPLETE_INTERVIEW' });
      navigate(`/report/${state.session!.sessionId}`);
    } else {
      setHasSpokenQuestion(false);
      resetTranscript();
      setEditedTranscript('');
      setIsEditingTranscript(false);
      setEvaluation(null);
      setShowTip(false);
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }, [isLastQuestion, state.session, dispatch, navigate, resetTranscript]);

  if (!state.session || !currentQuestion) return null;

  const currentAnswerText = isEditingTranscript ? editedTranscript : (editedTranscript || transcript);
  const wordCount = currentAnswerText.trim() ? currentAnswerText.trim().split(/\s+/).length : 0;
  const fillers = detectFillerWords(currentAnswerText);
  const progressPct = ((state.currentQuestionIndex + (showEvaluation ? 1 : 0)) / state.questions.length) * 100;

  // Real-time speaking pace estimate
  const currentWpm = elapsedSeconds > 4 && wordCount > 0 ? Math.round((wordCount / elapsedSeconds) * 60) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 py-1">
      {/* ── 1. HUD: Session Header & Stepper Bar ── */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Role Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Briefcase size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-800 tracking-tight">
                  {state.session.role}
                </span>
                <span className="text-[11px] font-bold text-primary bg-primary-soft/60 px-2 py-0.5 rounded-md border border-primary/20">
                  {state.session.experience}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">AI Mock Interview Session</p>
            </div>
          </div>

          {/* Center: Minimalist Step Dots/Pills */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/70">
            {state.questions.map((_, idx) => {
              const isPast = idx < state.currentQuestionIndex;
              const isCurrent = idx === state.currentQuestionIndex;
              return (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                    isCurrent
                      ? 'bg-primary text-white shadow-xs scale-105'
                      : isPast
                      ? 'bg-success-soft text-success border border-success/30'
                      : 'text-slate-400 bg-white'
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {isPast ? <CheckCircle2 size={12} strokeWidth={3} /> : idx + 1}
                </div>
              );
            })}
          </div>

          {/* Right: Audio Narration, Chronometer & Question Indicator */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Audio Speech Toggle */}
            <button
              id="voice-toggle-btn"
              onClick={() => {
                setVoiceEnabled((v) => !v);
                if (isSpeaking) stopSpeaking();
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                voiceEnabled
                  ? 'border-primary/30 bg-primary-soft/50 text-primary hover:bg-primary-soft'
                  : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
              }`}
              title={voiceEnabled ? 'Disable AI voice speech' : 'Enable AI voice speech'}
            >
              {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Timer */}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg">
              <Clock size={12} className="text-slate-400" />
              <span className="text-xs font-mono font-bold text-slate-700">
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            {/* Step Counter */}
            <div className="text-right pl-1">
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black leading-none">
                QUESTION
              </p>
              <p className="text-xs font-black text-primary leading-tight">
                {state.currentQuestionIndex + 1}
                <span className="text-[10px] text-slate-400 font-bold">/{state.questions.length}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #8067e8 0%, #0ea5c9 50%, #45a66b 100%)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── QUESTION & STUDIO STAGE ── */}
        {!showEvaluation && (
          <motion.div
            key={`q-${state.currentQuestionIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5 w-full"
          >
            {/* ── 2. Unified Hero Question Card ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-7 flex flex-col gap-4 relative overflow-hidden">
              {/* Card Top: Interviewer Persona + Category & Difficulty Badges */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 flex-wrap">
                {/* Interviewer Persona */}
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    {isSpeaking && (
                      <motion.div
                        className="absolute inset-[-4px] rounded-xl border border-primary/40 pointer-events-none"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                        isSpeaking
                          ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-xs'
                          : 'bg-primary-soft/80 text-primary border border-primary/20'
                      }`}
                    >
                      <Bot size={16} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-800">Dr. Elena Vance</span>
                      <span className="text-[10px] text-slate-400 font-semibold">• AI Evaluator</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSpeaking ? 'bg-primary animate-ping' : 'bg-success'
                        }`}
                      />
                      {isSpeaking ? 'Reading question aloud...' : 'Active listener'}
                    </p>
                  </div>
                </div>

                {/* Right Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      currentQuestion.difficulty.toLowerCase() === 'easy'
                        ? 'bg-success-soft text-success border-success/30'
                        : currentQuestion.difficulty.toLowerCase() === 'medium'
                        ? 'bg-warning-soft text-warning border-warning/30'
                        : 'bg-danger-soft text-danger border-danger/30'
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Layers size={12} className="text-cyan" />
                    {currentQuestion.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                    {currentQuestion.type}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 leading-snug tracking-tight">
                {currentQuestion.text}
              </h2>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="replay-question-btn"
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking();
                      } else {
                        speak(currentQuestion.text);
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
                        <VolumeX size={13} /> Stop Reading
                      </>
                    ) : (
                      <>
                        <Volume2 size={13} className="text-primary" /> Hear Question
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTip((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                  >
                    <Lightbulb size={13} className="text-warning" />
                    <span>{showTip ? 'Hide Strategy Tip' : 'Strategy Tip'}</span>
                  </button>
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  ⏱️ Target: <strong className="text-slate-700">60 - 90s</strong> · 100 - 200 words
                </span>
              </div>

              {/* Collapsible Strategy Tip Drawer */}
              <AnimatePresence>
                {showTip && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 rounded-xl bg-warning-soft/40 border border-warning/30 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                      <Sparkles size={15} className="text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Interviewer Strategy:</strong> For{' '}
                        {currentQuestion.type} questions, outline the foundational definition first, step
                        through operational mechanics or branch workflow, and conclude with real-world edge-case trade-offs.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error alerts */}
            {micError && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger-soft border border-danger/20 text-danger text-xs font-semibold">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{micError}</span>
              </div>
            )}
            {submitError && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger-soft border border-danger/20 text-danger text-xs font-semibold">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* ── 3. Unified Candidate Answer & Studio Console ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col gap-4">
              {/* Console Header Bar with Live Telemetry Badges */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isListening
                        ? 'bg-danger animate-ping'
                        : isTranscribing
                        ? 'bg-primary animate-pulse'
                        : wordCount > 0
                        ? 'bg-success'
                        : 'bg-slate-300'
                    }`}
                  />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {isListening
                      ? 'Recording Spoken Response'
                      : isTranscribing
                      ? 'Whisper AI Transcribing...'
                      : wordCount > 0
                      ? 'Response Captured'
                      : 'Voice Studio Ready'}
                  </span>
                </div>

                {/* Telemetry Metrics Strip */}
                <div className="flex items-center gap-2">
                  {wordCount > 0 && (
                    <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70 flex items-center gap-1">
                      <FileText size={12} className="text-slate-400" />
                      {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </span>
                  )}

                  {currentWpm > 0 && (
                    <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70 flex items-center gap-1">
                      <Gauge size={12} className="text-primary" />
                      {currentWpm} WPM
                    </span>
                  )}

                  {wordCount > 0 && (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        fillers.length === 0
                          ? 'bg-success-soft text-success border-success/20'
                          : 'bg-warning-soft text-warning border-warning/20'
                      }`}
                    >
                      {fillers.length === 0 ? '0 fillers' : `${fillers.length} filler${fillers.length > 1 ? 's' : ''}`}
                    </span>
                  )}

                  {/* Edit Toggle */}
                  {currentAnswerText.trim().length > 0 && !isListening && !isTranscribing && (
                    <button
                      onClick={() => setIsEditingTranscript((e) => !e)}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer ml-1"
                    >
                      {isEditingTranscript ? (
                        <>
                          <Check size={12} strokeWidth={3} /> Done
                        </>
                      ) : (
                        <>
                          <Edit3 size={12} strokeWidth={2.5} /> Edit
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Real-time Dynamic Spectrum Analyzer (active during recording) */}
              {isListening && (
                <div className="w-full flex flex-col items-center py-1">
                  <AudioVisualizer isRecording={isListening} mediaStream={mediaStream} />
                </div>
              )}

              {/* Transcript Viewport */}
              <div className="min-h-[110px] flex flex-col justify-center">
                {isTranscribing ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                    <Loader2 size={22} className="animate-spin text-primary" />
                    <p className="text-xs font-bold text-slate-700">Whisper AI is processing your speech...</p>
                    <p className="text-[11px] text-slate-400">Transcribing technical terminology and formatting</p>
                  </div>
                ) : isEditingTranscript ? (
                  <textarea
                    value={editedTranscript}
                    onChange={(e) => setEditedTranscript(e.target.value)}
                    autoFocus
                    className="w-full h-28 bg-slate-50 border-2 border-primary/40 rounded-xl p-3 text-slate-800 text-sm leading-relaxed outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all resize-none font-sans font-medium"
                    placeholder="Refine or add to your transcribed answer..."
                  />
                ) : currentAnswerText.trim().length > 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 text-slate-800 text-sm leading-relaxed font-sans max-h-44 overflow-y-auto">
                    <p>{currentAnswerText}</p>
                    {isListening && (
                      <motion.span
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="inline-block w-2 h-4 bg-primary ml-1 rounded-full align-middle"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-5 text-center">
                    <p className="text-sm font-bold text-slate-700 mb-0.5">
                      {isSpeaking ? 'AI Interviewer is speaking...' : 'Click Speak to Record Your Answer'}
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Speak naturally and clearly. Click the purple mic below or press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-600">Spacebar</kbd>.
                    </p>
                  </div>
                )}
              </div>

              {/* Studio Bottom Action Deck */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {/* Left: Clear Action */}
                <div className="w-24 flex justify-start">
                  <AnimatePresence>
                    {currentAnswerText.trim().length > 0 && !isListening && (
                      <motion.button
                        id="clear-transcript-btn"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => {
                          resetTranscript();
                          setEditedTranscript('');
                          setIsEditingTranscript(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:text-danger hover:border-danger/30 transition-all cursor-pointer"
                        title="Discard and restart answer"
                      >
                        <RotateCcw size={12} /> Clear
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Center: Prominent Microphone Hub with Hotkey Hint */}
                <div className="flex flex-col items-center gap-1.5">
                  <MicrophoneButton
                    isListening={isListening}
                    isDisabled={isSubmitting || isTranscribing}
                    onStart={() => {
                      if (isSpeaking) stopSpeaking();
                      startListening();
                    }}
                    onStop={stopListening}
                    size="md"
                  />
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 select-none pb-1">
                    <Keyboard size={11} />
                    <span>{isListening ? 'Click or Space to Stop' : 'Click or Press Space'}</span>
                  </div>
                </div>

                {/* Right: Submit Button */}
                <div className="w-24 flex justify-end">
                  <AnimatePresence>
                    {currentAnswerText.trim().length > 5 && !isListening && (
                      <motion.button
                        id="submit-answer-btn"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={handleSubmitAnswer}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl font-bold text-xs text-white shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #8067e8 0%, #5d45c7 100%)',
                          boxShadow: '0 6px 16px rgba(128, 103, 232, 0.35)',
                        }}
                        whileHover={!isSubmitting ? { scale: 1.05, y: -1 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> Evaluating
                          </>
                        ) : (
                          <>
                            Submit <ChevronRight size={13} strokeWidth={2.5} />
                          </>
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── EVALUATION STAGE ── */}
        {showEvaluation && evaluation && (
          <motion.div
            key={`eval-${state.currentQuestionIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <EvaluationCard
              evaluation={evaluation}
              onNext={handleNext}
              isLastQuestion={isLastQuestion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
