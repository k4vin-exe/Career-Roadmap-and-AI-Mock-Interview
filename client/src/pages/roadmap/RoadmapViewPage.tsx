/**
 * RoadmapViewPage — The main roadmap viewer with progress tracking.
 *
 * Layout:
 *  - Top: Profile summary + overall progress ring
 *  - Body: Week cards — collapsible, with daily task checklist
 *  - Each week card: theme, goal, topics, daily tasks, milestone, optional "Practice Interview" CTA
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, CheckCircle2, Circle, Target, Calendar,
  Sparkles, Mic, ArrowRight, Loader2, AlertCircle, BookOpen,
  Trophy, Flag, TrendingUp, Clock,
} from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import { getRoadmap } from '../../services/roadmapApi';
import { useRoadmapProgress } from '../../hooks/useRoadmapProgress';
import type { Roadmap, WeeklyPlan } from '../../utils/roadmapTypes';

// ─── Circular Progress Ring ────────────────────────────────────────────────────
function ProgressRing({ pct, size = 80, stroke = 6 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#prog-gradient)" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="prog-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Week Card ─────────────────────────────────────────────────────────────────
function WeekCard({
  plan, isActive, onToggle, isTaskCompleted, onTaskToggle, targetRole
}: {
  plan: WeeklyPlan;
  isActive: boolean;
  onToggle: () => void;
  isTaskCompleted: (week: number, day: number) => boolean;
  onTaskToggle: (week: number, day: number) => void;
  targetRole: string;
}) {
  const completedCount = plan.dailyBreakdown.filter((d) => isTaskCompleted(plan.week, d.day)).length;
  const total = plan.dailyBreakdown.length;
  const weekPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const isComplete = completedCount === total && total > 0;

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass rounded-2xl overflow-hidden transition-all ${isComplete ? 'border-success/30' : ''}`}
    >
      {/* Week header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left cursor-pointer hover:bg-white/3 transition-colors"
      >
        {/* Week number */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          isComplete ? 'bg-success/20 text-success' : 'bg-accent-glow text-accent-light'
        }`}>
          {isComplete ? <Trophy size={18} /> : plan.week}
        </div>

        {/* Title + badge row */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-text-primary text-sm">{plan.theme}</h3>
            {plan.practiceInterview && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-glow border border-accent/20 text-accent-light text-[10px] font-semibold uppercase tracking-wide">
                <Mic size={9} /> Interview
              </span>
            )}
            {isComplete && (
              <span className="px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-semibold uppercase tracking-wide">
                Complete
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5 truncate">{plan.goal}</p>
        </div>

        {/* Mini progress bar + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:block">
            <p className="text-xs text-text-muted text-right">{completedCount}/{total}</p>
            <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden mt-1">
              <motion.div
                className="h-full rounded-full"
                style={{ background: isComplete ? '#22c55e' : '#6366f1' }}
                initial={{ width: 0 }}
                animate={{ width: `${weekPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          {isActive ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-border/50">
              {/* Goal */}
              <div className="pt-4">
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wide mb-1">Week Goal</p>
                <p className="text-sm text-text-primary">{plan.goal}</p>
              </div>

              {/* Topics */}
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wide mb-2">Topics Covered</p>
                <div className="flex flex-wrap gap-2">
                  {plan.topics.map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-surface-light border border-border text-text-secondary text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Daily tasks */}
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wide mb-3">Daily Tasks</p>
                <div className="space-y-2">
                  {plan.dailyBreakdown.map((d) => {
                    const done = isTaskCompleted(plan.week, d.day);
                    return (
                      <button
                        key={d.day}
                        onClick={() => onTaskToggle(plan.week, d.day)}
                        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors cursor-pointer text-left group"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {done
                            ? <CheckCircle2 size={18} className="text-success" />
                            : <Circle size={18} className="text-text-muted group-hover:text-accent transition-colors" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                            {d.task}
                          </span>
                          <span className="ml-2 text-xs text-text-muted">
                            ~{d.estimatedHours}h
                          </span>
                        </div>
                        <span className="text-xs text-text-muted flex-shrink-0 mt-0.5">
                          {DAY_LABELS[d.day - 1] ?? `Day ${d.day}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Milestone */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-glow border border-accent/20">
                <Flag size={16} className="text-accent-light flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-accent-light font-semibold uppercase tracking-wide mb-0.5">Week Milestone</p>
                  <p className="text-sm text-text-primary">{plan.milestone}</p>
                </div>
              </div>

              {/* Practice interview CTA */}
              {plan.practiceInterview && (
                <Link
                  to={`/setup?role=${encodeURIComponent(targetRole)}&from=roadmap`}
                  className="flex items-center justify-between gap-3 p-4 rounded-xl border border-accent/40 bg-accent-glow hover:bg-accent/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Mic size={16} className="text-accent-light" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-accent-light">Practice Interview</p>
                      <p className="text-xs text-text-muted">Test your knowledge from this week</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-accent-light group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RoadmapViewPage() {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useRoadmap();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(state.roadmap);
  const [loading, setLoading] = useState(!state.roadmap);
  const [fetchError, setFetchError] = useState('');
  const [activeWeek, setActiveWeek] = useState<number>(1);

  // Load roadmap (from context or fetch)
  useEffect(() => {
    if (state.roadmap && state.roadmap.profileId === profileId) {
      setRoadmap(state.roadmap);
      setLoading(false);
      return;
    }
    if (!profileId) { navigate('/roadmap/start'); return; }

    setLoading(true);
    getRoadmap(profileId)
      .then((r) => {
        setRoadmap(r);
        dispatch({ type: 'SET_ROADMAP', payload: r });
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(err.response?.data?.error || 'Roadmap not found. Please create a new one.');
        setLoading(false);
      });
  }, [profileId]);

  const { stats, toggleTask, isTaskCompleted, isWeekCompleted } = useRoadmapProgress(roadmap);

  const handleWeekToggle = useCallback((week: number) => {
    setActiveWeek((prev) => (prev === week ? 0 : week));
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto rounded-full border-2 border-transparent border-t-accent"
          />
          <p className="text-text-secondary text-sm">Loading your roadmap…</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (fetchError || !roadmap) {
    return (
      <div className="flex-1 flex items-center justify-center px-4" style={{ background: '#0a0a0f' }}>
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle size={40} className="mx-auto text-error" />
          <p className="text-text-primary font-semibold">{fetchError || 'Roadmap not found'}</p>
          <button
            onClick={() => navigate('/roadmap/start')}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            Create New Roadmap <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  const readyDate = new Date(roadmap.estimatedReadinessDate);
  const readyDateStr = readyDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full" style={{ background: '#0a0a0f' }}>

      {/* ── Sticky Header ── */}
      <div className="sticky top-16 z-10 border-b border-white/5 backdrop-blur-md" style={{ background: 'rgba(10,10,15,0.9)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-text-primary truncate">{roadmap.targetRole} Roadmap</h1>
            <p className="text-xs text-text-muted">{roadmap.totalWeeks} weeks · Ready by {readyDateStr}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-text-muted">Progress</p>
              <p className="text-lg font-bold gradient-text leading-none">{stats.percentage}%</p>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #818cf8, #6366f1)' }}
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentage}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── Summary Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-6">
            {/* Progress ring */}
            <div className="relative flex-shrink-0">
              <ProgressRing pct={stats.percentage} size={90} stroke={7} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-text-primary">{stats.percentage}%</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-text-primary mb-1">{roadmap.targetRole}</h2>
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{roadmap.aiSummary}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <BookOpen size={13} className="text-accent-light" />
                  {stats.completedCount}/{stats.totalTasks} tasks
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Trophy size={13} className="text-warning" />
                  {stats.weeksCompleted}/{roadmap.totalWeeks} weeks
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Calendar size={13} className="text-success" />
                  Ready {readyDateStr}
                </div>
              </div>
            </div>
          </div>

          {/* Key skills */}
          {roadmap.keySkillsToLearn?.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border/50">
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wide mb-2">Key Skills You'll Build</p>
              <div className="flex flex-wrap gap-2">
                {roadmap.keySkillsToLearn.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-accent-glow border border-accent/20 text-accent-light text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Weekly Plan ── */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-text-primary px-1">Your Week-by-Week Plan</h2>
          {roadmap.weeklyPlan.map((plan) => (
            <WeekCard
              key={plan.week}
              plan={plan}
              isActive={activeWeek === plan.week}
              onToggle={() => handleWeekToggle(plan.week)}
              isTaskCompleted={isTaskCompleted}
              onTaskToggle={toggleTask}
              targetRole={roadmap.targetRole}
            />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 text-center"
        >
          <Sparkles size={24} className="mx-auto mb-3 text-accent-light" />
          <p className="text-text-primary font-semibold mb-1">Ready to practice?</p>
          <p className="text-sm text-text-secondary mb-4">Jump into a mock interview based on your target role.</p>
          <Link
            to={`/setup?role=${encodeURIComponent(roadmap.targetRole)}&from=roadmap`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            <Mic size={16} /> Practice Interview
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
