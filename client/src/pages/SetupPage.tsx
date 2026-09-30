import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, TrendingUp, ArrowRight, ArrowLeft,
  Map, BrainCircuit, CheckCircle, Clock, Mic, Sparkles, ChevronDown
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { startInterview } from '../services/api';
import { JOB_ROLES, EXPERIENCE_LEVELS } from '../utils/types';
import type { JobRole, ExperienceLevel } from '../utils/types';

const PREP_TIPS = [
  { icon: Clock,       text: '~15 minutes per session', color: '#6366f1' },
  { icon: Mic,         text: 'Voice or typed answers', color: '#ec4899' },
  { icon: CheckCircle, text: '5 role-specific questions', color: '#10b981' },
  { icon: BrainCircuit,text: 'AI feedback on every answer', color: '#8b5cf6' },
];

function FormField({ label, children, delay = 0 }: { label: string; children: React.ReactNode, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      <label style={{ 
        display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', 
        marginBottom: 8, letterSpacing: '0.02em', textTransform: 'uppercase' 
      }}>
        {label}
      </label>
      {children}
    </motion.div>
  );
}

function StyledSelect({ value, onChange, options, placeholder, icon: Icon }: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
  icon: any;
}) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={18} style={{ 
        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', 
        color: isFocused ? 'var(--primary)' : 'var(--text-light)', 
        pointerEvents: 'none', zIndex: 1, transition: 'color 0.2s' 
      }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          padding: '16px 48px 16px 44px',
          borderRadius: 16,
          background: isFocused ? '#fff' : 'var(--surface-muted)',
          border: `2px solid ${isFocused ? 'var(--primary)' : 'transparent'}`,
          fontSize: 15,
          fontWeight: 600,
          color: value ? 'var(--text)' : 'var(--text-muted)',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isFocused ? '0 4px 20px rgba(128,103,232,0.15)' : 'none',
          transition: 'all 0.2s ease',
          appearance: 'none',
          WebkitAppearance: 'none'
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o} style={{ color: '#000' }}>{o}</option>)}
      </select>
      <ChevronDown size={18} style={{ 
        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', 
        color: 'var(--text-muted)', pointerEvents: 'none' 
      }} />
    </div>
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

  const [isNameFocused, setIsNameFocused] = useState(false);

  const isValid = name.trim().length >= 2 && role !== '' && experience !== '';

  const handleStart = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError('');

    // Unlock browser TTS on the user gesture
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
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 64px)', padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
      
      {/* Dynamic Background */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', zIndex: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(128,103,232,0.1) 0%, transparent 40%), radial-gradient(circle at 80% 60%, rgba(233,119,63,0.08) 0%, transparent 40%)',
        pointerEvents: 'none', filter: 'blur(60px)'
      }} />

      <div style={{ maxWidth: 960, width: '100%', position: 'relative', zIndex: 1 }}>
        <button
          onClick={() => navigate(fromRoadmap ? (-1 as any) : '/dashboard')}
          className="btn btn-ghost"
          style={{ marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100, background: 'var(--surface-solid)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> {fromRoadmap ? 'Back to Roadmap' : 'Back to Dashboard'}
        </button>

        {fromRoadmap && prefilledRole && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 100,
              background: 'rgba(128,103,232,0.1)', border: '1px solid rgba(128,103,232,0.2)', marginBottom: 28,
              fontSize: 13, color: 'var(--primary)', fontWeight: 700,
            }}
          >
            <Map size={16} /> Practising for {prefilledRole} — from your roadmap
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 32, alignItems: 'start' }}>

          {/* Main Setup Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
            style={{
              background: 'var(--surface-solid)',
              borderRadius: 32,
              padding: '48px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={24} style={{ color: 'var(--primary)' }} />
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px', margin: 0 }}>
                Setup Interview
              </h1>
            </div>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 40, lineHeight: 1.6 }}>
              Tailor the AI to your exact career level. The more accurate, the better the questions will be.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <FormField label="Candidate Name" delay={0.1}>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ 
                    position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', 
                    color: isNameFocused ? 'var(--primary)' : 'var(--text-light)', 
                    pointerEvents: 'none', transition: 'color 0.2s' 
                  }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setIsNameFocused(true)}
                    onBlur={() => setIsNameFocused(false)}
                    placeholder="E.g. Alex Johnson"
                    maxLength={50}
                    style={{
                      width: '100%', padding: '16px 20px 16px 44px', borderRadius: 16,
                      background: isNameFocused ? '#fff' : 'var(--surface-muted)',
                      border: `2px solid ${isNameFocused ? 'var(--primary)' : 'transparent'}`,
                      fontSize: 15, fontWeight: 600, color: 'var(--text)',
                      outline: 'none', boxShadow: isNameFocused ? '0 4px 20px rgba(128,103,232,0.15)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </div>
              </FormField>

              <FormField label="Target Job Role" delay={0.2}>
                <StyledSelect
                  value={role}
                  onChange={(v) => setRole(v as JobRole)}
                  options={JOB_ROLES}
                  placeholder="Select a target role..."
                  icon={Briefcase}
                />
              </FormField>

              <FormField label="Experience Level" delay={0.3}>
                <StyledSelect
                  value={experience}
                  onChange={(v) => setExperience(v as ExperienceLevel)}
                  options={EXPERIENCE_LEVELS}
                  placeholder="Select your experience..."
                  icon={TrendingUp}
                />
              </FormField>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--danger-soft)', border: '1px solid rgba(217,87,87,0.3)', color: 'var(--danger-text)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>!</div>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleStart}
              disabled={!isValid || isLoading}
              whileHover={isValid && !isLoading ? { scale: 1.02, boxShadow: '0 12px 24px rgba(233,119,63,0.3)' } : {}}
              whileTap={isValid && !isLoading ? { scale: 0.98 } : {}}
              style={{
                width: '100%', marginTop: 40, padding: '18px', borderRadius: 16,
                background: (!isValid || isLoading) ? 'var(--surface-muted)' : 'linear-gradient(135deg, #FF6B6B 0%, #E9773F 100%)',
                color: (!isValid || isLoading) ? 'var(--text-light)' : '#fff',
                fontSize: 16, fontWeight: 800, border: 'none', cursor: (!isValid || isLoading) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                transition: 'background 0.3s, color 0.3s',
              }}
            >
              {isLoading ? (
                <>
                  <LoaderIcon /> Authenticating & Starting...
                </>
              ) : (
                <>Start AI Interview <ArrowRight size={18} strokeWidth={2.5} /></>
              )}
            </motion.button>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Pro Tip Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(49,46,129,0.2)', border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
                <Mic size={140} color="#fff" />
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 100, fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  Pro Tip
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12, lineHeight: 1.3 }}>
                  Speak naturally, no need to rush.
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
                  Our AI uses state-of-the-art Groq Whisper models to transcribe your speech perfectly. Take your time to formulate great answers.
                </p>
              </div>
            </div>

            {/* What to expect */}
            <div style={{
              background: 'var(--surface-solid)', borderRadius: 24, padding: 32,
              border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>What to expect</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {PREP_TIPS.map(({ icon: Icon, text, color }, idx) => (
                  <motion.div 
                    key={text} 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (idx * 0.1) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

function LoaderIcon() {
  return (
    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
