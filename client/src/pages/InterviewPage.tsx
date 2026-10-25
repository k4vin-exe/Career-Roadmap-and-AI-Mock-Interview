/**
 * InterviewPage — Next-Level AI Technical Interview Studio
 * Dual-chamber broadcast studio cockpit, neural persona avatar,
 * real-time speech telemetry (WPM, fluency, fillers), live soundwave FFT visualizer,
 * spacebar hotkey capture, and comprehensive spoken answer evaluation.
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

  // Spacebar hotkey to toggle recording when not typing in an input
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
  const estimatedFluency = Math.max(60, Math.min(98, 100 - fillers.length * 7));

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-2">
      {/* ── Executive HUD Bar ── */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 md:px-6 md:py-4 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Candidate & Role Pill */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
              <Briefcase size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-slate-800 tracking-tight truncate">
                  {state.session.role}
                </span>
                <span className="text-[11px] font-bold text-primary bg-primary-soft/70 px-2.5 py-0.5 rounded-full border border-primary/20">
                  {state.session.experience}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold tracking-wide">
                AI Technical Interview Chamber
              </p>
            </div>
          </div>

          {/* Center: Stepper Numbered Pills */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
            {state.questions.map((_, idx) => {
              const isPast = idx < state.currentQuestionIndex;
              const isCurrent = idx === state.currentQuestionIndex;
              return (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                    isCurrent
                      ? 'bg-primary text-white shadow-xs scale-105 ring-2 ring-primary/30'
                      : isPast
                      ? 'bg-success-soft text-success border border-success/30'
                      : 'text-slate-400 bg-white border border-slate-200/50'
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {isPast ? <CheckCircle2 size={14} strokeWidth={3} /> : idx + 1}
                </div>
              );
            })}
          </div>

          {/* Right: Audio Narration, Question Timer & Counter */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
            {/* Audio Toggle */}
            <button
              id="voice-toggle-btn"
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

            {/* Live Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs">
              <Clock size={13} className="text-slate-400" />
              <span className="text-xs font-mono font-bold text-slate-700">
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            {/* Question Counter Pill */}
            <div className="text-right pl-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-none">
                STAGE
              </p>
              <p className="text-sm font-black text-primary leading-tight">
                0{state.currentQuestionIndex + 1}
                <span className="text-xs text-slate-400 font-bold">/0{state.questions.length}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Shimmering Multi-Stop Progress Track */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #8067e8 0%, #0ea5c9 50%, #45a66b 100%)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── QUESTION & PRO STUDIO STAGE ── */}
        {!showEvaluation && (
          <motion.div
            key={`q-${state.currentQuestionIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start"
          >
            {/* ══════════════════════════════════════════════════
                CHAMBER 1 (LEFT - 7 COLS): AI INTERVIEWER TERMINAL
               ══════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* AI Interviewer Persona Header Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3.5">
                    {/* Dynamic Holographic Neural Persona Orb */}
                    <div className="relative flex items-center justify-center flex-shrink-0">
                      {isSpeaking && (
                        <>
                          <motion.div
                            className="absolute inset-[-8px] rounded-2xl border-2 border-primary/30 pointer-events-none"
                            animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.1, 0.7] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          <motion.div
                            className="absolute inset-[-4px] rounded-2xl border border-cyan/40 pointer-events-none"
                            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.2, 0.8] }}
                            transition={{ duration: 1.6, repeat: Infinity, delay: 0.4, ease: 'easeInOut' }}
                          />
                        </>
                      )}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                          isSpeaking
                            ? 'bg-gradient-to-br from-primary via-indigo-600 to-cyan text-white shadow-lg shadow-primary/30'
                            : 'bg-primary-soft/80 text-primary border border-primary/20'
                        }`}
                      >
                        <Bot size={24} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">
                          Dr. Elena Vance
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          AI Lead Evaluator
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSpeaking ? 'bg-primary animate-ping' : 'bg-success'
                          }`}
                        />
                        {isSpeaking ? 'Reading question aloud...' : 'Listening actively'}
                      </p>
                    </div>
                  </div>

                  {/* Audio Replay Button */}
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
                    className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isSpeaking
                        ? 'bg-danger-soft border-danger/30 text-danger hover:bg-danger-soft/80'
                        : 'bg-white border-slate-200 hover:border-primary/40 hover:bg-primary-soft/20 text-slate-700 shadow-2xs'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX size={14} /> Stop Reading
                      </>
                    ) : (
                      <>
                        <Volume2 size={14} className="text-primary" /> Hear Question Again
                      </>
                    )}
                  </button>
                </div>

                {/* Live Speech Subtitle Banner when Interviewer is Speaking */}
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3 pt-3 border-t border-slate-100"
                    >
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-primary-soft/20 p-2.5 rounded-xl border border-primary/15">
                        <Sparkles size={14} className="text-primary flex-shrink-0 animate-pulse" />
                        <span className="italic leading-relaxed truncate">"{currentQuestion.text}"</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Question Hero Card */}
              <div className="bg-white rounded-2xl p-6 md:p-7 border border-slate-200/90 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                {/* Meta Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
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
                    <Layers size={13} className="text-cyan" />
                    {currentQuestion.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                    {currentQuestion.type}
                  </span>
                </div>

                {/* Question Headline */}
                <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-snug tracking-tight">
                  {currentQuestion.text}
                </h2>

                {/* Guidance Toolbar */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowTip((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                  >
                    <Lightbulb size={14} className="text-warning" />
                    <span>{showTip ? 'Hide Strategy Playbook' : 'Interviewer Strategy Playbook'}</span>
                  </button>

                  <span className="text-xs text-slate-400 font-medium">
                    ⏱️ Target: <strong className="text-slate-700">60 - 90s</strong> · 100 - 200 words
                  </span>
                </div>

                {/* Collapsible Strategy Playbook */}
                <AnimatePresence>
                  {showTip && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-xl bg-gradient-to-br from-warning-soft/50 via-slate-50 to-warning-soft/20 border border-warning/30 text-xs text-slate-700 leading-relaxed flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <Sparkles size={15} className="text-warning flex-shrink-0" />
                          <span>Evaluation Criteria & STAR Alignment:</span>
                        </div>
                        <p className="leading-relaxed">
                          For <strong>{currentQuestion.type}</strong> questions, begin by defining the foundational architecture, step through the operational mechanics or workflow execution, and finish by discussing production trade-offs, scalability, or monitoring strategies.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error Alerts if any */}
              {micError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-danger-soft border border-danger/20 text-danger text-sm font-semibold">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{micError}</span>
                </div>
              )}
              {submitError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-danger-soft border border-danger/20 text-danger text-sm font-semibold">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════
                CHAMBER 2 (RIGHT - 5 COLS): CANDIDATE VOICE STUDIO
               ══════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 md:p-6 flex flex-col gap-4">
                {/* Real-time Telemetry Dashboard */}
                <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-slate-100">
                  {/* Cadence Speedometer */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Gauge size={11} className="text-primary" /> PACE
                    </span>
                    <span className="text-sm font-black text-slate-800 mt-0.5">
                      {currentWpm > 0 ? `${currentWpm} WPM` : '—'}
                    </span>
                    <span className="text-[10px] font-bold text-primary truncate max-w-full">
                      {currentWpm >= 110 && currentWpm <= 165
                        ? 'Optimal'
                        : currentWpm > 165
                        ? 'Rushing'
                        : currentWpm > 0
                        ? 'Deliberate'
                        : 'Ready'}
                    </span>
                  </div>

                  {/* Fluency Rating */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Sparkles size={11} className="text-success" /> FLUENCY
                    </span>
                    <span className="text-sm font-black text-slate-800 mt-0.5">
                      {wordCount > 5 ? `${estimatedFluency}%` : '—'}
                    </span>
                    <span className="text-[10px] font-bold text-success truncate max-w-full">
                      {fillers.length === 0 ? 'Flawless' : `${fillers.length} Fillers`}
                    </span>
                  </div>

                  {/* Captured Words */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <FileText size={11} className="text-cyan" /> WORDS
                    </span>
                    <span className="text-sm font-black text-slate-800 mt-0.5">
                      {wordCount}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 truncate max-w-full">
                      / 150 Target
                    </span>
                  </div>
                </div>

                {/* Studio Header Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
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
                        ? 'Recording Live Speech'
                        : isTranscribing
                        ? 'Whisper AI Transcribing'
                        : wordCount > 0
                        ? 'Answer Captured'
                        : 'Speech Studio Ready'}
                    </span>
                  </div>

                  {/* Edit Toggle */}
                  {currentAnswerText.trim().length > 0 && !isListening && !isTranscribing && (
                    <button
                      onClick={() => setIsEditingTranscript((e) => !e)}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
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

                {/* Audio Visualizer Spectrum Analyzer */}
                <AudioVisualizer isRecording={isListening} mediaStream={mediaStream} />

                {/* Live Transcript Viewport */}
                <div className="min-h-[140px] flex flex-col justify-center">
                  {isTranscribing ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                      <Loader2 size={24} className="animate-spin text-primary" />
                      <p className="text-xs font-bold text-slate-700">Whisper AI processing speech...</p>
                      <p className="text-[11px] text-slate-400">Transcribing technical vocabulary with punctuation</p>
                    </div>
                  ) : isEditingTranscript ? (
                    <textarea
                      value={editedTranscript}
                      onChange={(e) => setEditedTranscript(e.target.value)}
                      autoFocus
                      className="w-full h-32 bg-slate-50 border-2 border-primary/40 rounded-xl p-3 text-slate-800 text-sm leading-relaxed outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all resize-none font-sans font-medium"
                      placeholder="Refine or add to your transcribed answer..."
                    />
                  ) : currentAnswerText.trim().length > 0 ? (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 text-sm leading-relaxed font-sans max-h-48 overflow-y-auto">
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
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-sm font-bold text-slate-700 mb-1">
                        {isSpeaking ? 'AI Interviewer is speaking...' : 'Click Speak to Record'}
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Speak your answer naturally. Click the mic button below or press [Spacebar].
                      </p>
                    </div>
                  )}
                </div>

                {/* Console Action Dock */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  {/* Left: Clear Answer */}
                  <div className="w-20">
                    <AnimatePresence>
                      {currentAnswerText.trim().length > 0 && !isListening && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => {
                            resetTranscript();
                            setEditedTranscript('');
                            setIsEditingTranscript(false);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:text-danger hover:border-danger/30 transition-all cursor-pointer"
                        >
                          <RotateCcw size={11} /> Clear
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Center: Radiant Microphone Button & Hotkey Hint */}
                  <div className="flex flex-col items-center gap-1.5">
                    <MicrophoneButton
                      isListening={isListening}
                      isDisabled={isSubmitting || isTranscribing}
                      onStart={() => {
                        if (isSpeaking) stopSpeaking();
                        startListening();
                      }}
                      onStop={stopListening}
                      size="lg"
                    />
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 select-none">
                      <Keyboard size={11} />
                      <span>{isListening ? 'Click to Stop' : 'Spacebar or Click'}</span>
                    </div>
                  </div>

                  {/* Right: Submit Answer Button */}
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
                          className="px-3.5 py-2 rounded-xl font-bold text-xs text-white shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
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
            </div>
          </motion.div>
        )}

        {/* ── EVALUATION STAGE ── */}
        {showEvaluation && evaluation && (
          <motion.div
            key={`eval-${state.currentQuestionIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
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
