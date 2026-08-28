import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, BrainCircuit, Map, ArrowLeft, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/user/admin/dashboard');
        setStats(res.data.data.stats);
        setRecentUsers(res.data.data.recentUsers);
      } catch {
        setError('Failed to load admin data. Make sure you have admin access.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-transparent border-t-amber-500"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center flex-col gap-4">
        <ShieldAlert size={40} className="text-red-400" />
        <p className="text-red-400 text-center">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="text-indigo-400 hover:underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top Nav */}
      <header className="border-b border-[#2a2a45] bg-[#0a0a0f]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/15">
              <ShieldAlert size={20} className="text-amber-400" />
            </div>
            <span className="font-bold text-white text-lg">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a45] text-[#9898b0] text-sm hover:text-white transition-all"
            >
              <ArrowLeft size={14} />
              My Dashboard
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a45]">
              <div className="w-6 h-6 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-300 text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-[#9898b0]">{user?.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400">admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <ShieldAlert size={28} className="text-amber-400" />
            System Overview
          </h1>
          <p className="text-[#686880]">Platform-wide statistics and user management.</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: <Users size={22} />, value: stats?.totalUsers, label: 'Total Users', color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
            { icon: <BrainCircuit size={22} />, value: stats?.totalInterviews, label: 'Total Interviews', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
            { icon: <Map size={22} />, value: stats?.totalRoadmaps, label: 'Roadmaps Generated', color: 'text-violet-400', bg: 'bg-violet-500/15' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="p-6 rounded-2xl border border-[#2a2a45] bg-[#12121a]"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-4`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-white">{stat.value ?? '—'}</p>
              <p className="text-sm text-[#686880] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Users Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Activity size={18} className="text-indigo-400" /> Recent Registrations
          </h2>
          <div className="rounded-2xl border border-[#2a2a45] bg-[#12121a] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#2a2a45] bg-[#0a0a0f]/50">
                  <th className="px-6 py-4 text-xs font-semibold text-[#686880] uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#686880] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#686880] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#686880] uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a45]">
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-[#686880]">No users found</td>
                  </tr>
                ) : (
                  recentUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-[#1a1a2e]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-sm font-bold">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#9898b0]">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-[#1a1a2e] text-[#9898b0]'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#686880]">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
