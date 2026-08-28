/**
 * RoadmapOnboardingPage — Multi-step profile collection form.
 * Steps: Basic Info → Education & Skills → Preferences → Review
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, GraduationCap, Sparkles, ChevronRight, ChevronLeft,
  Plus, X, Loader2, Target, BookOpen,
} from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import { generateRoadmap } from '../../services/roadmapApi';
import type { UserProfile } from '../../utils/roadmapTypes';
import { EXPERIENCE_OPTIONS, UG_FIELDS, PG_FIELDS } from '../../utils/roadmapTypes';

// ─── Job Roles (re-uses the interview list) ───────────────────────────────────
const DESIRED_ROLES = [
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
  'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Cloud Engineer', 'Mobile Developer (Android)', 'Mobile Developer (iOS)',
  'React Native Developer', 'UI/UX Designer', 'Product Manager',
  'Data Analyst', 'Cybersecurity Engineer', 'Blockchain Developer',
  'Embedded Systems Engineer', 'Site Reliability Engineer',
];

// ─── Step Definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 'basic', label: 'About You', icon: User },
  { id: 'education', label: 'Education & Skills', icon: GraduationCap },
  { id: 'goal', label: 'Your Goal', icon: Target },
  { id: 'review', label: 'Review', icon: Sparkles },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        {...rest}
        className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted text-sm outline-none focus:border-accent transition-colors"
      />
    </div>
  );
}

function SelectInput({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[] | readonly string[];
}) {
  const normalized = (options as any[]).map((o: any) =>
    typeof o === 'string' ? { value: o, label: o } : o
  );
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-text-primary text-sm outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
      >
        <option value="">Select...</option>
        {normalized.map((o: any) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function TagInput({ label, tags, onAdd, onRemove, placeholder }: {
  label: string; tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent-glow border border-accent/30 text-accent-light text-xs font-medium">
            {tag}
            <button onClick={() => onRemove(tag)} className="hover:text-white transition-colors cursor-pointer">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type and press Enter'}
          className="flex-1 bg-surface-light border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted text-sm outline-none focus:border-accent transition-colors"
        />
        <button
          onClick={() => { if (input.trim() && !tags.includes(input.trim())) { onAdd(input.trim()); setInput(''); } }}
          className="px-4 py-3 rounded-xl border border-accent/30 text-accent-light hover:bg-accent-glow transition-colors cursor-pointer"
        >
          <Plus size={16} />
        </button>
      </div>
      <p className="text-xs text-text-muted mt-1">Press Enter or comma to add. Max 15 skills.</p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RoadmapOnboardingPage() {
  const navigate = useNavigate();
  const { dispatch } = useRoadmap();

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form state — mirrors UserProfile
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

  // ── Validation per step ────────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 0) return profile.name.trim().length >= 2;
    if (step === 1) return profile.ugField !== '';
    if (step === 2) return profile.desiredRole !== '';
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      setError('Please fill in the required fields before continuing.');
      return;
    }
    setError('');
    setStep((s) => s + 1);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    dispatch({ type: 'SET_PROFILE', payload: profile });
    dispatch({ type: 'SET_GENERATING', payload: true });

    try {
      const roadmap = await generateRoadmap(profile);
      dispatch({ type: 'SET_ROADMAP', payload: roadmap });
      navigate(`/roadmap/${roadmap.profileId}`);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate roadmap. Please try again.';
      setError(msg);
      dispatch({ type: 'SET_ERROR', payload: msg });
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12" style={{ background: '#0a0a0f' }}>
      <div className="w-full max-w-xl">

        {/* Step progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <motion.div
                animate={{ scale: i === step ? 1.1 : 1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step ? 'bg-accent text-white' :
                  i === step ? 'bg-accent text-white ring-2 ring-accent/40 ring-offset-2 ring-offset-background' :
                  'bg-surface-light text-text-muted border border-border'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 rounded-full transition-colors ${i < step ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="glass rounded-2xl p-8"
        >
          {/* Step header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent-glow flex items-center justify-center">
              {(() => { const Icon = STEPS[step].icon; return <Icon size={20} className="text-accent-light" />; })()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">{STEPS[step].label}</h1>
              <p className="text-xs text-text-muted">Step {step + 1} of {STEPS.length}</p>
            </div>
          </div>

          {/* ── Step 0: Basic Info ── */}
          {step === 0 && (
            <div className="space-y-5">
              <TextInput
                label="Your Name *"
                value={profile.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Arun Kumar"
                maxLength={60}
              />
              <SelectInput
                label="Work Experience *"
                value={profile.workExperience}
                onChange={(v) => updateField('workExperience', v as UserProfile['workExperience'])}
                options={EXPERIENCE_OPTIONS}
              />
              {profile.workExperience !== '0' && (
                <TextInput
                  label="Current / Last Job Title"
                  value={profile.currentRole}
                  onChange={(e) => updateField('currentRole', e.target.value)}
                  placeholder="e.g. Junior Software Developer"
                  maxLength={80}
                />
              )}
              <div>
                <FieldLabel>Short Bio (optional)</FieldLabel>
                <textarea
                  value={profile.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="2–3 sentences about yourself, your interests, and what you want to achieve..."
                  rows={3}
                  maxLength={400}
                  className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted text-sm outline-none focus:border-accent transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* ── Step 1: Education & Skills ── */}
          {step === 1 && (
            <div className="space-y-5">
              <SelectInput
                label="UG Field of Study *"
                value={profile.ugField}
                onChange={(v) => updateField('ugField', v)}
                options={UG_FIELDS as unknown as readonly string[]}
              />
              <SelectInput
                label="PG Field of Study (if applicable)"
                value={profile.pgField}
                onChange={(v) => updateField('pgField', v)}
                options={PG_FIELDS as unknown as readonly string[]}
              />
              <TagInput
                label="Your Current Skills (add up to 15)"
                tags={profile.skills}
                onAdd={(tag) => {
                  if (profile.skills.length < 15) updateField('skills', [...profile.skills, tag]);
                }}
                onRemove={(tag) => updateField('skills', profile.skills.filter((s) => s !== tag))}
                placeholder="e.g. Python, React, SQL..."
              />
            </div>
          )}

          {/* ── Step 2: Goal ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <FieldLabel>Desired Role *</FieldLabel>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 custom-scroll">
                  {DESIRED_ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => updateField('desiredRole', r)}
                      className={`px-3 py-2.5 rounded-xl text-sm text-left transition-all cursor-pointer border ${
                        profile.desiredRole === r
                          ? 'bg-accent-glow border-accent text-accent-light font-semibold'
                          : 'border-border text-text-secondary hover:border-accent/40 hover:text-text-primary'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {profile.desiredRole && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-glow border border-accent/20">
                  <Target size={16} className="text-accent-light flex-shrink-0" />
                  <p className="text-sm text-accent-light">
                    AI will generate a personalized roadmap for <strong>{profile.desiredRole}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary mb-4">
                Review your profile before we generate your personalized roadmap.
              </p>
              {[
                { label: 'Name', value: profile.name },
                { label: 'Experience', value: EXPERIENCE_OPTIONS.find((o) => o.value === profile.workExperience)?.label },
                { label: 'Current Role', value: profile.currentRole || 'N/A' },
                { label: 'UG Field', value: profile.ugField },
                { label: 'PG Field', value: profile.pgField || 'N/A' },
                { label: 'Desired Role', value: profile.desiredRole },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3 py-2 border-b border-border/50">
                  <span className="text-xs text-text-muted w-32 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm text-text-primary">{value}</span>
                </div>
              ))}
              {profile.skills.length > 0 && (
                <div className="flex items-start gap-3 py-2">
                  <span className="text-xs text-text-muted w-32 flex-shrink-0 pt-1">Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-accent-glow border border-accent/20 text-accent-light text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{error}</p>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => step > 0 ? setStep((s) => s - 1) : navigate('/')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-colors text-sm cursor-pointer"
            >
              <ChevronLeft size={16} />
              {step === 0 ? 'Back' : 'Previous'}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm cursor-pointer disabled:opacity-60 transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating Roadmap…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate My Roadmap
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
            >
              <div className="text-center space-y-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 mx-auto rounded-full border-2 border-transparent border-t-accent border-r-accent/50"
                />
                <div>
                  <p className="text-lg font-bold text-text-primary">Building Your Roadmap</p>
                  <p className="text-sm text-text-secondary mt-1">AI is crafting a personalized plan just for you…</p>
                  <p className="text-xs text-text-muted mt-3">This may take up to 30 seconds</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
