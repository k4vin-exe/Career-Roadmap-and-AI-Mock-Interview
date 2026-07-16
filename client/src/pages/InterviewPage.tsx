/**
 * InterviewPage — Full Interview Flow
 * UI overhaul: fixed layout, no vertical shift, mic below fold, properly spaced.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Clock, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

import { useInterview } from '../context/InterviewContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { computeSpeechMetrics } from '../utils/speechMetrics';
import { submitAnswer, generateReport } from '../services/api';

import MicrophoneButton from '../components/interview/MicrophoneButton';
import TranscriptDisplay from '../components/interview/TranscriptDisplay';
import EvaluationCard from '../components/interview/EvaluationCard';

interface EvaluationData {
  technicalAccuracy: number;
  communication: number;
  completeness: number;
  problemSolving: number;
  feedback: string;
  expectedPoints: string[];
}

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
    interimTranscript,
    isListening,
    isSupported: micSupported,
    error: micError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ continuous: true, interimResults: true, confidenceThreshold: 0.35 });

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis({ rate: 0.92 });

  const [editedTranscript, setEditedTranscript] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasSpokenQuestion, setHasSpokenQuestion] = useState(false);

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
    const metrics = computeSpeechMetrics(editedTranscript);

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
        technicalAccuracy: evalData.technicalAccuracy ?? 75,
        communication: evalData.communication ?? 80,
        completeness: evalData.completeness ?? 70,
        problemSolving: evalData.problemSolving ?? 75,
        feedback: evalData.encouragingFeedback || evalData.feedback || 'Good effort on this answer.',
        expectedPoints: evalData.strengths ?? evalData.expectedPoints ?? [],
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
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }, [isLastQuestion, state.session, dispatch, navigate, resetTranscript]);

  if (!state.session || !currentQuestion) return null;

  const progressPct = ((state.currentQuestionIndex + (showEvaluation ? 1 : 0)) / state.questions.length) * 100;

  return (
    <div className="flex-1 w-full flex flex-col" style={{ background: 'var(--bg-primary, #0a0a0f)' }}>

      {/* ── Sticky Sub-Header (interview-specific) ── */}
      <div className="sticky top-[64px] w-full z-10 border-b border-white/5 backdrop-blur-md"
        style={{ background: 'rgba(10,10,15,0.9)' }}>
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: title + role */}
          <div className="min-w-0">
            <h1 className="text-base font-bold text-text-primary truncate">Interview in Progress</h1>
            <p className="text-xs text-text-secondary truncate">{state.session.role} · {state.session.experience}</p>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              id="voice-toggle-btn"
              onClick={() => { setVoiceEnabled((v) => !v); if (isSpeaking) stopSpeaking(); }}
              className="p-2 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
              title={voiceEnabled ? 'Disable AI voice' : 'Enable AI voice'}
            >
              {voiceEnabled
                ? <Volume2 size={16} className="text-accent-light" />
                : <VolumeX size={16} className="text-text-muted" />}
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl">
              <Clock size={13} className="text-text-muted" />
              <span className="text-sm font-mono text-text-secondary">{formatTime(elapsedSeconds)}</span>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Question</p>
              <p className="text-lg font-bold gradient-text leading-none">
                {state.currentQuestionIndex + 1}<span className="text-sm text-text-muted font-normal">/{state.questions.length}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* ── Page Body ── */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-5">
        <AnimatePresence mode="wait">

          {/* ── QUESTION + ANSWER VIEW ── */}
          {!showEvaluation && (
            <motion.div
              key={`q-${state.currentQuestionIndex}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28 }}
              className="flex flex-col gap-4 w-full"
            >
              {/* Question Card */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {isSpeaking ? (
                      <motion.div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-accent-light"
                        style={{ background: 'rgba(124,58,237,0.2)' }}
                        animate={{ boxShadow: ['0 0 0px rgba(124,58,237,0.2)', '0 0 16px rgba(124,58,237,0.5)', '0 0 0px rgba(124,58,237,0.2)'] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                      >
                        AI
                      </motion.div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-accent-light"
                        style={{ background: 'rgba(124,58,237,0.15)' }}>
                        AI
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-accent-light uppercase tracking-wider">
                        {currentQuestion.difficulty}
                      </span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">{currentQuestion.category}</span>
                    </div>
                    <p className="text-base md:text-[17px] text-text-primary leading-relaxed">
                      {currentQuestion.text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transcript Display */}
              <TranscriptDisplay
                transcript={transcript}
                interimTranscript={interimTranscript}
                isListening={isListening}
                onTranscriptChange={setEditedTranscript}
              />

              {/* Error banners */}
              {(micError || !micSupported) && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">
                    {micError || 'Speech recognition not supported. Please use Chrome or Edge.'}
                  </p>
                </div>
              )}
              {submitError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{submitError}</p>
                </div>
              )}

              {/* Mic controls — fixed bottom-ish panel */}
              <div className="glass rounded-2xl p-6">
                <div className="flex flex-col items-center gap-4">

                  {/* Status text */}
                  <p className="text-sm text-text-secondary text-center">
                    {isSpeaking
                      ? '🔊 AI is reading the question aloud...'
                      : isListening
                      ? '🎙️ Recording — speak clearly, then click Stop'
                      : editedTranscript.trim().length > 5
                      ? '✅ Answer captured — review then submit'
                      : '🎤 Click the microphone to start answering'}
                  </p>

                  {/* Mic button row */}
                  <div className="flex items-center gap-8">
                    {/* Clear button (left side) */}
                    <AnimatePresence>
                      {editedTranscript.trim().length > 0 && !isListening && (
                        <motion.button
                          id="clear-transcript-btn"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => { resetTranscript(); setEditedTranscript(''); }}
                          className="px-4 py-2 rounded-xl text-sm text-text-muted border border-white/10 hover:border-white/20 hover:text-text-secondary transition-all"
                        >
                          Clear
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Main mic button */}
                    <MicrophoneButton
                      isListening={isListening}
                      isDisabled={isSubmitting || !micSupported}
                      onStart={() => {
                        if (isSpeaking) stopSpeaking();
                        startListening();
                      }}
                      onStop={stopListening}
                      size="lg"
                    />

                    {/* Submit button (right side) */}
                    <AnimatePresence>
                      {editedTranscript.trim().length > 5 && (
                        <motion.button
                          id="submit-answer-btn"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={handleSubmitAnswer}
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                          whileHover={!isSubmitting ? { scale: 1.03, boxShadow: '0 0 18px rgba(124,58,237,0.45)' } : {}}
                          whileTap={!isSubmitting ? { scale: 0.97 } : {}}
                        >
                          {isSubmitting ? (
                            <><Loader2 size={15} className="animate-spin" /> Evaluating...</>
                          ) : (
                            <>Submit <ChevronRight size={15} /></>
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── EVALUATION VIEW ── */}
          {showEvaluation && evaluation && (
            <motion.div
              key={`eval-${state.currentQuestionIndex}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28 }}
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
