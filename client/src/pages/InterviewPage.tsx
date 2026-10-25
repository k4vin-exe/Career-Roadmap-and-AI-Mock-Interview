/**
 * InterviewPage — Extraordinary AI Technical Interview Suite
 * Ultra-aesthetic light theme, rich glassmorphism, dynamic audio visualization,
 * and comprehensive spoken answer evaluation.
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
  Compass,
  Layers,
} from 'lucide-react';

import { useInterview } from '../context/InterviewContext';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { computeSpeechMetrics } from '../utils/speechMetrics';
import { submitAnswer, generateReport } from '../services/api';

import MicrophoneButton from '../components/interview/MicrophoneButton';
import TranscriptDisplay from '../components/interview/TranscriptDisplay';
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

  // Timer
  useEffect(() => {
    if (showEvaluation) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setElapsedSeconds(0);
    setQuestionStartTime(Date.now());
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.currentQuestionIndex, showEvaluation]);

  // Auto-speak question on load
  useEffect(() => {
    if (!currentQuestion || hasSpokenQuestion) return;
    const timeout = setTimeout(() => {
      if (voiceEnabled) speak(currentQuestion.text);
      setHasSpokenQuestion(true);
      resetTranscript();
      setEditedTranscript('');
      setEvaluation(null);
      setSubmitError(null);
      setShowTip(false);
      dispatch({ type: 'START_QUESTION' });
    }, 600);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentQuestionIndex]);

  // Keep editedTranscript in sync with live transcript
  useEffect(() => {
    if (transcript) setEditedTranscript(transcript);
  }, [transcript]);

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
  }, [state.session, currentQuestion, editedTranscript, transcript, questionStartTime, stopListening, stopSpeaking, dispatch]);

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
      setEvaluation(null);
      setShowTip(false);
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }, [isLastQuestion, state.session, dispatch, navigate, resetTranscript]);

  if (!state.session || !currentQuestion) return null;

  const progressPct = ((state.currentQuestionIndex + (showEvaluation ? 1 : 0)) / state.questions.length) * 100;

  return (
    <div
      className="flex-1 w-full flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #eef2f6 100%)',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      {/* Decorative Luminous Ambient Glow Orbs */}
      <div
        className="absolute top-[-5%] left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(128, 103, 232, 0.08) 0%, rgba(128, 103, 232, 0) 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute top-[30%] right-[5%] w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 201, 0.06) 0%, rgba(14, 165, 201, 0) 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-[5%] left-[25%] w-[550px] h-[550px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(69, 166, 107, 0.05) 0%, rgba(69, 166, 107, 0) 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* ── Sticky Luxury Header ── */}
      <div className="sticky top-[60px] w-full z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Role Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Compass size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {state.session.role}
                </span>
                <span className="text-[11px] font-semibold text-primary bg-primary-soft/60 px-2 py-0.5 rounded-md border border-primary/20">
                  {state.session.experience}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">AI Mock Interview Session</p>
            </div>
          </div>

          {/* Center: Stepper Pills (visible on tablet/desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            {state.questions.map((_, idx) => {
              const isPast = idx < state.currentQuestionIndex;
              const isCurrent = idx === state.currentQuestionIndex;
              return (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-primary text-white shadow-xs scale-105'
                      : isPast
                      ? 'bg-success-soft text-success border border-success/30'
                      : 'text-slate-400 bg-white/60'
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {isPast ? <CheckCircle2 size={13} strokeWidth={3} /> : idx + 1}
                </div>
              );
            })}
          </div>

          {/* Right: Controls & Timer */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Audio Toggle */}
            <button
              id="voice-toggle-btn"
              onClick={() => { setVoiceEnabled((v) => !v); if (isSpeaking) stopSpeaking(); }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                voiceEnabled
                  ? 'border-primary/30 bg-primary-soft/50 text-primary hover:bg-primary-soft'
                  : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
              }`}
              title={voiceEnabled ? 'Disable AI voice speech' : 'Enable AI voice speech'}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 shadow-2xs rounded-xl">
              <Clock size={13} className="text-slate-400" />
              <span className="text-xs font-mono font-bold text-slate-700">{formatTime(elapsedSeconds)}</span>
            </div>

            {/* Question Counter */}
            <div className="text-right pl-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-extrabold leading-none">Question</p>
              <p className="text-base font-black text-primary leading-tight">
                {state.currentQuestionIndex + 1}<span className="text-xs text-slate-400 font-bold">/{state.questions.length}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Shimmering Progress Bar Track */}
        <div className="h-1 bg-slate-100 relative overflow-hidden">
          <motion.div
            className="h-full"
            style={{
              background: 'linear-gradient(90deg, #8067e8 0%, #0ea5c9 50%, #45a66b 100%)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── Page Body ── */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col gap-6 relative z-10">
        <AnimatePresence mode="wait">

          {/* ── QUESTION + ANSWER STAGE ── */}
          {!showEvaluation && (
            <motion.div
              key={`q-${state.currentQuestionIndex}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6 w-full"
            >
              {/* Question Hero Card */}
              <div className="card-elevated rounded-3xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-lg shadow-slate-200/40 relative overflow-hidden">
                {/* Subtle decorative background watermarks */}
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-primary/5 rounded-full pointer-events-none blur-2xl" />

                <div className="flex items-start gap-4 md:gap-5 relative z-10">
                  {/* Interviewer Avatar with dynamic rings */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="relative flex items-center justify-center">
                      {isSpeaking && (
                        <motion.div
                          className="absolute inset-[-6px] rounded-2xl border-2 border-primary/40"
                          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.2, 0.8] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                          isSpeaking
                            ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/30'
                            : 'bg-primary-soft/80 text-primary border border-primary/20'
                        }`}
                      >
                        <Bot size={22} />
                      </div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-primary-soft/70 text-primary border border-primary/20">
                        {currentQuestion.difficulty}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <Layers size={13} className="text-cyan" />
                        {currentQuestion.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {currentQuestion.type}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 leading-snug tracking-tight">
                      {currentQuestion.text}
                    </h2>

                    {/* Question Action Toolbar */}
                    <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100 flex-wrap">
                      <div className="flex items-center gap-2.5">
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
                          className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                            isSpeaking
                              ? 'bg-danger-soft border-danger/30 text-danger hover:bg-danger-soft/80'
                              : 'bg-white border-slate-200 hover:border-primary/40 hover:bg-primary-soft/20 text-slate-700 shadow-2xs'
                          }`}
                        >
                          {isSpeaking ? (
                            <><VolumeX size={15} /> Stop Reading</>
                          ) : (
                            <><Volume2 size={15} className="text-primary" /> Hear Question Again</>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowTip((prev) => !prev)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                        >
                          <Lightbulb size={14} className="text-warning" />
                          <span>{showTip ? 'Hide Strategy Tip' : 'Strategy Tip'}</span>
                        </button>
                      </div>

                      <span className="text-xs text-slate-500 font-medium">
                        ⏱️ Target response: <strong className="text-slate-700">60 - 90s</strong> · 100 - 200 words
                      </span>
                    </div>

                    {/* Collapsible Strategy Tip Box */}
                    <AnimatePresence>
                      {showTip && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-3"
                        >
                          <div className="p-3.5 rounded-2xl bg-warning-soft/40 border border-warning/30 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                            <Sparkles size={16} className="text-warning flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-slate-800">Interviewer Strategy:</strong> For {currentQuestion.type.toLowerCase()} questions, outline your foundational definition first, walk through architectural or practical mechanics, and conclude by highlighting edge-case trade-offs.
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Transcript Display Component */}
              <TranscriptDisplay
                transcript={transcript}
                isListening={isListening}
                isTranscribing={isTranscribing}
                onTranscriptChange={setEditedTranscript}
              />

              {/* Error banners */}
              {micError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-danger-soft border border-danger/20">
                  <AlertCircle size={16} className="text-danger flex-shrink-0" />
                  <p className="text-sm font-medium text-danger-text">{micError}</p>
                </div>
              )}
              {submitError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-danger-soft border border-danger/20">
                  <AlertCircle size={16} className="text-danger flex-shrink-0" />
                  <p className="text-sm font-medium text-danger-text">{submitError}</p>
                </div>
              )}

              {/* ── Studio Recording Deck ── */}
              <div className="card-elevated rounded-3xl p-6 md:p-8 bg-white border border-slate-200/80 shadow-lg shadow-slate-200/40">
                <div className="flex flex-col items-center gap-4">

                  {/* Status Headline */}
                  <div className="text-center">
                    <p className="text-sm md:text-base font-bold text-slate-800">
                      {isSpeaking
                        ? '🔊 AI Interviewer is reading the question aloud...'
                        : isListening
                        ? '🎙️ Voice Recording Active — Speak clearly at your normal pace'
                        : isTranscribing
                        ? '⚡ Whisper AI is transcribing and analyzing your verbal pacing...'
                        : editedTranscript.trim().length > 5
                        ? '✨ Answer recorded — Review your transcript above or submit'
                        : '🎤 Press the microphone when you are ready to answer'}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {isListening
                        ? 'Click the square red button when finished speaking'
                        : 'Your microphone audio is privately processed with Whisper AI'}
                    </p>
                  </div>

                  {/* Real-time Dynamic Audio Visualizer */}
                  <AudioVisualizer isRecording={isListening} mediaStream={mediaStream} />

                  {/* Action Controls Dock */}
                  <div className="flex items-center justify-center gap-8 md:gap-12 w-full max-w-md pt-2">
                    {/* Clear Button */}
                    <div className="w-24 flex justify-end">
                      <AnimatePresence>
                        {editedTranscript.trim().length > 0 && !isListening && (
                          <motion.button
                            id="clear-transcript-btn"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => { resetTranscript(); setEditedTranscript(''); }}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:border-danger/30 hover:text-danger hover:bg-danger-soft/20 transition-all cursor-pointer"
                          >
                            Clear
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Microphone Central Hub */}
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

                    {/* Submit Button */}
                    <div className="w-24 flex justify-start">
                      <AnimatePresence>
                        {editedTranscript.trim().length > 5 && !isListening && (
                          <motion.button
                            id="submit-answer-btn"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={handleSubmitAnswer}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                            style={{
                              background: 'linear-gradient(135deg, #8067e8 0%, #5d45c7 100%)',
                              boxShadow: '0 8px 20px rgba(128, 103, 232, 0.35)',
                            }}
                            whileHover={!isSubmitting ? { scale: 1.05, y: -1 } : {}}
                            whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                          >
                            {isSubmitting ? (
                              <><Loader2 size={14} className="animate-spin" /> Evaluating</>
                            ) : (
                              <>Submit <ChevronRight size={14} strokeWidth={2.5} /></>
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
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
    </div>
  );
}
