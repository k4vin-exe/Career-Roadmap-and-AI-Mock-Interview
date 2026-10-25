import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Mic,
  Clock,
  Gauge,
  BookOpen,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Award,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { segmentTranscriptFillers } from '../../utils/speechMetrics';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

export interface ExtendedEvaluationData {
  technicalAccuracy: number;
  communication: number;
  completeness: number;
  problemSolving: number;
  deliveryScore?: number;
  pacingFeedback?: string;
  fillerFeedback?: string;
  structureFeedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  missingConcepts?: string[];
  idealAnswer?: string;
  suggestions?: string[];
  encouragingFeedback?: string;
  feedback?: string;
  expectedPoints?: string[];
  // Spoken delivery context
  transcript?: string;
  totalWords?: number;
  fillerWords?: string[];
  fillerWordCount?: number;
  fluencyScore?: number;
  questionDuration?: number;
  wordsPerMinute?: number;
  pacingRating?: string;
}

interface EvaluationCardProps {
  evaluation: ExtendedEvaluationData;
  onNext: () => void;
  isLastQuestion: boolean;
}

function normalizeScore(score: number): number {
  if (score <= 10) return Math.round(score * 10);
  return Math.min(100, Math.round(score));
}

function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const norm = normalizeScore(score);
  const color = norm >= 80 ? '#10b981' : norm >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-text-secondary w-36 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${norm}%` }}
          transition={{ duration: 0.8, delay, type: 'spring', bounce: 0.15 }}
        />
      </div>
      <span className="text-xs font-bold w-10 text-right" style={{ color }}>{norm}%</span>
    </div>
  );
}

export default function EvaluationCard({
  evaluation,
  onNext,
  isLastQuestion,
}: EvaluationCardProps) {
  const [activeTab, setActiveTab] = useState<'feedback' | 'speech' | 'ideal'>('feedback');
  const [copied, setCopied] = useState(false);
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis({ rate: 0.9, pitch: 0.95 });

  const techNorm = normalizeScore(evaluation.technicalAccuracy || 7);
  const commNorm = normalizeScore(evaluation.communication || 7.5);
  const compNorm = normalizeScore(evaluation.completeness || 7);
  const probNorm = normalizeScore(evaluation.problemSolving || 7.5);
  const avgScore = Math.round((techNorm + commNorm + compNorm + probNorm) / 4);

  const durationSec = evaluation.questionDuration || 0;
  const durationFormatted = `${Math.floor(durationSec / 60)}m ${(durationSec % 60).toString().padStart(2, '0')}s`;
  const wpm = evaluation.wordsPerMinute || (durationSec > 5 && evaluation.totalWords ? Math.round((evaluation.totalWords / durationSec) * 60) : 0);
  const fluency = evaluation.fluencyScore ?? 85;
  const fillerCount = evaluation.fillerWordCount ?? evaluation.fillerWords?.length ?? 0;

  // Segment candidate transcript to highlight filler words
  const transcriptSegments = segmentTranscriptFillers(evaluation.transcript || '');

  const strengthsList = evaluation.strengths && evaluation.strengths.length > 0
    ? evaluation.strengths
    : evaluation.expectedPoints || ['Clear communication', 'Good foundational knowledge'];

  const handleCopyIdeal = () => {
    if (!evaluation.idealAnswer) return;
    navigator.clipboard.writeText(evaluation.idealAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleIdealAudio = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (evaluation.idealAnswer) {
      speak(evaluation.idealAnswer);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 w-full max-w-4xl mx-auto"
    >
      {/* ── Top Header: Overall Score + Rubric Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Score Card */}
        <div className="card shadow-sm rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-primary/5 border border-primary/20">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Award size={20} className="text-primary" />
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Answer Score</p>
          <div className="text-5xl font-black text-primary leading-none mb-2">
            {avgScore}<span className="text-xl text-text-muted font-bold">%</span>
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{
              background: avgScore >= 80 ? 'rgba(16, 185, 129, 0.12)' : avgScore >= 60 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444',
            }}
          >
            {avgScore >= 85 ? 'Strong Hire' : avgScore >= 70 ? 'Solid Response' : 'Needs Practice'}
          </span>
        </div>

        {/* Score Rubric Breakdown */}
        <div className="card shadow-sm rounded-2xl p-6 md:col-span-2 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Evaluation Rubric</h3>
          </div>
          <div className="space-y-3">
            <ScoreBar label="Technical Depth" score={techNorm} delay={0.1} />
            <ScoreBar label="Communication & Clarity" score={commNorm} delay={0.2} />
            <ScoreBar label="Completeness" score={compNorm} delay={0.3} />
            <ScoreBar label="Problem Solving" score={probNorm} delay={0.4} />
          </div>
        </div>
      </div>

      {/* ── Spoken Delivery & Voice Analytics Row ── */}
      <div className="card shadow-sm rounded-2xl p-5 border border-border bg-surface-solid">
        <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <Mic size={15} className="text-accent-light" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Spoken Delivery & Voice Analytics</h4>
              <p className="text-[11px] text-text-muted">Real-time analysis of your verbal presentation</p>
            </div>
          </div>
          {evaluation.deliveryScore !== undefined && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-primary-soft text-primary-text">
              Delivery: {normalizeScore(evaluation.deliveryScore)}%
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {/* Speaking Pace (WPM) */}
          <div className="p-3 rounded-xl bg-surface-muted/60 border border-border/50 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
              <Gauge size={13} />
              <span>Speaking Pace</span>
            </div>
            <div className="text-lg font-black text-text-primary">
              {wpm > 0 ? `${wpm} WPM` : '—'}
            </div>
            <span className="text-[10px] font-semibold text-accent-light mt-0.5">
              {wpm >= 110 && wpm <= 165
                ? 'Optimal Pace (110-165)'
                : wpm < 110 && wpm > 0
                ? 'Deliberate / Slow'
                : wpm > 165
                ? 'Slightly Rushed'
                : 'Duration short'}
            </span>
          </div>

          {/* Fluency Score */}
          <div className="p-3 rounded-xl bg-surface-muted/60 border border-border/50 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
              <Sparkles size={13} />
              <span>Fluency Score</span>
            </div>
            <div className="text-lg font-black text-text-primary">
              {fluency}%
            </div>
            <span className="text-[10px] font-semibold text-success mt-0.5">
              {fluency >= 85 ? 'High Fluency' : fluency >= 70 ? 'Moderate Hesitations' : 'Frequent Pauses'}
            </span>
          </div>

          {/* Filler Words */}
          <div className="p-3 rounded-xl bg-surface-muted/60 border border-border/50 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
              <Mic size={13} />
              <span>Filler Words</span>
            </div>
            <div className="text-lg font-black text-text-primary">
              {fillerCount}
            </div>
            <span className="text-[10px] font-semibold mt-0.5" style={{ color: fillerCount === 0 ? '#10b981' : fillerCount <= 2 ? '#f59e0b' : '#ef4444' }}>
              {fillerCount === 0 ? 'Zero Fillers! Crisp' : `${fillerCount} verbal filler${fillerCount > 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Duration & Words */}
          <div className="p-3 rounded-xl bg-surface-muted/60 border border-border/50 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
              <Clock size={13} />
              <span>Time & Words</span>
            </div>
            <div className="text-lg font-black text-text-primary">
              {durationFormatted}
            </div>
            <span className="text-[10px] font-semibold text-text-muted mt-0.5">
              {evaluation.totalWords ?? 0} spoken words
            </span>
          </div>
        </div>

        {/* Speech AI Feedback Snippet */}
        {(evaluation.pacingFeedback || evaluation.fillerFeedback) && (
          <div className="mt-3 p-3 rounded-xl bg-accent-glow/30 border border-primary/10 text-xs text-text-secondary flex flex-col gap-1">
            {evaluation.pacingFeedback && (
              <p><strong className="text-text-primary">Pacing:</strong> {evaluation.pacingFeedback}</p>
            )}
            {evaluation.fillerFeedback && (
              <p><strong className="text-text-primary">Speech Habits:</strong> {evaluation.fillerFeedback}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Interactive Review Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
          }`}
        >
          <Award size={14} /> Strengths & Gaps
        </button>

        <button
          onClick={() => setActiveTab('speech')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'speech'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
          }`}
        >
          <Mic size={14} /> Transcript & Speech Analysis
        </button>

        <button
          onClick={() => setActiveTab('ideal')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ideal'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
          }`}
        >
          <BookOpen size={14} /> Ideal Model Answer
        </button>
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {/* Tab 1: Feedback, Strengths, Missing Concepts */}
        {activeTab === 'feedback' && (
          <motion.div
            key="tab-feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            {/* Encouraging Executive Summary */}
            <div className="card shadow-sm rounded-2xl p-5 border-l-4 border-l-primary bg-surface-solid">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Interviewer Takeaway</h4>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {evaluation.encouragingFeedback || evaluation.feedback || 'Good effort articulating your answer to this question.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="card shadow-sm rounded-2xl p-5 bg-success-soft/20 border border-success/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-success" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-success">What You Articulated Well</h4>
                </div>
                <ul className="space-y-2 text-xs text-text-secondary">
                  {strengthsList.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Concepts & Edge Cases */}
              <div className="card shadow-sm rounded-2xl p-5 bg-warning-soft/20 border border-warning/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-warning" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-warning">Key Technical Concepts Missed</h4>
                </div>
                {evaluation.missingConcepts && evaluation.missingConcepts.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.missingConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-solid border border-warning/30 text-warning"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic">Covered all foundational concepts expected for this level.</p>
                )}

                {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-warning/20">
                    <p className="text-[11px] font-bold text-text-secondary uppercase mb-1.5">Gaps to Address:</p>
                    <ul className="space-y-1 text-xs text-text-muted">
                      {evaluation.weaknesses.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Actionable Tips */}
            {evaluation.suggestions && evaluation.suggestions.length > 0 && (
              <div className="card shadow-sm rounded-2xl p-5 bg-surface-solid">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={16} className="text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Actionable Tips for Real Interviews</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-text-secondary">
                  {evaluation.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface-muted/50 border border-border/60 flex items-start gap-2">
                      <span className="font-bold text-primary">{idx + 1}.</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 2: Spoken Transcript & Speech Patterns */}
        {activeTab === 'speech' && (
          <motion.div
            key="tab-speech"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            {/* Answer Structure Critique */}
            {evaluation.structureFeedback && (
              <div className="card shadow-sm rounded-2xl p-5 bg-surface-solid border-l-4 border-l-accent">
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={16} className="text-accent-light" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Structure & Narrative Flow</h4>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {evaluation.structureFeedback}
                </p>
              </div>
            )}

            {/* Candidate Spoken Transcript with Fillers Highlighted */}
            <div className="card shadow-sm rounded-2xl p-6 bg-surface-solid">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Your Spoken Transcript</h4>
                  <p className="text-[11px] text-text-muted">Detected filler words are highlighted in amber</p>
                </div>
                {fillerCount > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-warning-soft text-warning">
                    {fillerCount} filler word{fillerCount > 1 ? 's' : ''} detected
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-surface-muted/60 border border-border text-sm leading-relaxed text-text-primary font-mono max-h-64 overflow-y-auto">
                {transcriptSegments.length > 0 ? (
                  transcriptSegments.map((seg, idx) =>
                    seg.isFiller ? (
                      <span
                        key={idx}
                        className="bg-warning/20 text-warning px-1.5 py-0.5 rounded font-bold border border-warning/30"
                        title="Detected filler word — practice pausing silently instead"
                      >
                        {seg.text}
                      </span>
                    ) : (
                      <span key={idx}>{seg.text}</span>
                    )
                  )
                ) : (
                  <span className="text-text-muted italic">No spoken transcript recorded for this response.</span>
                )}
              </div>

              {/* Detected Fillers List Chips */}
              {evaluation.fillerWords && evaluation.fillerWords.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-text-muted">Detected Fillers:</span>
                  {Array.from(new Set(evaluation.fillerWords)).map((filler, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 rounded-lg bg-surface-muted text-text-secondary border border-border">
                      "{filler}"
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Ideal Model Answer */}
        {activeTab === 'ideal' && (
          <motion.div
            key="tab-ideal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card shadow-sm rounded-2xl p-6 bg-surface-solid"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Principal Engineer Model Response</h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleIdealAudio}
                  className="px-3 py-1.5 rounded-xl border border-border bg-surface-solid hover:bg-surface-muted text-xs font-semibold text-text-secondary flex items-center gap-1.5 cursor-pointer"
                  title={isSpeaking ? 'Stop audio' : 'Listen to model response'}
                >
                  {isSpeaking ? (
                    <><VolumeX size={14} className="text-danger" /> Stop Audio</>
                  ) : (
                    <><Volume2 size={14} className="text-primary" /> Listen Aloud</>
                  )}
                </button>

                <button
                  onClick={handleCopyIdeal}
                  className="px-3 py-1.5 rounded-xl border border-border bg-surface-solid hover:bg-surface-muted text-xs font-semibold text-text-secondary flex items-center gap-1.5 cursor-pointer"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <><Check size={14} className="text-success" /> Copied!</>
                  ) : (
                    <><Copy size={14} /> Copy</>
                  )}
                </button>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-primary-soft/30 border border-primary/20 text-sm leading-relaxed text-text-primary whitespace-pre-line">
              {evaluation.idealAnswer || 'A model answer will be generated here.'}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-surface-muted/50 text-xs text-text-muted flex items-center gap-2">
              <Lightbulb size={14} className="text-primary flex-shrink-0" />
              <span>Notice how the model answer starts with core principles, highlights production trade-offs, and concludes with practical edge-case handling.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Continue / Next Question CTA ── */}
      <div className="flex justify-center pt-2">
        <motion.button
          id="next-question-btn"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (isSpeaking) stopSpeaking();
            onNext();
          }}
          className={`px-8 py-4 rounded-2xl text-base font-bold text-white shadow-md flex items-center gap-2 cursor-pointer transition-all ${
            isLastQuestion
              ? 'bg-gradient-to-r from-success to-emerald-600 hover:shadow-success/30'
              : 'bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/30'
          }`}
        >
          {isLastQuestion ? '📊 Generate Final Report' : 'Next Question'}
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}
