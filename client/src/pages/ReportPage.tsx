/**
 * ReportPage — Post-Interview Report
 * Shows overall scores, per-question breakdown, strengths/weaknesses,
 * AI summary, and improvement areas.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Star,
  Brain,
  MessageSquare,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { getReport } from '../services/api';
import type { InterviewReport, Question } from '../utils/types';

// ─── Helper: score → colour ──────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  return 'Needs Work';
}

function readinessColor(readiness: string): string {
  const r = readiness?.toLowerCase() ?? '';
  if (r.includes('ready') || r.includes('excellent')) return '#22c55e';
  if (r.includes('almost') || r.includes('good')) return '#f59e0b';
  return '#ef4444';
}

// ─── Animated Circular Progress ───────────────────────────────────────────────

interface CircularScoreProps {
  score: number;
  size?: number;
  label: string;
  sublabel?: string;
  delay?: number;
}

function CircularScore({ score, size = 110, label, sublabel, delay = 0 }: CircularScoreProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={8}
          />
        </svg>
        {/* Progress ring */}
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
            transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
          />
        </svg>
        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wide">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {sublabel && <p className="text-xs text-text-muted">{sublabel}</p>}
      </div>
    </motion.div>
  );
}

// ─── Mini bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const norm = score <= 10 ? Math.round(score * 10) : Math.round(score);
  const color = scoreColor(norm);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-36 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${norm}%` }}
          transition={{ delay, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{norm}%</span>
    </div>
  );
}

// ─── Collapsible question card ────────────────────────────────────────────────

interface QuestionCardProps {
  q: Question;
  qs: { technicalAccuracy: number; communication: number; completeness: number; problemSolving: number; fluencyScore: number };
  resp?: any;
  index: number;
}

function QuestionCard({ q, qs, resp, index }: QuestionCardProps) {
  const [open, setOpen] = useState(false);
  const normTech = qs.technicalAccuracy <= 10 ? qs.technicalAccuracy * 10 : qs.technicalAccuracy;
  const normComm = qs.communication <= 10 ? qs.communication * 10 : qs.communication;
  const normComp = qs.completeness <= 10 ? qs.completeness * 10 : qs.completeness;
  const normProb = qs.problemSolving <= 10 ? qs.problemSolving * 10 : qs.problemSolving;
  const avg = Math.round((normTech + normComm + normComp + normProb) / 4);
  const color = scoreColor(avg);

  const evalData = resp?.evaluation;
  const transcriptText = resp?.editedTranscript || resp?.transcript;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="card shadow-sm rounded-xl overflow-hidden border border-border bg-surface-solid"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-muted transition-colors cursor-pointer"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{ background: `${color}20`, color }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary font-medium truncate">{q.text}</p>
          <p className="text-xs text-text-muted">{q.difficulty} · {q.category}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-bold" style={{ color }}>{avg}%</span>
          {open ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
              {/* Score bars */}
              <div className="space-y-2">
                <ScoreBar label="Technical Accuracy" score={normTech} delay={0} />
                <ScoreBar label="Communication"     score={normComm} delay={0.05} />
                <ScoreBar label="Completeness"      score={normComp} delay={0.1} />
                <ScoreBar label="Problem Solving"   score={normProb} delay={0.15} />
                <ScoreBar label="Fluency"           score={qs.fluencyScore} delay={0.2} />
              </div>

              {/* Candidate Spoken Transcript */}
              {transcriptText && (
                <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border/70 text-xs">
                  <div className="flex items-center justify-between mb-1.5 font-bold text-text-secondary">
                    <span>Your Spoken Answer:</span>
                    {resp.questionDuration ? (
                      <span className="font-normal text-text-muted">{resp.questionDuration}s · {resp.totalWords || 0} words</span>
                    ) : null}
                  </div>
                  <p className="text-text-primary leading-relaxed italic">"{transcriptText}"</p>
                  {resp.fillerWordCount > 0 && (
                    <p className="mt-2 text-[11px] text-warning font-medium">
                      ⚠️ Used {resp.fillerWordCount} filler words ({resp.fillerWords?.slice(0, 3).join(', ')})
                    </p>
                  )}
                </div>
              )}

              {/* Strengths & Missing Concepts */}
              {evalData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {evalData.strengths && evalData.strengths.length > 0 && (
                    <div className="p-3 rounded-xl bg-success-soft/20 border border-success/20 text-xs">
                      <p className="font-bold text-success mb-1.5">What Was Explained Well:</p>
                      <ul className="space-y-1 text-text-secondary">
                        {evalData.strengths.map((s: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-success font-bold">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evalData.missingConcepts && evalData.missingConcepts.length > 0 && (
                    <div className="p-3 rounded-xl bg-warning-soft/20 border border-warning/20 text-xs">
                      <p className="font-bold text-warning mb-1.5">Key Concepts Missed:</p>
                      <div className="flex flex-wrap gap-1">
                        {evalData.missingConcepts.map((c: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-surface-solid border border-warning/30 text-[11px] font-semibold text-warning">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ideal Model Answer */}
              {evalData?.idealAnswer && (
                <div className="p-3.5 rounded-xl bg-primary-soft/20 border border-primary/20 text-xs">
                  <p className="font-bold text-primary mb-1">Principal Engineer Ideal Answer:</p>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-line">{evalData.idealAnswer}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<InterviewReport | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    if (!sessionId) { navigate('/'); return; }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getReport(sessionId);
      setReport(data.report);
      setQuestions(data.questions ?? []);
      setResponses(data.responses ?? []);
    } catch {
      setError('Could not load your report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, navigate]);

  useEffect(() => { loadReport(); }, [loadReport]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-2 border-transparent border-t-accent"
        />
        <div className="text-center">
          <p className="text-text-primary font-semibold text-lg mb-1">Generating your report…</p>
          <p className="text-text-muted text-sm">The AI is analysing all your answers</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────

  if (error || !report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24 px-6">
        <div className="w-14 h-14 rounded-full bg-danger-soft flex items-center justify-center">
          <AlertCircle size={26} className="text-danger" />
        </div>
        <div className="text-center">
          <p className="text-text-primary font-semibold text-lg mb-1">Report unavailable</p>
          <p className="text-text-muted text-sm">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadReport}
            className="btn btn-primary btn-sm flex items-center gap-2"
          >
            <RotateCcw size={15} /> Retry
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            <ArrowLeft size={15} /> Home
          </button>
        </div>
      </div>
    );
  }

  // ── Report ───────────────────────────────────────────────────────────────────

  const overallScore = Math.round(
    (report.overallTechnicalScore + report.communicationScore + report.fluencyScore) / 3
  );
  const rColor = readinessColor(report.interviewReadiness);

  return (
    <div className="w-full max-w-4xl mx-auto py-2 flex flex-col gap-6">
      {/* ── Back ── */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={16} />
        <span className="text-sm font-semibold">Back to Dashboard</span>
      </motion.button>

      {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card shadow-sm rounded-2xl p-8 text-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 opacity-10 blur-3xl"
            style={{ background: `radial-gradient(circle at 50% 50%, ${scoreColor(overallScore)}, transparent 70%)` }}
          />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: `${scoreColor(overallScore)}20` }}>
              <Trophy size={28} style={{ color: scoreColor(overallScore) }} />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-1">Interview Complete!</h1>
            <p className="text-text-muted mb-6 text-sm">Here is your full performance breakdown</p>

            {/* Readiness badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
              style={{ background: `${rColor}15`, border: `1px solid ${rColor}40`, color: rColor }}
            >
              <Star size={14} />
              {report.interviewReadiness}
            </div>

            {/* Three main circular scores */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              <CircularScore score={report.overallTechnicalScore} label="Technical"   sublabel="accuracy"     delay={0.1} />
              <CircularScore score={report.communicationScore}    label="Communication" sublabel="clarity"     delay={0.2} />
              <CircularScore score={report.fluencyScore}          label="Fluency"     sublabel="speech flow"   delay={0.3} />
            </div>

            {/* Overall */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-text-muted text-sm"
            >
              Overall score:{' '}
              <span className="font-bold text-lg" style={{ color: scoreColor(overallScore) }}>
                {overallScore}
              </span>
              /100 — {scoreLabel(overallScore)}
            </motion.div>
          </div>
        </motion.div>

        {/* ── AI Summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card shadow-sm rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-glow flex items-center justify-center">
              <Brain size={16} className="text-accent-light" />
            </div>
            <h2 className="text-base font-bold text-text-primary">AI Feedback Summary</h2>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">{report.aiSummary}</p>
        </motion.div>

        {/* ── Strengths & Weaknesses ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card shadow-sm rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#22c55e15' }}>
                <CheckCircle2 size={16} className="text-success" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Strengths</h2>
            </div>
            {report.strengths?.length ? (
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                    {s}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted text-sm italic">No specific strengths recorded.</p>
            )}
          </motion.div>

          {/* Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card shadow-sm rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b15' }}>
                <AlertCircle size={16} className="text-warning" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Areas to Improve</h2>
            </div>
            {report.weaknesses?.length ? (
              <ul className="space-y-2">
                {report.weaknesses.map((w, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
                    {w}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted text-sm italic">No weaknesses recorded.</p>
            )}
          </motion.div>
        </div>

        {/* ── Topics to study + Practice areas ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Topics to improve */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card shadow-sm rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#6366f115' }}>
                <TrendingUp size={16} className="text-accent-light" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Topics to Study</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.topicsToImprove?.map((t, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="badge badge-primary"
                >
                  {t}
                </motion.span>
              ))}
              {!report.topicsToImprove?.length && (
                <p className="text-text-muted text-sm italic">None identified.</p>
              )}
            </div>
          </motion.div>

          {/* Practice areas */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="card shadow-sm rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#3b82f615' }}>
                <Lightbulb size={16} className="text-info" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Practice Areas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.practiceAreas?.map((p, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.04 }}
                  className="badge badge-cyan"
                >
                  {p}
                </motion.span>
              ))}
              {!report.practiceAreas?.length && (
                <p className="text-text-muted text-sm italic">None identified.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Per-Question Breakdown ── */}
        {report.questionScores?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b15' }}>
                <Activity size={16} className="text-warning" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Question-by-Question Breakdown</h2>
            </div>
            {report.questionScores.map((qs, i) => {
              const q = questions[qs.questionIndex] ?? {
                id: String(i),
                index: qs.questionIndex,
                text: `Question ${qs.questionIndex + 1}`,
                difficulty: '—',
                type: '—',
                category: '—',
              };
              const resp = responses.find((r) => r.questionIndex === qs.questionIndex) || responses[i];
              return <QuestionCard key={i} q={q} qs={qs} resp={resp} index={i} />;
            })}
          </motion.div>
        )}

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card shadow-sm rounded-2xl p-8 text-center"
        >
          <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#6366f115' }}>
            <MessageSquare size={22} className="text-accent-light" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Ready to improve?</h3>
          <p className="text-text-secondary text-sm mb-6">
            Practice makes perfect. Start another interview to track your progress.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/setup')}
              className="btn btn-primary btn-md flex items-center gap-2"
            >
              <Target size={16} />
              Practice Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/')}
              className="btn btn-ghost btn-md flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Home
            </motion.button>
          </div>
        </motion.div>
      </div>
  );
}


