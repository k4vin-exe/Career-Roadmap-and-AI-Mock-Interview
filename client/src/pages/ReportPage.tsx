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
  Loader2,
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
            stroke="rgba(255,255,255,0.06)"
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
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

// ─── Collapsible question card ────────────────────────────────────────────────

interface QuestionCardProps {
  q: Question;
  qs: { technicalAccuracy: number; communication: number; completeness: number; problemSolving: number; fluencyScore: number };
  index: number;
}

function QuestionCard({ q, qs, index }: QuestionCardProps) {
  const [open, setOpen] = useState(false);
  const avg = Math.round((qs.technicalAccuracy + qs.communication + qs.completeness + qs.problemSolving) / 4);
  const color = scoreColor(avg);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/3 transition-colors cursor-pointer"
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
          <span className="text-sm font-bold" style={{ color }}>{avg}/100</span>
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
            <div className="px-5 pb-5 space-y-2 border-t border-white/5 pt-4">
              <ScoreBar label="Technical Accuracy" score={qs.technicalAccuracy} delay={0} />
              <ScoreBar label="Communication"     score={qs.communication}     delay={0.05} />
              <ScoreBar label="Completeness"      score={qs.completeness}      delay={0.1} />
              <ScoreBar label="Problem Solving"   score={qs.problemSolving}    delay={0.15} />
              <ScoreBar label="Fluency"           score={qs.fluencyScore}      delay={0.2} />
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
        <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
          <AlertCircle size={26} className="text-error" />
        </div>
        <div className="text-center">
          <p className="text-text-primary font-semibold text-lg mb-1">Report unavailable</p>
          <p className="text-text-muted text-sm">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent/10 border border-accent/30 rounded-xl text-accent-light text-sm hover:bg-accent/20 transition-colors cursor-pointer"
          >
            <RotateCcw size={15} /> Retry
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 glass rounded-xl text-text-secondary text-sm hover:text-text-primary transition-colors cursor-pointer"
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
    <div className="flex-1 w-full" style={{ background: '#0a0a0f' }}>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-8">

        {/* ── Back ── */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Home</span>
        </motion.button>

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 text-center relative overflow-hidden"
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
          className="glass rounded-2xl p-6"
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
            className="glass rounded-2xl p-6"
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
            className="glass rounded-2xl p-6"
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
            className="glass rounded-2xl p-6"
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
                  className="px-3 py-1 text-xs rounded-lg font-medium"
                  style={{ background: '#6366f115', border: '1px solid #6366f130', color: '#818cf8' }}
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
            className="glass rounded-2xl p-6"
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
                  className="px-3 py-1 text-xs rounded-lg font-medium"
                  style={{ background: '#3b82f615', border: '1px solid #3b82f630', color: '#60a5fa' }}
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
              return <QuestionCard key={i} q={q} qs={qs} index={i} />;
            })}
          </motion.div>
        )}

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-8 text-center"
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
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              <Target size={16} />
              Practice Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold glass text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to Home
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
