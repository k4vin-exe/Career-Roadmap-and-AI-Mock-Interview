/**
 * LoginPage — Light theme auth page with split branding panel.
 */

import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, BrainCircuit, Map, Mic, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const FEATURES = [
  { icon: Map,      text: 'Personalized week-by-week career roadmaps' },
  { icon: Mic,      text: 'AI voice mock interviews with instant feedback' },
  { icon: BarChart3,text: 'Detailed performance tracking and reports' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.data);
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'var(--bg)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* ── Left branding panel ── */}
      <div
        style={{
          width: '45%',
          flexShrink: 0,
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 48px',
          background: 'linear-gradient(160deg, #5d45c7 0%, #8067e8 45%, #a855f7 100%)',
          color: '#fff',
        }}
        className="auth-brand-panel"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={22} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.3px' }}>Career R&amp;I</span>
        </div>

        {/* Hero text */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.25, marginBottom: 16, letterSpacing: '-0.5px' }}
          >
            Your AI-Powered<br />Career Co-Pilot
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.7, marginBottom: 32 }}
          >
            Build personalized roadmaps, practice interviews with AI, and land your dream role — all in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} />
                </div>
                <span style={{ fontSize: 14, opacity: 0.9 }}>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <p style={{ fontSize: 12, opacity: 0.5 }}>© 2025 Career R&amp;I</p>
      </div>

      {/* ── Right form panel ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Mobile logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 32 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.2px' }}>Career R&amp;I</span>
          </Link>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.3px' }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Sign in to your account to continue</p>

          <div className="card" style={{ padding: 28 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Email */}
              <div>
                <label className="input-label">Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="input-field"
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="input-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input-field"
                    style={{ paddingLeft: 40, paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center' }}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--danger-soft)', border: '1px solid rgba(217,87,87,0.2)', color: 'var(--danger-text)', fontSize: 13 }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 4, justifyContent: 'center' }}
              >
                {loading ? (
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <><LogIn size={17} /> Sign In</>
                )}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>

          {/* Admin hint */}
          <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 12, background: 'var(--warning-soft)', border: '1px solid rgba(217,154,50,0.25)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>🔐 Admin Credentials</p>
            <p style={{ fontSize: 12, color: 'var(--warning-text)', marginBottom: 2 }}><strong>Email:</strong> admin@aicareerhub.com</p>
            <p style={{ fontSize: 12, color: 'var(--warning-text)' }}><strong>Password:</strong> Admin@123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
