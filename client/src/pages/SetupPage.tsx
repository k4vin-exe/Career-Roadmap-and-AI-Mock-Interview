/**
 * SetupPage — Interview Mission Launchpad
 * Tailor the AI mock interview with role selection, seniority level,
 * candidate identity, and session expectations telemetry.
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Briefcase,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Map,
  BrainCircuit,
  Clock,
  Mic,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Check,
  AlertCircle,
  Sliders,
  Loader2,
} from 'lucide-react';

import { useInterview } from '../context/InterviewContext';
import { startInterview } from '../services/api';
import { JOB_ROLES } from '../utils/types';
import type { ExperienceLevel } from '../utils/types';

const SENIORITY_TIERS: { key: ExperienceLevel; label: string; desc: string }[] = [
  {
    key: 'Beginner',
    label: 'Junior',
    desc: '0–2 years · Fundamentals, syntax & core data structures',
  },
  {
    key: 'Intermediate',
    label: 'Mid-Level',
    desc: '3–5 years · Architecture, system trade-offs & clean code',
  },
  {
    key: 'Experienced',
    label: 'Senior+',
    desc: '5+ years · Distributed systems, scale & technical leadership',
  },
];

const SESSION_HIGHLIGHTS = [
  {
    icon: Clock,
    title: '~15 Minutes',
    desc: '5 targeted technical & architectural questions',
    color: '#8067e8',
  },
  {
    icon: Mic,
    title: 'Voice Studio',
    desc: 'Speak naturally with real-time Whisper AI transcription',
    color: '#0ea5c9',
  },
  {
    icon: BrainCircuit,
    title: 'Instant Groq LLM Scoring',
    desc: 'Dimensional rubric: depth, communication & problem-solving',
    color: '#45a66b',
  },
  {
    icon: Sparkles,
    title: 'Diagnostic Report',
    desc: 'Actionable speech telemetry & principal engineer ideal answers',
    color: '#d99a32',
  },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dispatch } = useInterview();

  const prefilledRole = searchParams.get('role') || '';
  const fromRoadmap = searchParams.get('from') === 'roadmap';

  const [name, setName] = useState('');
  const [role, setRole] = useState<string>(
    JOB_ROLES.includes(prefilledRole as any)
      ? prefilledRole
      : prefilledRole
      ? 'Other'
      : ''
  );
  const [customRole, setCustomRole] = useState(
    !JOB_ROLES.includes(prefilledRole as any) && prefilledRole ? prefilledRole : ''
  );
  const [experience, setExperience] = useState<ExperienceLevel | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const effectiveRole = role === 'Other' ? customRole.trim() : role;
  const isValid = name.trim().length >= 2 && effectiveRole.length >= 2 && experience !== '';

  const handleStart = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError('');

    // Unlock browser TTS on the user gesture
    try {
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);
    } catch {
      /* ignored */
    }

    try {
      const session = await startInterview(name.trim(), effectiveRole, experience);
      dispatch({ type: 'START_SESSION', payload: session });
      navigate('/warmup');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initialize interview session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper-setup py-6 flex flex-col gap-6">
      {/* ── Top Navigation Bar & Roadmap Synergy Badge ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => navigate(fromRoadmap ? (-1 as any) : '/dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{fromRoadmap ? 'Back to Career Roadmap' : 'Back to Dashboard'}</span>
        </button>

        {fromRoadmap && prefilledRole && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-soft/80 border border-primary/25 text-xs font-bold text-primary shadow-2xs">
            <Map size={14} />
            <span>Targeting {prefilledRole} from your roadmap</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Main Setup Form Cockpit (7 cols) ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden"
        >
          {/* Form Header */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-soft/70 border border-primary/25 flex items-center justify-center text-primary flex-shrink-0 shadow-xs">
              <BrainCircuit size={24} />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                Interactive AI Simulation
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug">
                Configure Your Interview
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                Calibrate the AI interviewer to your background. Questions adapt directly to your chosen role and seniority tier.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100" />

          {/* Form Controls */}
          <div className="flex flex-col gap-6">
            {/* Field 1: Candidate Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User size={14} className="text-primary" />
                <span>Candidate Name</span>
                <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Sarah Connor"
                  maxLength={50}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 min-h-[48px] text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium pl-1">
                Used by the AI interviewer to greet you naturally during the session.
              </p>
            </div>

            {/* Field 2: Target Job Role Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Briefcase size={14} className="text-cyan" />
                <span>Target Engineering Role</span>
                <span className="text-danger">*</span>
              </label>

              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (e.target.value !== 'Other') setCustomRole('');
                  }}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 min-h-[48px] pr-10 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                >
                  <option value="" disabled>
                    Select your target engineering or tech role...
                  </option>
                  {JOB_ROLES.map((r) => (
                    <option key={r} value={r} className="text-slate-800">
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>

              {/* Custom Role Input when 'Other' selected */}
              <AnimatePresence>
                {role === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pt-1"
                  >
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="Specify role title (e.g. MLOps Specialist, Site Reliability Engineer)..."
                      maxLength={60}
                      autoFocus
                      className="w-full bg-white border-2 border-primary/40 rounded-xl px-4 py-3 min-h-[48px] text-sm font-semibold text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field 3: Seniority Experience Tier */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-success" />
                <span>Seniority & Experience Level</span>
                <span className="text-danger">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SENIORITY_TIERS.map(({ key, label, desc }) => {
                  const isSelected = experience === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setExperience(key)}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary-soft/40 shadow-xs ring-2 ring-primary/25'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-slate-800">
                          {label}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-primary text-white'
                              : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3.5 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Primary Submit CTA */}
          <div className="pt-2 flex flex-col">
            <motion.button
              type="button"
              onClick={handleStart}
              disabled={!isValid || isLoading}
              whileHover={isValid && !isLoading ? { scale: 1.02, y: -1 } : {}}
              whileTap={isValid && !isLoading ? { scale: 0.98 } : {}}
              className={`w-full min-h-[48px] py-3.5 px-6 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2.5 transition-all shadow-md ${
                !isValid || isLoading
                  ? 'bg-slate-200 text-slate-600 border border-slate-300/80 cursor-not-allowed shadow-none'
                  : 'text-white cursor-pointer hover:shadow-lg hover:shadow-primary/25'
              }`}
              style={
                isValid && !isLoading
                  ? {
                      background: 'linear-gradient(135deg, #8067e8 0%, #5d45c7 100%)',
                      boxShadow: '0 8px 24px rgba(128, 103, 232, 0.35)',
                    }
                  : undefined
              }
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Initializing Voice Engine & Session...</span>
                </>
              ) : (
                <>
                  <span>Begin AI Mock Interview</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </motion.button>
            {!isValid && (
              <p className="text-[11px] text-slate-500 text-center mt-2 font-medium">
                Please enter your name, select a target role, and choose a seniority level to begin.
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Right Column: Session Blueprint & Expectations (5 cols) ── */}
        <motion.div
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          {/* Session Expectations Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col gap-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sliders size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Session Blueprint
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">What happens after you start</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {SESSION_HIGHLIGHTS.map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="flex items-start gap-3.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${color}15`, color }}
                  >
                    <Icon size={17} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Evaluator Persona Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-soft/80 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0 shadow-2xs font-black text-sm">
                EV
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-slate-800">Dr. Elena Vance</span>
                  <span className="text-[10px] font-bold text-success bg-success-soft px-1.5 py-0.5 rounded-md border border-success/20">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Lead AI Evaluator • Career R&I</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
              "We will begin with an optional 60-second warmup self-introduction to verify your audio levels, then proceed through 5 structured questions with instant feedback."
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-3 border-t border-slate-100 px-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-success" />
                Private & confidential
              </span>
              <span>Groq Llama-3 + Whisper</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
