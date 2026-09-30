/**
 * RegisterPage — Redesigned with premium light-mode glassmorphism, dynamic gradients, and modern aesthetic.
 */

import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, BrainCircuit, Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const BENEFITS = [
  'Personalized AI career roadmaps',
  'Voice-based mock interview practice',
  'Detailed performance analytics',
  'Week-by-week progress tracking',
];

export default function RegisterPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      if (res.data.success) {
        login(res.data.token, res.data.data);
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', fontFamily: 'var(--font-sans)', position: 'relative', overflow: 'hidden' }}>
      
      {/* ── Dynamic Background Effect ── */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', zIndex: 0,
        background: 'radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 60%), radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none', filter: 'blur(60px)'
      }} />

      {/* ── Left Branding Panel ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px',
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', position: 'relative', zIndex: 1, borderRight: '1px solid rgba(0,0,0,0.05)', boxShadow: '20px 0 50px rgba(0,0,0,0.1)'
      }} className="auth-brand-panel hidden md:flex">
        
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: 40, right: 40, opacity: 0.15 }}>
          <Sparkles size={180} color="#fff" />
        </div>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <BrainCircuit size={26} color="#4f46e5" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px', color: '#fff' }}>Career R&amp;I</span>
        </motion.div>

        {/* Hero text */}
        <div style={{ maxWidth: 480, marginTop: '-40px' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.3)', marginBottom: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>What you get</span>
          </motion.div>
          
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} style={{ fontSize: 50, fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-1px', color: '#fff' }}>
            Everything you need <br/><span style={{ color: '#a5b4fc' }}>to land your dream role</span>
          </motion.h2>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <CheckCircle2 size={20} color="#fff" />
                </div>
                <span style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>{b}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
          © 2026 Career R&amp;I Platform
        </motion.p>
      </div>

      {/* ── Right Form Panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 440 }}>
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
              <BrainCircuit size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 22, color: '#0f172a', letterSpacing: '-0.5px' }}>Career R&amp;I</span>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 8, letterSpacing: '-1px' }}>Create an account.</h1>
            <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>Free forever. No credit card required.</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 24, padding: 40, boxShadow: '0 30px 60px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.03)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    style={{ width: '100%', height: 56, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, paddingLeft: 46, paddingRight: 16, color: '#0f172a', fontSize: 16, fontWeight: 600, outline: 'none', transition: 'all 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={{ width: '100%', height: 56, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, paddingLeft: 46, paddingRight: 16, color: '#0f172a', fontSize: 16, fontWeight: 600, outline: 'none', transition: 'all 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{ width: '100%', height: 56, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, paddingLeft: 46, paddingRight: 48, color: '#0f172a', fontSize: 16, fontWeight: 600, outline: 'none', transition: 'all 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                  {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 15px 30px rgba(99,102,241,0.3)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                style={{ width: '100%', height: 56, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 }}
              >
                {loading ? (
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <><UserPlus size={18} strokeWidth={2.5} /> Register</>
                )}
              </motion.button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 15, color: '#64748b', marginTop: 32, fontWeight: 500 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 800, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
}
