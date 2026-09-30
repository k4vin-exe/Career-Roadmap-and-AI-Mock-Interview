/**
 * RoadmapOnboardingPage — Rebuilt with full-width premium layout.
 * Steps: About You → Education & Skills → Your Goal → Review & Generate
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, GraduationCap, Target, Sparkles,
  ChevronRight, ChevronLeft, Plus, X,
  CheckCircle2, Map, Cpu, Clock, Zap, ArrowRight,
} from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import { generateRoadmap } from '../../services/roadmapApi';
import type { UserProfile } from '../../utils/roadmapTypes';
import { EXPERIENCE_OPTIONS, UG_FIELDS, PG_FIELDS } from '../../utils/roadmapTypes';

const DESIRED_ROLES = [
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
  'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Cloud Engineer', 'Mobile Developer (Android)', 'Mobile Developer (iOS)',
  'React Native Developer', 'UI/UX Designer', 'Product Manager',
  'Data Analyst', 'Cybersecurity Engineer', 'Blockchain Developer',
  'Embedded Systems Engineer', 'Site Reliability Engineer',
];

const STEPS = [
  { id: 'basic',     label: 'About You',           icon: User,          desc: 'Tell us who you are' },
  { id: 'education', label: 'Education & Skills',  icon: GraduationCap, desc: 'Your background & expertise' },
  { id: 'goal',      label: 'Your Goal',            icon: Target,        desc: 'Where you want to go' },
  { id: 'review',    label: 'Review',               icon: Sparkles,      desc: 'Confirm & generate' },
];

// Loading messages cycle
const LOADING_MESSAGES = [
  'Analysing your background…',
  'Mapping skill gaps for your target role…',
  'Designing week-by-week tasks…',
  'Curating learning resources…',
  'Finalising your personalised roadmap…',
];

// ── Tag Input ──────────────────────────────────────────────────────────────────
function TagInput({ label, tags, onAdd, onRemove, placeholder, hint }: {
  label: string; tags: string[];
  onAdd: (t: string) => void;
  onRemove: (t: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [input, setInput] = useState('');

  const commit = () => {
    const v = input.trim();
    if (v && !tags.includes(v) && tags.length < 15) { onAdd(v); setInput(''); }
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</label>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                background: 'var(--primary-soft)', border: '1px solid rgba(128,103,232,0.25)',
                color: 'var(--primary-text)',
              }}
            >
              {tag}
              <button
                onClick={() => onRemove(tag)}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: 'var(--primary-text)', opacity: 0.6, lineHeight: 1 }}
              >
                <X size={12} />
              </button>
            </motion.span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); } }}
          placeholder={placeholder || 'Type and press Enter…'}
          className="input-field"
          style={{ flex: 1 }}
        />
        <button
          onClick={commit}
          disabled={!input.trim() || tags.length >= 15}
          style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer',
            opacity: (!input.trim() || tags.length >= 15) ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <Plus size={18} />
        </button>
      </div>
      {hint && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{hint}</p>}
    </div>
  );
}

// ── Cinematic Loading Screen ───────────────────────────────────────────────────
function LoadingOverlay() {
  const [msgIdx, setMsgIdx] = useState(0);

  // Cycle messages
  useEffect(() => {
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'linear-gradient(135deg, #0d0f1a 0%, #12142a 50%, #1a1220 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}
    >
      {/* Ambient glow blobs */}
      <div style={{
        position: 'absolute', top: '20%', left: '20%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(128,103,232,0.18) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '20%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,201,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      {/* Animated rings */}
      <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 48 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              inset: i * 18,
              borderRadius: '50%',
              border: '1.5px solid rgba(128,103,232,' + (0.5 - i * 0.12) + ')',
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 3 + i * 1.5, repeat: Infinity, ease: 'linear' }}
          />
        ))}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8067e8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 32px rgba(128,103,232,0.6)',
            }}
          >
            <Map size={24} style={{ color: 'white' }} />
          </motion.div>
        </div>
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 16, letterSpacing: '-0.5px' }}>
          Building Your Roadmap
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 8 }}
          >
            {LOADING_MESSAGES[msgIdx]}
          </motion.p>
        </AnimatePresence>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 24 }}>
          This may take up to 30 seconds
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(128,103,232,0.4)' }}
              animate={{ background: ['rgba(128,103,232,0.3)', 'rgba(128,103,232,0.9)', 'rgba(128,103,232,0.3)'] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>

      {/* Feature pills */}
      <div style={{ display: 'flex', gap: 12, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center', padding: '0 24px' }}>
        {[
          { icon: Cpu,   text: 'AI-Powered Analysis' },
          { icon: Clock, text: 'Week-by-Week Plan' },
          { icon: Zap,   text: 'Role-Specific Tasks' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 100,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
          }}>
            <Icon size={13} />
            {text}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function RoadmapOnboardingPage() {
  const navigate = useNavigate();
  const { dispatch } = useRoadmap();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    workExperience: '0',
    currentRole: '',
    skills: [],
    ugField: '',
    pgField: 'Not Applicable',
    bio: '',
    desiredRole: '',
  });

  const updateField = useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setError('');
  }, []);

  const canProceed = () => {
    if (step === 0) return profile.name.trim().length >= 2 && profile.workExperience !== '';
    if (step === 1) return profile.ugField !== '';
    if (step === 2) return profile.desiredRole !== '';
    return true;
  };

  const goNext = () => {
    if (!canProceed()) { setError('Please fill in all required fields.'); return; }
    setError('');
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    setError('');
    setDirection(-1);
    if (step > 0) setStep((s) => s - 1);
    else navigate('/');
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    dispatch({ type: 'SET_PROFILE', payload: profile });
    dispatch({ type: 'SET_GENERATING', payload: true });
    try {
      const roadmap = await generateRoadmap(profile);
      dispatch({ type: 'SET_ROADMAP', payload: roadmap });
      navigate('/roadmap/' + roadmap.profileId);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate roadmap.';
      setError(msg);
      dispatch({ type: 'SET_ERROR', payload: msg });
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -48 : 48 }),
  };

  return (
    <div style={{
      flex: 1, minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>

      <div style={{ maxWidth: 760, width: '100%', margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* ── Page Title ── */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100, marginBottom: 16,
            background: 'var(--primary-soft)', border: '1px solid rgba(128,103,232,0.2)',
          }}>
            <Map size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Career Roadmap Generator
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 8 }}>
            Build Your Personal Roadmap
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Answer a few quick questions and our AI will craft a tailored career plan just for you.
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 0 }}>
          {STEPS.map((s, i) => {
            const isDone    = i < step;
            const isCurrent = i === step;
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <motion.div
                    animate={{
                      background: isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--surface-solid)',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(128,103,232,0.2)' : 'none',
                    }}
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: isDone ? '2px solid var(--success)' : isCurrent ? '2px solid var(--primary)' : '2px solid var(--border)',
                      position: 'relative', zIndex: 1, flexShrink: 0,
                      transition: 'all 0.3s',
                    }}
                  >
                    {isDone
                      ? <CheckCircle2 size={16} style={{ color: 'white' }} />
                      : <span style={{ fontSize: 13, fontWeight: 800, color: isCurrent ? 'white' : 'var(--text-muted)' }}>{i + 1}</span>
                    }
                  </motion.div>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: isCurrent ? 'var(--primary)' : isDone ? 'var(--success-text)' : 'var(--text-muted)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                      {s.label}
                    </p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, margin: '0 8px', marginBottom: 22, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', background: 'var(--primary)', borderRadius: 2 }}
                      initial={{ width: 0 }}
                      animate={{ width: isDone ? '100%' : '0%' }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Form Card ── */}
        <div style={{
          background: 'var(--surface-solid)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}>
          {/* Card Header */}
          <div style={{
            padding: '28px 32px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-muted)',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--primary), #6366f1)',
              boxShadow: '0 4px 12px rgba(128,103,232,0.35)',
            }}>
              {(() => { const Icon = STEPS[step].icon; return <Icon size={22} style={{ color: 'white' }} />; })()}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 3, letterSpacing: '-0.2px' }}>
                {STEPS[step].label}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Step {step + 1} of {STEPS.length} &mdash; {STEPS[step].desc}
              </p>
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: '32px', overflow: 'hidden', position: 'relative', minHeight: 320 }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >

                {/* ── Step 0: About You ── */}
                {step === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                        Your Name <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <input
                        className="input-field"
                        value={profile.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="e.g. Arun Kumar"
                        maxLength={60}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                        Work Experience <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <select
                        className="input-field"
                        value={profile.workExperience}
                        onChange={(e) => updateField('workExperience', e.target.value as UserProfile['workExperience'])}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="">Select experience…</option>
                        {EXPERIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    {profile.workExperience && profile.workExperience !== '0' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                          Current / Last Job Title
                        </label>
                        <input
                          className="input-field"
                          value={profile.currentRole}
                          onChange={(e) => updateField('currentRole', e.target.value)}
                          placeholder="e.g. Junior Software Developer"
                          maxLength={80}
                        />
                      </motion.div>
                    )}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                        Short Bio <span style={{ fontSize: 11, fontWeight: 400 }}>(optional)</span>
                      </label>
                      <textarea
                        className="input-field"
                        value={profile.bio}
                        onChange={(e) => updateField('bio', e.target.value)}
                        placeholder="2–3 sentences about yourself, your interests, and what you want to achieve…"
                        rows={3}
                        maxLength={400}
                        style={{ resize: 'none' }}
                      />
                    </div>
                  </div>
                )}

                {/* ── Step 1: Education & Skills ── */}
                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                        UG Field of Study <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <select
                        className="input-field"
                        value={profile.ugField}
                        onChange={(e) => updateField('ugField', e.target.value)}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="">Select field…</option>
                        {(UG_FIELDS as unknown as readonly string[]).map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                        PG Field of Study <span style={{ fontSize: 11, fontWeight: 400 }}>(if applicable)</span>
                      </label>
                      <select
                        className="input-field"
                        value={profile.pgField}
                        onChange={(e) => updateField('pgField', e.target.value)}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="">Select field…</option>
                        {(PG_FIELDS as unknown as readonly string[]).map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <TagInput
                      label="Current Skills (add up to 15)"
                      tags={profile.skills}
                      onAdd={(tag) => { if (profile.skills.length < 15) updateField('skills', [...profile.skills, tag]); }}
                      onRemove={(tag) => updateField('skills', profile.skills.filter((s) => s !== tag))}
                      placeholder="e.g. Python, React, SQL…"
                      hint={"Press Enter or comma to add · " + profile.skills.length + "/15 added"}
                    />
                  </div>
                )}

                {/* ── Step 2: Your Goal ── */}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}>
                        Select Your Desired Role <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                        {DESIRED_ROLES.map((r) => {
                          const selected = profile.desiredRole === r;
                          return (
                            <motion.button
                              key={r}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateField('desiredRole', r)}
                              style={{
                                padding: '13px 16px', borderRadius: 12, cursor: 'pointer',
                                textAlign: 'left', border: 'none',
                                background: selected ? 'var(--primary)' : 'var(--surface-muted)',
                                outline: selected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                outlineOffset: selected ? 2 : 0,
                                color: selected ? 'white' : 'var(--text)',
                                fontSize: 13, fontWeight: selected ? 700 : 500,
                                transition: 'all 0.15s',
                                boxShadow: selected ? '0 4px 14px rgba(128,103,232,0.35)' : 'var(--shadow-sm)',
                              }}
                            >
                              {selected && (
                                <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                              )}
                              {r}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                    <AnimatePresence>
                      {profile.desiredRole && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '14px 18px', borderRadius: 14,
                            background: 'var(--primary-soft)', border: '1px solid rgba(128,103,232,0.25)',
                          }}
                        >
                          <Target size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <p style={{ fontSize: 14, color: 'var(--primary-text)', fontWeight: 600 }}>
                            AI will generate a personalised roadmap for <strong>{profile.desiredRole}</strong>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* ── Step 3: Review ── */}
                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Review your profile before we generate your personalised career roadmap.
                    </p>

                    {/* Profile summary grid */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                    }}>
                      {[
                        { label: 'Name',        value: profile.name },
                        { label: 'Experience',  value: EXPERIENCE_OPTIONS.find((o) => o.value === profile.workExperience)?.label || '' },
                        { label: 'Current Role',value: profile.currentRole || 'N/A' },
                        { label: 'UG Field',    value: profile.ugField },
                        { label: 'PG Field',    value: profile.pgField || 'N/A' },
                        { label: 'Desired Role',value: profile.desiredRole },
                      ].map(({ label, value }) => (
                        <div key={label} style={{
                          padding: '14px 18px', borderRadius: 14,
                          background: 'var(--surface-muted)',
                          border: '1px solid var(--border)',
                        }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                            {label}
                          </p>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', wordBreak: 'break-word' }}>
                            {value || '—'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Skills */}
                    {profile.skills.length > 0 && (
                      <div style={{
                        padding: '16px 18px', borderRadius: 14,
                        background: 'var(--surface-muted)', border: '1px solid var(--border)',
                      }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                          Skills ({profile.skills.length})
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {profile.skills.map((s) => (
                            <span key={s} style={{
                              padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                              background: 'var(--primary-soft)', border: '1px solid rgba(128,103,232,0.2)',
                              color: 'var(--primary-text)',
                            }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA summary banner */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '16px 20px', borderRadius: 14,
                      background: 'linear-gradient(135deg, rgba(128,103,232,0.08), rgba(99,102,241,0.06))',
                      border: '1px solid rgba(128,103,232,0.2)',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Sparkles size={18} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Ready to generate!</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your AI roadmap for <strong style={{ color: 'var(--primary-text)' }}>{profile.desiredRole}</strong> is one click away.</p>
                      </div>
                      <ArrowRight size={18} style={{ color: 'var(--primary)', marginLeft: 'auto', flexShrink: 0 }} />
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card Footer */}
          <div style={{
            padding: '20px 32px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            {/* Error */}
            <div style={{ flex: 1 }}>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      fontSize: 13, fontWeight: 500,
                      color: 'var(--danger-text)',
                      padding: '8px 14px', borderRadius: 10,
                      background: 'var(--danger-soft)', border: '1px solid rgba(217,87,87,0.2)',
                    }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Nav Buttons */}
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button
                onClick={goPrev}
                className="btn btn-ghost btn-md"
              >
                <ChevronLeft size={16} />
                {step === 0 ? 'Cancel' : 'Previous'}
              </button>

              {step < STEPS.length - 1 ? (
                <motion.button
                  whileHover={canProceed() ? { scale: 1.02 } : {}}
                  whileTap={canProceed() ? { scale: 0.98 } : {}}
                  onClick={goNext}
                  className="btn btn-primary btn-md"
                  disabled={!canProceed()}
                  style={{ opacity: canProceed() ? 1 : 0.45 }}
                >
                  Next <ChevronRight size={16} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  onClick={handleGenerate}
                  className="btn btn-primary btn-lg"
                  disabled={isLoading}
                >
                  <Sparkles size={16} />
                  Generate My Roadmap
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
