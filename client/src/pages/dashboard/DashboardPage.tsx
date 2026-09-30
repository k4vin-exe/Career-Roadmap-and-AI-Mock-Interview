/**
 * DashboardPage — Career command center overview.
 * Shows metric cards, recent interviews, roadmap snapshot, and next best actions.
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Map, BrainCircuit, Trophy, CheckCircle,
  Clock, Plus, Target, Play,
  ChevronRight,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { MetricCard } from '../../components/common/MetricCard';
import { ProgressRing } from '../../components/common/ProgressRing';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCard, Skeleton } from '../../components/common/Skeleton';
import { StatusBadge } from '../../components/common/StatusBadge';

interface DashboardData {
  roadmaps: Array<{
    id: string;
    targetRole: string;
    totalWeeks: number;
    createdAt: string;
    completedTasksCount: number;
  }>;
  interviews: Array<{
    id: string;
    role: string;
    experience: string;
    status: string;
    startedAt: string;
    duration: number;
    score: number | null;
  }>;
}

const stagger = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'var(--success-text)' :
    score >= 60 ? 'var(--warning-text)' :
    'var(--danger-text)';
  const bg =
    score >= 80 ? 'var(--success-soft)' :
    score >= 60 ? 'var(--warning-soft)' :
    'var(--danger-soft)';

  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 700,
        color,
        background: bg,
      }}
    >
      {score}%
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/user/dashboard')
      .then((res) => setData(res.data.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  // Computed stats
  const totalCompleted = data?.interviews.filter((i) => i.status === 'completed').length ?? 0;
  const scores = data?.interviews.filter((i) => i.score != null).map((i) => i.score as number) ?? [];
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const latestRoadmap = data?.roadmaps[0] ?? null;
  const recentInterviews = data?.interviews.slice(0, 4) ?? [];
  const roadmapProgress =
    latestRoadmap && latestRoadmap.totalWeeks > 0
      ? Math.min(100, Math.round((latestRoadmap.completedTasksCount / (latestRoadmap.totalWeeks * 5)) * 100))
      : 0;

  const greeting =
    new Date().getHours() < 12 ? 'Good morning' :
    new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Welcome skeleton */}
        <div>
          <Skeleton width={240} height={28} borderRadius={10} />
          <Skeleton width={160} height={16} borderRadius={8} style={{ marginTop: 8 }} />
        </div>
        {/* Metric cards skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} height={120} />)}
        </div>
        {/* Content skeletons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <SkeletonCard height={200} />
          <SkeletonCard height={200} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '48px 0',
          textAlign: 'center',
          color: 'var(--danger-text)',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Welcome banner ── */}
      <motion.div {...stagger} transition={{ duration: 0.3 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.3px' }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Here's your career preparation overview for today.
        </p>
      </motion.div>

      {/* ── Metric cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <MetricCard
          label="Roadmap Progress"
          value={latestRoadmap ? `${roadmapProgress}%` : '—'}
          sublabel={latestRoadmap ? `${latestRoadmap.completedTasksCount} tasks done` : 'No roadmap yet'}
          icon={<Map size={20} />}
          color="primary"
          progress={roadmapProgress}
        />
        <MetricCard
          label="Interviews Done"
          value={data?.interviews.length ?? 0}
          sublabel={`${totalCompleted} completed`}
          icon={<BrainCircuit size={20} />}
          color="coral"
          trend={totalCompleted > 0 ? { direction: 'up', label: `${totalCompleted} completed` } : undefined}
        />
        <MetricCard
          label="Avg Interview Score"
          value={avgScore > 0 ? `${avgScore}%` : '—'}
          sublabel={scores.length ? `Based on ${scores.length} session${scores.length > 1 ? 's' : ''}` : 'No scores yet'}
          icon={<Trophy size={20} />}
          color="warning"
          trend={avgScore > 0 ? { direction: avgScore >= 70 ? 'up' : 'neutral', label: avgScore >= 70 ? 'On track' : 'Keep practicing' } : undefined}
        />
        <MetricCard
          label="Roadmaps Created"
          value={data?.roadmaps.length ?? 0}
          sublabel={latestRoadmap ? latestRoadmap.targetRole : 'Create your first roadmap'}
          icon={<Target size={20} />}
          color="cyan"
        />
      </motion.div>

      {/* ── Main grid: roadmap + interviews ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* My Roadmap card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <div className="card" style={{ padding: 24, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Map size={17} />
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Career Roadmaps</h2>
              </div>
              <button
                onClick={() => navigate('/roadmap/start')}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} /> New
              </button>
            </div>

            {!data?.roadmaps.length ? (
              <EmptyState
                icon={<Map size={28} />}
                title="No roadmaps yet"
                body="Generate a personalized week-by-week learning plan for your target role."
                cta={{ label: 'Build my roadmap', onClick: () => navigate('/roadmap/start') }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.roadmaps.map((rm, i) => (
                  <Link
                    key={rm.id}
                    to={`/roadmap/${rm.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: 14,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-muted)',
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'var(--primary-soft)';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-muted)';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ProgressRing
                          progress={Math.min(100, Math.round((rm.completedTasksCount / (rm.totalWeeks * 5)) * 100))}
                          size={40}
                          strokeWidth={4}
                          label={`${Math.min(100, Math.round((rm.completedTasksCount / (rm.totalWeeks * 5)) * 100))}%`}
                        />
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{rm.targetRole}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {rm.totalWeeks} weeks · {rm.completedTasksCount} tasks done
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Mock Interviews card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="card" style={{ padding: 24, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--coral-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--coral)' }}>
                  <BrainCircuit size={17} />
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Mock Interviews</h2>
              </div>
              <button
                onClick={() => navigate('/setup')}
                className="btn btn-coral btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Play size={13} /> Practice
              </button>
            </div>

            {!data?.interviews.length ? (
              <EmptyState
                icon={<BrainCircuit size={28} />}
                title="No interviews yet"
                body="Start your first AI-powered mock interview and get real-time feedback."
                cta={{ label: 'Start Interview', onClick: () => navigate('/setup'), variant: 'coral' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentInterviews.map((iv) => (
                  <Link
                    key={iv.id}
                    to={iv.status === 'completed' ? `/report/${iv.id}` : `/interview?sessionId=${iv.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-muted)',
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'var(--coral-soft)';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--coral)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-muted)';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 9,
                          background: iv.status === 'completed' ? 'var(--success-soft)' : 'var(--primary-soft)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: iv.status === 'completed' ? 'var(--success)' : 'var(--primary)',
                          flexShrink: 0,
                        }}>
                          {iv.status === 'completed' ? <CheckCircle size={15} /> : <Clock size={15} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {iv.role}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {new Date(iv.startedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {iv.score != null && <ScoreBadge score={iv.score} />}
                        {iv.status === 'in-progress' && <StatusBadge status="active" label="Active" />}
                        <ChevronRight size={15} style={{ color: 'var(--text-light)' }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Dark CTA card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.3 }}
        className="card-dark"
        style={{
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, #1a1c26 0%, #232538 100%)',
        }}
      >
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Next up
          </p>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            {latestRoadmap
              ? `Continue your ${latestRoadmap.targetRole} roadmap`
              : 'Start your career journey today'}
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 440 }}>
            {latestRoadmap
              ? `${roadmapProgress}% complete — keep the momentum going and finish this week's tasks.`
              : 'Generate a personalized roadmap and start practising mock interviews to land your dream role.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          {latestRoadmap ? (
            <>
              <button
                onClick={() => navigate(`/roadmap/${latestRoadmap.id}`)}
                className="btn btn-primary btn-md"
                style={{ whiteSpace: 'nowrap' }}
              >
                <Map size={16} /> View Roadmap
              </button>
              <button
                onClick={() => navigate('/setup')}
                className="btn btn-ghost btn-md"
                style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)', whiteSpace: 'nowrap' }}
              >
                Practice Interview
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/roadmap/start')}
              className="btn btn-primary btn-md"
            >
              <Target size={16} /> Build My Roadmap
            </button>
          )}
        </div>
      </motion.div>

    </div>
  );
}
