/**
 * LandingPage — Redesigned in the light design system.
 * Preserves all navigation calls and feature content.
 */

import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic, Brain, BarChart3, Sparkles, ArrowRight, Map,
  Target, CheckCircle2, BrainCircuit,
} from 'lucide-react';

const ROADMAP_FEATURES = [
  { icon: Target,      title: 'Personalized Plans',     desc: 'AI builds a week-by-week roadmap based on your skills and target role' },
  { icon: CheckCircle2,title: 'Progress Tracking',      desc: 'Check off daily tasks and watch your progress grow week by week' },
  { icon: Map,         title: 'Structured Learning',    desc: 'Guided topics sequenced like roadmap.sh for your specific career path' },
  { icon: Mic,         title: 'Practice Integration',   desc: 'Jump into mock interviews at the end of each learning phase' },
];

const INTERVIEW_FEATURES = [
  { icon: Brain,    title: 'AI-Powered Questions',  desc: 'Dynamic questions tailored to your role and experience level' },
  { icon: Mic,      title: 'Voice Interaction',     desc: 'Speak naturally — AI listens, transcribes, and evaluates your answers' },
  { icon: BarChart3,title: 'Speech Analysis',       desc: 'Real-time fluency scoring, filler word detection, and communication feedback' },
  { icon: Sparkles, title: 'Detailed Reports',      desc: 'Comprehensive interview reports with actionable improvement suggestions' },
];

function FeatureCard({ icon: Icon, title, desc, delay }: { icon: React.ElementType; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="card"
      style={{ padding: 24 }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'var(--primary-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          marginBottom: 16,
        }}
      >
        <Icon size={22} />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Navigation ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          background: 'rgba(248, 251, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={17} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.2px' }}>Career R&amp;I</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-ghost btn-sm"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="btn btn-primary btn-sm"
          >
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="ambient-bg"
        style={{
          padding: '96px 48px 80px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 100,
            background: 'var(--primary-soft)',
            color: 'var(--primary-text)',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 28,
          }}
        >
          <Sparkles size={14} />
          AI-Powered Career Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: 800,
            letterSpacing: '-1px',
            lineHeight: 1.15,
            marginBottom: 20,
            maxWidth: 720,
          }}
        >
          Your AI-Powered{' '}
          <span className="gradient-text">Career Co-Pilot</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: 18,
            color: 'var(--text-muted)',
            maxWidth: 540,
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          Build a personalized career roadmap, track your learning, and practice with an AI interviewer — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button
            onClick={() => navigate('/roadmap/start')}
            className="btn btn-primary btn-lg"
          >
            <Map size={18} /> Build My Roadmap
          </button>
          <button
            onClick={() => navigate('/setup')}
            className="btn btn-ghost btn-lg"
          >
            Start Mock Interview <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 24 }}
        >
          Free to use · No credit card required
        </motion.p>
      </section>

      {/* ── Roadmap features ── */}
      <section style={{ padding: '80px 48px', borderTop: '1px solid var(--border)', background: 'var(--surface-solid)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-flex' }}>
              <Map size={12} /> Career Roadmap
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.4px' }}>
              Your Personalized Learning Path
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Tell us about yourself and we'll generate a week-by-week plan to land your dream role.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18, marginBottom: 40 }}>
            {ROADMAP_FEATURES.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} delay={i * 0.08} />
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => navigate('/roadmap/start')} className="btn btn-primary btn-lg">
              <Map size={17} /> Get My Roadmap
            </button>
          </div>
        </div>
      </section>

      {/* ── Interview features ── */}
      <section
        style={{
          padding: '80px 48px',
          borderTop: '1px solid var(--border)',
          background: 'linear-gradient(160deg, var(--ink-soft) 0%, #232538 100%)',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <span className="badge badge-coral" style={{ marginBottom: 12, display: 'inline-flex' }}>
              <Mic size={12} /> Mock Interview
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.4px' }}>
              Practice Makes Perfect
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Practice technical interviews with an AI that speaks, listens, and gives you real-time feedback.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18, marginBottom: 40 }}>
            {INTERVIEW_FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                style={{
                  padding: 24,
                  borderRadius: 'var(--radius-card)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--coral-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--coral)', marginBottom: 16 }}>
                  <f.icon size={22} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => navigate('/setup')} className="btn btn-coral btn-lg">
              <Mic size={17} /> Start Practicing
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '28px 48px', borderTop: '1px solid var(--border)', background: 'var(--surface-solid)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Career R&amp;I</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-light)' }}>© 2025 Career R&amp;I · AI-powered career platform</p>
      </footer>
    </div>
  );
}
