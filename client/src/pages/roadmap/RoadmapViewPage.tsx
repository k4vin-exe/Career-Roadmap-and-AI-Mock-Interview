import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, CheckCircle2, Circle, Target,
  Sparkles, Mic, ArrowRight, Loader2, AlertCircle, BookOpen,
  Trophy, Flag, Lock, HelpCircle, Award, Check
} from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import { getRoadmap } from '../../services/roadmapApi';
import { useRoadmapProgress } from '../../hooks/useRoadmapProgress';
import { useInterview } from '../../context/InterviewContext';
import { startInterview } from '../../services/api';
import WeeklyQuiz from '../../components/roadmap/WeeklyQuiz';
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
  plan,
  isActive,
  isUnlocked,
  isWeekDone,
  onToggle,
  isTaskCompleted,
  onTaskToggle,
  isPracticeCompleted,
  onPracticeToggle,
  isQuizCompleted,
  onQuizComplete,
  targetRole,
  onStartInterview,
  isStartingInterview,
}: {
  plan: WeeklyPlan;
  isActive: boolean;
  isUnlocked: boolean;
  isWeekDone: boolean;
  onToggle: () => void;
  isTaskCompleted: (w: number, d: number) => boolean;
  onTaskToggle: (w: number, d: number) => void;
  isPracticeCompleted: (w: number) => boolean;
  onPracticeToggle: (w: number) => void;
  isQuizCompleted: (w: number) => boolean;
  onQuizComplete: (w: number) => void;
  targetRole: string;
  onStartInterview: (week: number) => void;
  isStartingInterview: boolean;
}) {
  const DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const doneTasks = plan.dailyBreakdown.filter((d) => isTaskCompleted(plan.week, d.day)).length;
  const totalTasks = plan.dailyBreakdown.length;
  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const practiceDone = isPracticeCompleted(plan.week);
  const quizDone = isQuizCompleted(plan.week);

  const completeBorder = '1.5px solid rgba(69,166,107,0.4)';
  const lockedBorder = '1px solid var(--border)';
  const activeBorder = isActive ? '1.5px solid var(--primary)' : '1px solid var(--border)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'var(--surface-solid)',
        border: isWeekDone ? completeBorder : !isUnlocked ? lockedBorder : activeBorder,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: isWeekDone ? '0 4px 20px rgba(69,166,107,0.1)' : 'var(--shadow-sm)',
        opacity: isUnlocked ? 1 : 0.85,
        transition: 'all 0.2s',
      }}
    >
      {/* Header Button */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '18px 20px',
          textAlign: 'left',
          cursor: 'pointer',
          background: 'transparent',
          border: 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-muted)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        {/* Left Badge/Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isWeekDone
              ? 'var(--success-soft)'
              : !isUnlocked
              ? 'var(--surface-muted)'
              : 'var(--primary-soft)',
            color: isWeekDone
              ? 'var(--success-text)'
              : !isUnlocked
              ? 'var(--text-muted)'
              : 'var(--primary-text)',
            fontSize: 16,
            fontWeight: 800,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {isWeekDone ? (
            <Trophy size={22} style={{ color: 'var(--success)' }} />
          ) : !isUnlocked ? (
            <Lock size={20} />
          ) : (
            plan.week
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
              {plan.theme}
            </span>

            {isWeekDone ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 10px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: 'var(--success-soft)',
                  color: 'var(--success-text)',
                }}
              >
                <Check size={12} /> Week Completed
              </span>
            ) : !isUnlocked ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 10px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: 'var(--surface-muted)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <Lock size={11} /> Locked
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 10px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary-text)',
                }}
              >
                ⚡ In Progress
              </span>
            )}

            {plan.practiceInterview && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 10px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: 'var(--warning-soft)',
                  color: 'var(--warning-text)',
                }}
              >
                <Mic size={10} /> Interview
              </span>
            )}

            {quizDone && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 10px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: 'rgba(128,103,232,0.12)',
                  color: 'var(--primary)',
                }}
              >
                <Award size={11} /> Quiz Passed
              </span>
            )}
          </div>

          <p
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              margin: 0,
            }}
          >
            {plan.goal}
          </p>
        </div>

        {/* Right Task Counter / Expand */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right', minWidth: 70 }}>
            <p
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontWeight: 700,
                marginBottom: 6,
                margin: '0 0 6px',
              }}
            >
              {doneTasks}/{totalTasks} tasks
            </p>
            <div
              style={{
                width: 80,
                height: 6,
                borderRadius: 100,
                background: 'var(--border)',
                overflow: 'hidden',
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  borderRadius: 100,
                  background: isWeekDone ? 'var(--success)' : 'var(--primary)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${taskPct}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            {isActive ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                borderTop: '1px solid var(--border)',
                background: 'var(--surface-muted)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              {/* If Locked, show guidance notice */}
              {!isUnlocked && (
                <div
                  style={{
                    background: 'rgba(233,119,63,0.08)',
                    border: '1px solid rgba(233,119,63,0.25)',
                    borderRadius: 14,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <Lock size={22} style={{ color: 'var(--coral)', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--coral-text)', margin: '0 0 2px' }}>
                      Week {plan.week} is Currently Locked
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>
                      Complete Week {plan.week - 1}'s daily tasks, weekly practice, and quiz to unlock this week. You can preview the topics and resources below.
                    </p>
                  </div>
                </div>
              )}

              {/* Week Goal Card */}
              <div
                style={{
                  background: 'var(--surface-solid)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                    margin: '0 0 8px',
                  }}
                >
                  Week Goal
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                  {plan.goal}
                </p>
              </div>

              {/* Topics Covered */}
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 10,
                    margin: '0 0 10px',
                  }}
                >
                  Topics Covered
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {plan.topics.map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 600,
                        background: 'var(--surface-solid)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Learning Resources */}
              {plan.resources && plan.resources.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 10,
                      margin: '0 0 10px',
                    }}
                  >
                    Curated Resources
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {plan.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '12px 16px',
                          borderRadius: 10,
                          background: 'var(--surface-solid)',
                          border: '1px solid var(--border)',
                          color: 'var(--primary)',
                          textDecoration: 'none',
                          fontSize: 14,
                          fontWeight: 600,
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--primary)';
                          (e.currentTarget as HTMLAnchorElement).style.background = 'var(--primary-soft)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
                          (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-solid)';
                        }}
                      >
                        <BookOpen size={18} />
                        {res.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Tasks Breakdown */}
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 10,
                    margin: '0 0 10px',
                  }}
                >
                  Daily Breakdown ({doneTasks}/{totalTasks} Completed)
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.dailyBreakdown.map((d) => {
                    const isDone = isTaskCompleted(plan.week, d.day);
                    return (
                      <button
                        key={d.day}
                        onClick={() => {
                          if (isUnlocked) onTaskToggle(plan.week, d.day);
                        }}
                        disabled={!isUnlocked}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: '14px 16px',
                          borderRadius: 12,
                          cursor: isUnlocked ? 'pointer' : 'not-allowed',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                          border: 'none',
                          background: isDone
                            ? 'rgba(69,166,107,0.08)'
                            : 'var(--surface-solid)',
                          boxShadow: 'var(--shadow-sm)',
                          outline: isDone
                            ? '1.5px solid rgba(69,166,107,0.3)'
                            : '1.5px solid var(--border)',
                        }}
                        onMouseEnter={(e) => {
                          if (isUnlocked && !isDone) {
                            (e.currentTarget as HTMLButtonElement).style.outline =
                              '1.5px solid rgba(128,103,232,0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isUnlocked) {
                            (e.currentTarget as HTMLButtonElement).style.outline = isDone
                              ? '1.5px solid rgba(69,166,107,0.3)'
                              : '1.5px solid var(--border)';
                          }
                        }}
                      >
                        <div style={{ flexShrink: 0 }}>
                          {isDone ? (
                            <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />
                          ) : (
                            <Circle size={22} style={{ color: 'var(--text-light)' }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: isDone ? 'var(--text-muted)' : 'var(--text)',
                              textDecoration: isDone ? 'line-through' : 'none',
                              lineHeight: 1.5,
                              display: 'block',
                            }}
                          >
                            {d.task}
                          </span>
                        </div>
                        <div
                          style={{
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: 2,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                            }}
                          >
                            {DAY[d.day - 1] ?? `Day ${d.day}`}
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

              {/* ── Weekly Practice of the Week Section ── */}
              <div
                style={{
                  background: 'var(--surface-solid)',
                  border: practiceDone ? '1.5px solid rgba(69,166,107,0.35)' : '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: practiceDone ? 'var(--success-soft)' : 'var(--coral-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: practiceDone ? 'var(--success)' : 'var(--coral)',
                      }}
                    >
                      <Flag size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Weekly Practice & Milestone
                        </span>
                        {practiceDone && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 100,
                              fontSize: 10,
                              fontWeight: 800,
                              background: 'var(--success-soft)',
                              color: 'var(--success-text)',
                              textTransform: 'uppercase',
                            }}
                          >
                            Completed ✓
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                        {plan.milestone}
                      </p>
                    </div>
                  </div>

                  {/* Practice Toggle Button */}
                  {isUnlocked && (
                    <button
                      onClick={() => onPracticeToggle(plan.week)}
                      className={practiceDone ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {practiceDone ? (
                        <>
                          <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Practice Completed
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Mark Practice as Done
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Optional Mock Interview CTA */}
                {plan.practiceInterview && isUnlocked && (
                  <button
                    onClick={() => onStartInterview(plan.week)}
                    disabled={isStartingInterview}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      padding: '14px 18px',
                      borderRadius: 12,
                      cursor: isStartingInterview ? 'not-allowed' : 'pointer',
                      background: 'var(--primary-soft)',
                      border: '1px solid rgba(128,103,232,0.2)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      opacity: isStartingInterview ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isStartingInterview) e.currentTarget.style.background = 'rgba(128,103,232,0.18)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isStartingInterview) e.currentTarget.style.background = 'var(--primary-soft)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'var(--shadow-sm)',
                          color: 'var(--primary)',
                        }}
                      >
                        {isStartingInterview ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Mic size={18} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-text)', margin: '0 0 2px' }}>
                          {isStartingInterview ? 'Starting Voice Interview...' : 'Practice Voice Interview'}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                          Simulate real questions on {plan.theme}
                        </p>
                      </div>
                    </div>
                    {!isStartingInterview && <ArrowRight size={18} style={{ color: 'var(--primary)' }} />}
                  </button>
                )}
              </div>

              {/* ── Weekly Quiz Section ── */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <HelpCircle size={16} style={{ color: 'var(--primary)' }} />
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      margin: 0,
                    }}
                  >
                    Week Knowledge Check Quiz
                  </p>
                </div>

                {!isUnlocked ? (
                  <div
                    style={{
                      background: 'var(--surface-solid)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Lock size={18} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      Unlock Week {plan.week} to access the knowledge quiz.
                    </span>
                  </div>
                ) : !practiceDone ? (
                  <div
                    style={{
                      background: 'var(--surface-solid)',
                      border: '1.5px dashed var(--border)',
                      borderRadius: 16,
                      padding: '24px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: 'var(--surface-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Lock size={18} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px' }}>
                          Quiz Locked
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                          Complete the weekly tasks and mark the practice milestone as done to unlock the quiz.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onPracticeToggle(plan.week)}
                      className="btn btn-secondary btn-sm"
                    >
                      Mark Practice Done to Unlock
                    </button>
                  </div>
                ) : (
                  <WeeklyQuiz
                    weekNumber={plan.week}
                    theme={plan.theme}
                    goal={plan.goal}
                    topics={plan.topics}
                    targetRole={targetRole}
                    isCompleted={quizDone}
                    onQuizComplete={onQuizComplete}
                  />
                )}
              </div>
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
      setRoadmap(state.roadmap);
      setLoading(false);
      return;
    }
    if (!profileId) {
      navigate('/roadmap/start');
      return;
    }
    setLoading(true);
    getRoadmap(profileId)
      .then((r) => {
        setRoadmap(r);
        dispatch({ type: 'SET_ROADMAP', payload: r });
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(err.response?.data?.error || 'Roadmap not found.');
        setLoading(false);
      });
  }, [profileId, navigate, state.roadmap, dispatch]);

  const {
    stats,
    toggleTask,
    togglePractice,
    completeQuiz,
    isTaskCompleted,
    isPracticeCompleted,
    isQuizCompleted,
    isWeekCompleted,
    isWeekUnlocked,
  } = useRoadmapProgress(roadmap);

  // Set default active week to current working week
  useEffect(() => {
    if (stats.currentWeek && stats.currentWeek !== activeWeek && activeWeek === 1) {
      setActiveWeek(stats.currentWeek);
    }
  }, [stats.currentWeek]);

  const handleWeekToggle = useCallback((w: number) => {
    setActiveWeek((p) => (p === w ? 0 : w));
  }, []);

  const { dispatch: interviewDispatch } = useInterview();
  const [startingInterviewWeek, setStartingInterviewWeek] = useState<number | null>(null);

  const handleStartInterview = useCallback(
    async (week: number) => {
      if (!roadmap) return;
      setStartingInterviewWeek(week);

      try {
        const unlock = new SpeechSynthesisUtterance('');
        unlock.volume = 0;
        window.speechSynthesis.speak(unlock);
      } catch {
        /* ignored */
      }

      try {
        let mappedExp = 'Beginner';
        const rawExp = String(roadmap.profile?.workExperience || '').toLowerCase();
        if (rawExp.includes('3') || rawExp.includes('4') || rawExp.includes('5') || rawExp === '1-2') {
          mappedExp = 'Intermediate';
        }
        if (rawExp.includes('10') || rawExp.includes('5-10')) {
          mappedExp = 'Experienced';
        }

        const userName = roadmap.profile?.name || 'Candidate';
        const session = await startInterview(userName, roadmap.targetRole, mappedExp);
        interviewDispatch({ type: 'START_SESSION', payload: session });
        navigate('/warmup');
      } catch (err: any) {
        console.error('Interview start error:', err);
        const errorMsg = err.response?.data?.errors
          ? err.response.data.errors.map((e: any) => e.msg).join(', ')
          : err.response?.data?.error || err.message || 'Failed to start interview.';
        alert(`Error starting interview: ${errorMsg}`);
        setStartingInterviewWeek(null);
      }
    },
    [roadmap, interviewDispatch, navigate]
  );

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading your roadmap…</p>
        </div>
      </div>
    );
  }

  if (fetchError || !roadmap) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 500, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <AlertCircle size={48} style={{ color: 'var(--coral)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
            {fetchError || 'Roadmap not found'}
          </p>
          <button onClick={() => navigate('/roadmap/start')} className="btn btn-primary">
            Create New Roadmap
          </button>
        </div>
      </div>
    );
  }

  const readyDate = new Date(roadmap.estimatedReadinessDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div style={{ flex: 1, width: '100%', paddingBottom: 80 }}>
      {/* Sticky Header */}
      <div
        style={{
          position: 'sticky',
          top: 60,
          zIndex: 20,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 1px 12px rgba(39,48,72,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 860,
            margin: '0 auto',
            padding: '16px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: 'var(--text)',
                  letterSpacing: '-0.3px',
                  margin: 0,
                }}
              >
                {roadmap.targetRole}
              </h1>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 800,
                  background: 'var(--primary-soft)',
                  color: 'var(--primary-text)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Week {stats.currentWeek} Active
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0 0' }}>
              {roadmap.totalWeeks} weeks &middot; Ready by {readyDate}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '0 0 4px',
              }}
            >
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
            animate={{ width: `${stats.percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Page Body */}
      <div
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
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
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)' }}>
                  {stats.percentage}%
                </span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px' }}>
                Your Personalized Journey
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 18px' }}>
                {roadmap.aiSummary}
              </p>
              <div style={{ display: 'flex', gap: 28, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={16} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {stats.completedCount} / {stats.totalTasks} Daily Tasks
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trophy size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {stats.weeksCompleted} / {roadmap.totalWeeks} Weeks Mastered
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    Current: Week {stats.currentWeek}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {roadmap.keySkillsToLearn?.length > 0 && (
            <div style={{ padding: '20px 32px 28px', borderTop: '1px solid var(--border)' }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: '0 0 12px',
                }}
              >
                Key Skills You'll Master
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {roadmap.keySkillsToLearn.map((s) => (
                  <span
                    key={s}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: 700,
                      background: 'var(--cyan-soft)',
                      border: '1px solid rgba(14,165,201,0.2)',
                      color: 'var(--cyan-text)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Week-by-Week Visual Stepper Bar ── */}
        <div
          style={{
            background: 'var(--surface-solid)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Week-by-Week Progression
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
              Week {stats.currentWeek} of {roadmap.totalWeeks}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {roadmap.weeklyPlan.map((plan) => {
              const done = isWeekCompleted(plan);
              const unlocked = isWeekUnlocked(plan.week);
              const isCurrent = plan.week === stats.currentWeek;
              const isCardActive = activeWeek === plan.week;

              return (
                <button
                  key={plan.week}
                  onClick={() => setActiveWeek(plan.week)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: isCardActive
                      ? '1.5px solid var(--primary)'
                      : done
                      ? '1px solid rgba(69,166,107,0.3)'
                      : '1px solid var(--border)',
                    background: isCardActive
                      ? 'var(--primary-soft)'
                      : done
                      ? 'var(--success-soft)'
                      : !unlocked
                      ? 'var(--surface-muted)'
                      : 'var(--surface-solid)',
                    color: isCardActive
                      ? 'var(--primary-text)'
                      : done
                      ? 'var(--success-text)'
                      : !unlocked
                      ? 'var(--text-muted)'
                      : 'var(--text)',
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {done ? (
                    <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                  ) : !unlocked ? (
                    <Lock size={12} />
                  ) : (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: isCurrent ? 'var(--primary)' : 'var(--text-light)' }} />
                  )}
                  Week {plan.week}
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Plan Cards List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--primary-soft)',
              }}
            >
              <Target size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.2px', margin: 0 }}>
                Week-by-Week Execution
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Complete daily tasks, practice milestones, and pass each week's quiz to advance
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {roadmap.weeklyPlan.map((plan, idx) => {
              const unlocked = isWeekUnlocked(plan.week);
              const done = isWeekCompleted(plan);

              return (
                <motion.div
                  key={plan.week}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                >
                  <WeekCard
                    plan={plan}
                    isActive={activeWeek === plan.week}
                    isUnlocked={unlocked}
                    isWeekDone={done}
                    onToggle={() => handleWeekToggle(plan.week)}
                    isTaskCompleted={isTaskCompleted}
                    onTaskToggle={toggleTask}
                    isPracticeCompleted={isPracticeCompleted}
                    onPracticeToggle={togglePractice}
                    isQuizCompleted={isQuizCompleted}
                    onQuizComplete={completeQuiz}
                    targetRole={roadmap.targetRole}
                    onStartInterview={handleStartInterview}
                    isStartingInterview={startingInterviewWeek === plan.week}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, #1a1c26 0%, #23253b 100%)',
            borderRadius: 20,
            padding: '36px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                marginBottom: 16,
                background: 'rgba(128,103,232,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={26} style={{ color: '#b8a9ff' }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
              Ready to test your skills?
            </h3>
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
