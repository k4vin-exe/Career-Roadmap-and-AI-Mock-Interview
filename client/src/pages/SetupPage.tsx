/**
 * SetupPage — Redesigned interview setup in the light design system.
 * ALL business logic (startInterview, navigate, TTS unlock) preserved.
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Briefcase, TrendingUp, ArrowRight, ArrowLeft,
  Map, BrainCircuit, CheckCircle, Clock, Mic,
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { startInterview } from '../services/api';
import { JOB_ROLES, EXPERIENCE_LEVELS } from '../utils/types';
import type { JobRole, ExperienceLevel } from '../utils/types';

const PREP_TIPS = [
  { icon: Clock,       text: '~15 minutes per session' },
  { icon: Mic,         text: 'Voice or typed answers' },
  { icon: CheckCircle, text: '5 role-specific questions' },
  { icon: BrainCircuit,text: 'AI feedback on every answer' },
];

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      {children}
    </div>
  );
}

function StyledSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-field"
      style={{ cursor: 'pointer' }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function SetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dispatch } = useInterview();

  const prefilledRole = searchParams.get('role') || '';
  const fromRoadmap   = searchParams.get('from') === 'roadmap';

  const [name,       setName]       = useState('');
  const [role,       setRole]       = useState<JobRole | ''>(JOB_ROLES.includes(prefilledRole as JobRole) ? prefilledRole as JobRole : '');
  const [experience, setExperience] = useState<ExperienceLevel | ''>('');
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState('');

  const isValid = name.trim().length >= 2 && role !== '' && experience !== '';

  const handleStart = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError('');

    // Unlock browser TTS on the user gesture (must happen synchronously)
    try {
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);
    } catch { /* ignored */ }

    try {
      const session = await startInterview(name.trim(), role, experience);
      dispatch({ type: 'START_SESSION', payload: session });
      navigate('/warmup');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Back button */}
      <button
        onClick={() => navigate(fromRoadmap ? (-1 as any) : '/dashboard')}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <ArrowLeft size={16} /> {fromRoadmap ? 'Back to Roadmap' : 'Back to Dashboard'}
      </button>

      {fromRoadmap && prefilledRole && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'var(--primary-soft)',
            border: '1px solid rgba(128,103,232,0.2)',
            marginBottom: 20,
            fontSize: 13,
            color: 'var(--primary-text)',
            fontWeight: 600,
          }}
        >
          <Map size={15} />
          Practising for <strong style={{ marginLeft: 4 }}>{prefilledRole}</strong> — from your roadmap
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

        {/* ── Setup form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card"
          style={{ padding: 32 }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.3px' }}>
            Setup Your Interview
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
            Fill in the details below to begin your AI-powered mock interview session.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <FormField label="Your Name">
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={50}
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </FormField>

            <FormField label="Target Job Role">
              <div style={{ position: 'relative' }}>
                <Briefcase size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none', zIndex: 1 }} />
                <StyledSelect
                  value={role}
                  onChange={(v) => setRole(v as JobRole)}
                  options={JOB_ROLES}
                  placeholder="Select a role"
                />
              </div>
            </FormField>

            <FormField label="Experience Level">
              <div style={{ position: 'relative' }}>
                <TrendingUp size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none', zIndex: 1 }} />
                <StyledSelect
                  value={experience}
                  onChange={(v) => setExperience(v as ExperienceLevel)}
                  options={EXPERIENCE_LEVELS}
                  placeholder="Select experience level"
                />
              </div>
            </FormField>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'var(--danger-soft)', border: '1px solid rgba(217,87,87,0.2)', color: 'var(--danger-text)', fontSize: 13 }}
            >
              {error}
            </motion.div>
          )}

          <button
            onClick={handleStart}
            disabled={!isValid || isLoading}
            className="btn btn-coral btn-lg"
            style={{ width: '100%', marginTop: 28, justifyContent: 'center' }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Starting Interview...
              </>
            ) : (
              <>Start Interview <ArrowRight size={17} /></>
            )}
          </button>
        </motion.div>

        {/* ── Preparation summary sidebar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {/* What to expect */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>What to expect</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PREP_TIPS.map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                    <Icon size={14} />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips card */}
          <div
            style={{
              padding: 20,
              borderRadius: 'var(--radius-card)',
              background: 'var(--coral-soft)',
              border: '1px solid rgba(233,119,63,0.2)',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--coral-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Pro tip
            </p>
            <p style={{ fontSize: 13, color: 'var(--coral-text)', lineHeight: 1.6 }}>
              Speak clearly and at a comfortable pace. The AI uses Groq Whisper to transcribe your answers accurately — no need to rush.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
