import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, CheckCircle2, Circle, Target,
  Sparkles, Mic, ArrowRight, Loader2, AlertCircle, BookOpen,
  Trophy, Flag,
} from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import { getRoadmap } from '../../services/roadmapApi';
import { useRoadmapProgress } from '../../hooks/useRoadmapProgress';
import type { Roadmap, WeeklyPlan } from '../../utils/roadmapTypes';

function ProgressRing({ pct, size = 120, stroke = 10 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--primary)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

function WeekCard({
  plan, isActive, onToggle, isTaskCompleted, onTaskToggle, targetRole,
}: {
  plan: WeeklyPlan; isActive: boolean; onToggle: () => void;
  isTaskCompleted: (w: number, d: number) => boolean;
  onTaskToggle: (w: number, d: number) => void;
  targetRole: string;
}) {
  const DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const done = plan.dailyBreakdown.filter((d) => isTaskCompleted(plan.week, d.day)).length;
  const total = plan.dailyBreakdown.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;

  const completeBorder = '1px solid rgba(69,166,107,0.3)';
  const defaultBorder = '1px solid var(--border)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'var(--surface-solid)',
        border: complete ? completeBorder : defaultBorder,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 16,
          padding: '18px 20px', textAlign: 'left', cursor: 'pointer',
          background: 'transparent', border: 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-muted)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: complete ? 'var(--success-soft)' : 'var(--primary-soft)',
          color: complete ? 'var(--success-text)' : 'var(--primary-text)',
          fontSize: 16, fontWeight: 800,
        }}>
          {complete ? <Trophy size={20} /> : plan.week}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{plan.theme}</span>
            {plan.practiceInterview && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 10px', borderRadius: 100, fontSize: 11,
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                background: 'var(--warning-soft)', color: 'var(--warning-text)',
              }}>
                <Mic size={10} /> Interview
              </span>
            )}
            {complete && (
              <span style={{
                padding: '2px 10px', borderRadius: 100, fontSize: 11,
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                background: 'var(--success-soft)', color: 'var(--success-text)',
              }}>
                Complete
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
            {plan.goal}
          </p>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right', minWidth: 64 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, margin: '0 0 6px' }}>{done}/{total} tasks</p>
            <div style={{ width: 80, height: 5, borderRadius: 100, background: 'var(--border)', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 100, background: complete ? 'var(--success)' : 'var(--primary)' }}
                initial={{ width: 0 }}
                animate={{ width: pct + '%' }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-muted)', border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}>
            {isActive ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--surface-muted)',
              padding: '28px 24px',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}>
              <div style={{
                background: 'var(--surface-solid)',
                border: '1px solid var(--border)',
                borderRadius: 14, padding: '16px 20px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, margin: '0 0 8px' }}>
                  Week Goal
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{plan.goal}</p>
              </div>

              <div>
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, margin: '0 0 10px' }}>
                  Topics Covered
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {plan.topics.map((t) => (
                    <span key={t} style={{
                      padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                      background: 'var(--surface-solid)', border: '1px solid var(--border)',
                      color: 'var(--text-muted)', boxShadow: 'var(--shadow-sm)',
                    }}>{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, margin: '0 0 10px' }}>
                  Daily Tasks
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.dailyBreakdown.map((d) => {
                    const isDone = isTaskCompleted(plan.week, d.day);
                    return (
                      <button
                        key={d.day}
                        onClick={() => onTaskToggle(plan.week, d.day)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                          textAlign: 'left', transition: 'all 0.15s', border: 'none',
                          background: isDone ? 'rgba(69,166,107,0.08)' : 'var(--surface-solid)',
                          boxShadow: 'var(--shadow-sm)',
                          outline: isDone ? '1.5px solid rgba(69,166,107,0.25)' : '1.5px solid var(--border)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isDone) (e.currentTarget as HTMLButtonElement).style.outline = '1.5px solid rgba(128,103,232,0.4)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.outline = isDone ? '1.5px solid rgba(69,166,107,0.25)' : '1.5px solid var(--border)';
                        }}
                      >
                        <div style={{ flexShrink: 0 }}>
                          {isDone
                            ? <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />
                            : <Circle size={22} style={{ color: 'var(--text-light)' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            fontSize: 14, fontWeight: 500,
                            color: isDone ? 'var(--text-muted)' : 'var(--text)',
                            textDecoration: isDone ? 'line-through' : 'none',
                            lineHeight: 1.5, display: 'block',
                          }}>
                            {d.task}
                          </span>
                        </div>
                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {DAY[d.day - 1] ?? ('Day ' + d.day)}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                            {d.estimatedHours}h
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                borderRadius: 14, background: 'var(--coral-soft)',
                border: '1px solid rgba(233,119,63,0.2)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: 'var(--shadow-sm)',
                }}>
                  <Flag size={18} style={{ color: 'var(--coral)' }} />
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--coral-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, margin: '0 0 4px' }}>
                    Week Milestone
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{plan.milestone}</p>
                </div>
              </div>

              {plan.practiceInterview && (
                <Link
                  to={'/setup?role=' + encodeURIComponent(targetRole) + '&from=roadmap'}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    padding: '18px 20px', borderRadius: 14, textDecoration: 'none',
                    background: 'var(--primary-soft)', border: '1px solid rgba(128,103,232,0.2)',
                    boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      <Mic size={20} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary-text)', marginBottom: 2, margin: '0 0 2px' }}>Practice Interview</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Test your knowledge from this week</p>
                    </div>
                  </div>
                  <ArrowRight size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RoadmapViewPage() {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useRoadmap();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(state.roadmap);
  const [loading, setLoading] = useState(!state.roadmap);
  const [fetchError, setFetchError] = useState('');
  const [activeWeek, setActiveWeek] = useState<number>(1);

  useEffect(() => {
    if (state.roadmap && state.roadmap.profileId === profileId) {
      setRoadmap(state.roadmap); setLoading(false); return;
    }
    if (!profileId) { navigate('/roadmap/start'); return; }
    setLoading(true);
    getRoadmap(profileId)
      .then((r) => { setRoadmap(r); dispatch({ type: 'SET_ROADMAP', payload: r }); setLoading(false); })
      .catch((err) => { setFetchError(err.response?.data?.error || 'Roadmap not found.'); setLoading(false); });
  }, [profileId, navigate, state.roadmap, dispatch]);

  const { stats, toggleTask, isTaskCompleted } = useRoadmapProgress(roadmap);
  const handleWeekToggle = useCallback((w: number) => setActiveWeek((p) => (p === w ? 0 : w)), []);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading your roadmap…</p>
      </div>
    </div>
  );

  if (fetchError || !roadmap) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 500, padding: '0 16px' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <AlertCircle size={48} style={{ color: 'var(--coral)', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>{fetchError || 'Roadmap not found'}</p>
        <button onClick={() => navigate('/roadmap/start')} className="btn btn-primary">Create New Roadmap</button>
      </div>
    </div>
  );

  const readyDate = new Date(roadmap.estimatedReadinessDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{ flex: 1, width: '100%', paddingBottom: 80 }}>

      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 60, zIndex: 20,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 12px rgba(39,48,72,0.06)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 4, margin: '0 0 4px' }}>
              {roadmap.targetRole}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
              {roadmap.totalWeeks} weeks &middot; Ready by {readyDate}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, margin: '0 0 4px' }}>
              Overall Progress
            </p>
            <p style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary)', lineHeight: 1, margin: 0 }}>
              {stats.percentage}%
            </p>
          </div>
        </div>
        <div style={{ height: 3, background: 'var(--surface-muted)', position: 'relative' }}>
          <motion.div
            style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: 'var(--primary)', borderRadius: 2 }}
            initial={{ width: 0 }}
            animate={{ width: stats.percentage + '%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Page Body */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Journey Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--surface-solid)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, padding: '32px 32px 24px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <ProgressRing pct={stats.percentage} size={120} stroke={10} />
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)' }}>{stats.percentage}%</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 10, margin: '0 0 10px' }}>Your Journey</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 18, margin: '0 0 18px' }}>{roadmap.aiSummary}</p>
              <div style={{ display: 'flex', gap: 28, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={16} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {stats.completedCount} / {stats.totalTasks} Tasks
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trophy size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {stats.weeksCompleted} / {roadmap.totalWeeks} Weeks
                  </span>
                </div>
              </div>
            </div>
          </div>
          {roadmap.keySkillsToLearn?.length > 0 && (
            <div style={{ padding: '20px 32px 28px', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, margin: '0 0 12px' }}>
                Key Skills You'll Master
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {roadmap.keySkillsToLearn.map((s) => (
                  <span key={s} style={{
                    padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                    background: 'var(--cyan-soft)', border: '1px solid rgba(14,165,201,0.2)',
                    color: 'var(--cyan-text)', boxShadow: 'var(--shadow-sm)',
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Weekly Plan */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--primary-soft)',
            }}>
              <Target size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.2px', margin: 0 }}>Week-by-Week Execution</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, margin: '2px 0 0' }}>Click any week to expand tasks</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {roadmap.weeklyPlan.map((plan, idx) => (
              <motion.div
                key={plan.week}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25 }}
              >
                <WeekCard
                  plan={plan}
                  isActive={activeWeek === plan.week}
                  onToggle={() => handleWeekToggle(plan.week)}
                  isTaskCompleted={isTaskCompleted}
                  onTaskToggle={toggleTask}
                  targetRole={roadmap.targetRole}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, #1a1c26 0%, #23253b 100%)',
            borderRadius: 20, padding: '36px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
            flexWrap: 'wrap', boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div>
            <div style={{
              width: 52, height: 52, borderRadius: 14, marginBottom: 16,
              background: 'rgba(128,103,232,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={26} style={{ color: '#b8a9ff' }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8, margin: '0 0 8px' }}>Ready to test your skills?</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', maxWidth: 420, lineHeight: 1.6, margin: 0 }}>
              Jump into an AI mock interview tailored for the{' '}
              <strong style={{ color: '#b8a9ff' }}>{roadmap.targetRole}</strong> role.
            </p>
          </div>
          <Link
            to={'/setup?role=' + encodeURIComponent(roadmap.targetRole) + '&from=roadmap'}
            className="btn btn-primary btn-lg"
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <Mic size={18} /> Start Practice Interview
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
