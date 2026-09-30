/**
 * AdminDashboardPage — Light theme admin panel.
 * All API calls, stats fetching, and table data are fully preserved.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, BrainCircuit, Map, ArrowLeft, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { MetricCard } from '../../components/common/MetricCard';
import { SkeletonCard, Skeleton } from '../../components/common/Skeleton';
import { StatusBadge } from '../../components/common/StatusBadge';

interface AdminStats {
  totalUsers: number;
  totalInterviews: number;
  totalRoadmaps: number;
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats,       setStats]       = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  useEffect(() => {
    api.get('/user/admin/dashboard')
      .then((res) => {
        setStats(res.data.data.stats);
        setRecentUsers(res.data.data.recentUsers);
      })
      .catch(() => setError('Failed to load admin data. Make sure you have admin access.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Skeleton width={260} height={28} borderRadius={10} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} height={120} />)}
        </div>
        <SkeletonCard height={300} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--danger-text)', marginBottom: 16 }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-md">
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--warning-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)', flexShrink: 0 }}>
          <ShieldAlert size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            System Overview
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Platform-wide statistics and user management.</p>
        </div>
      </motion.div>

      {/* ── Metric cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}
      >
        <MetricCard
          label="Total Users"
          value={stats?.totalUsers ?? '—'}
          icon={<Users size={20} />}
          color="primary"
          trend={{ direction: 'up', label: 'Registered users' }}
        />
        <MetricCard
          label="Total Interviews"
          value={stats?.totalInterviews ?? '—'}
          icon={<BrainCircuit size={20} />}
          color="coral"
          trend={{ direction: 'up', label: 'All time' }}
        />
        <MetricCard
          label="Roadmaps Generated"
          value={stats?.totalRoadmaps ?? '—'}
          icon={<Map size={20} />}
          color="cyan"
          trend={{ direction: 'up', label: 'Career plans' }}
        />
      </motion.div>

      {/* ── Recent registrations ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="card"
        style={{ padding: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Activity size={15} />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Recent Registrations</h2>
          <span className="badge badge-muted" style={{ marginLeft: 'auto' }}>
            {recentUsers.length} users
          </span>
        </div>

        {/* Desktop table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User', 'Email', 'Role', 'Joined'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px 12px', textAlign: 'center', color: 'var(--text-light)' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                recentUsers.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-muted)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--primary-soft)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: 'var(--primary-text)',
                            flexShrink: 0,
                          }}
                        >
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <StatusBadge status={u.role} />
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
