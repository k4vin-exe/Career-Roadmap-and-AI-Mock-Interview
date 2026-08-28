import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Map, BrainCircuit, ArrowRight, LayoutDashboard, Target, Trophy,
  ShieldAlert, LogOut, Plus, Clock, CheckCircle, Circle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl border border-[#2a2a45] bg-[#12121a]">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-[#686880] mt-0.5">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/user/dashboard');
        setData(res.data.data);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-2 border-transparent border-t-indigo-500"
          />
          <p className="text-[#686880] text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const totalCompleted = data?.interviews.filter(i => i.status === 'completed').length || 0;
  const avgScore = data?.interviews
    .filter(i => i.score !== null)
    .reduce((sum, i, _, arr) => sum + (i.score || 0) / arr.length, 0) || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top Nav */}
      <header className="border-b border-[#2a2a45] bg-[#0a0a0f]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/15">
              <BrainCircuit size={20} className="text-indigo-400" />
            </div>
            <span className="font-bold text-white text-lg">Career R&I</span>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-all"
              >
                <ShieldAlert size={14} />
                Admin
              </button>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a45]">
              <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-[#9898b0]">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#686880] hover:text-white hover:bg-[#1a1a2e] transition-all text-sm"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-[#686880]">Here's your career progress overview.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard value={data?.roadmaps.length || 0} label="Roadmaps Created" icon={<Map size={20} />} />
          <StatCard value={data?.interviews.length || 0} label="Interviews Taken" icon={<BrainCircuit size={20} />} />
          <StatCard value={totalCompleted} label="Interviews Completed" icon={<CheckCircle size={20} />} />
          <StatCard value={avgScore > 0 ? `${Math.round(avgScore)}%` : '—'} label="Avg Score" icon={<Trophy size={20} />} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Roadmaps */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Map size={18} className="text-indigo-400" /> Career Roadmaps
              </h2>
              <button
                onClick={() => navigate('/roadmap/start')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/25 transition-all"
              >
                <Plus size={14} /> New
              </button>
            </div>

            <div className="space-y-3">
              {data?.roadmaps.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-[#2a2a45] text-center">
                  <Target size={36} className="mx-auto text-[#686880] mb-3" />
                  <p className="text-white font-semibold mb-1">No roadmaps yet</p>
                  <p className="text-[#686880] text-sm mb-4">Generate a personalized week-by-week plan</p>
                  <button
                    onClick={() => navigate('/roadmap/start')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                  >
                    Create First Roadmap
                  </button>
                </div>
              ) : (
                data?.roadmaps.map((roadmap, i) => (
                  <motion.div
                    key={roadmap.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Link to={`/roadmap/${roadmap.id}`}>
                      <div className="p-4 rounded-2xl border border-[#2a2a45] bg-[#12121a] hover:border-indigo-500/40 hover:bg-[#1a1a2e] transition-all group cursor-pointer flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 flex-shrink-0">
                            <Map size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{roadmap.targetRole}</p>
                            <p className="text-xs text-[#686880] mt-0.5">{roadmap.totalWeeks} weeks • {roadmap.completedTasksCount} tasks done</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-[#686880] group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Interviews */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit size={18} className="text-indigo-400" /> Mock Interviews
              </h2>
              <button
                onClick={() => navigate('/setup')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/25 transition-all"
              >
                <Plus size={14} /> Practice
              </button>
            </div>

            <div className="space-y-3">
              {data?.interviews.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-[#2a2a45] text-center">
                  <Trophy size={36} className="mx-auto text-[#686880] mb-3" />
                  <p className="text-white font-semibold mb-1">No interviews yet</p>
                  <p className="text-[#686880] text-sm mb-4">Start your first AI-powered mock interview</p>
                  <button
                    onClick={() => navigate('/setup')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                  >
                    Start Interview
                  </button>
                </div>
              ) : (
                data?.interviews.map((interview, i) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Link to={interview.status === 'completed' ? `/report/${interview.id}` : `/interview?sessionId=${interview.id}`}>
                      <div className="p-4 rounded-2xl border border-[#2a2a45] bg-[#12121a] hover:border-indigo-500/40 hover:bg-[#1a1a2e] transition-all group cursor-pointer flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 flex-shrink-0">
                            {interview.status === 'completed' ? <CheckCircle size={18} /> : <Circle size={18} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{interview.role}</p>
                              {interview.status === 'in-progress' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-[#686880] flex items-center gap-1">
                                <Clock size={11} />
                                {new Date(interview.startedAt).toLocaleDateString()}
                              </span>
                              {interview.score !== null && (
                                <span className="text-xs text-emerald-400 flex items-center gap-1">
                                  <Trophy size={11} /> {interview.score}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-[#686880] group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
