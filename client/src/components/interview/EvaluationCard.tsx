import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Mic,
  Clock,
  Gauge,
  BookOpen,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Award,
  Layers,
  MessageSquare,
  Bot,
  Activity,
  FileText,
  Target,
} from 'lucide-react';
import { segmentTranscriptFillers } from '../../utils/speechMetrics';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

export interface ExtendedEvaluationData {
  technicalAccuracy: number;
  communication: number;
  completeness: number;
  problemSolving: number;
  deliveryScore?: number;
  pacingFeedback?: string;
  fillerFeedback?: string;
  structureFeedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  missingConcepts?: string[];
  idealAnswer?: string;
  suggestions?: string[];
  encouragingFeedback?: string;
  feedback?: string;
  expectedPoints?: string[];
  // Spoken delivery context
  transcript?: string;
  totalWords?: number;
  fillerWords?: string[];
  fillerWordCount?: number;
  fluencyScore?: number;
  questionDuration?: number;
  wordsPerMinute?: number;
  pacingRating?: string;
}

interface EvaluationCardProps {
  evaluation: ExtendedEvaluationData;
  onNext: () => void;
  isLastQuestion: boolean;
}

function normalizeScore(score: number): number {
  if (score <= 10) return Math.round(score * 10);
  return Math.min(100, Math.round(score));
}

function ScoreCard({
  icon: Icon,
  label,
  score,
  delay = 0,
}: {
  icon: any;
  label: string;
  score: number;
  delay?: number;
}) {
  const norm = normalizeScore(score);
  const color =
    norm >= 80 ? '#45a66b' : norm >= 60 ? '#d99a32' : '#d95757';
  const softBg =
    norm >= 80
      ? 'rgba(69, 166, 107, 0.08)'
      : norm >= 60
      ? 'rgba(217, 154, 50, 0.08)'
      : 'rgba(217, 87, 87, 0.08)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: softBg, color }}
          >
            <Icon size={16} />
          </div>
          <span className="text-xs font-bold text-slate-700">{label}</span>
        </div>
        <span
          className="text-xs font-black px-2 py-0.5 rounded-md"
          style={{ background: softBg, color }}
        >
          {norm}%
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${norm}%` }}
          transition={{ duration: 0.9, delay: delay + 0.1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

export default function EvaluationCard({
  evaluation,
  onNext,
  isLastQuestion,
}: EvaluationCardProps) {
  const [activeTab, setActiveTab] = useState<'feedback' | 'speech' | 'ideal'>('feedback');
  const [copied, setCopied] = useState(false);
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis({ rate: 0.9, pitch: 0.95 });

  const techNorm = normalizeScore(evaluation.technicalAccuracy || 7.5);
  const commNorm = normalizeScore(evaluation.communication || 8);
  const compNorm = normalizeScore(evaluation.completeness || 7);
  const probNorm = normalizeScore(evaluation.problemSolving || 8);
  const avgScore = Math.round((techNorm + commNorm + compNorm + probNorm) / 4);

  const durationSec = evaluation.questionDuration || 0;
  const durationFormatted = `${Math.floor(durationSec / 60)}m ${(durationSec % 60).toString().padStart(2, '0')}s`;
  const wpm = evaluation.wordsPerMinute || (durationSec > 5 && evaluation.totalWords ? Math.round((evaluation.totalWords / durationSec) * 60) : 0);
  const fluency = evaluation.fluencyScore ?? 85;
  const fillerCount = evaluation.fillerWordCount ?? evaluation.fillerWords?.length ?? 0;

  // Segment candidate transcript to highlight filler words
  const transcriptSegments = segmentTranscriptFillers(evaluation.transcript || '');

  const strengthsList = evaluation.strengths && evaluation.strengths.length > 0
    ? evaluation.strengths
    : evaluation.expectedPoints || ['Clear communication', 'Good foundational knowledge'];

  const handleCopyIdeal = () => {
    if (!evaluation.idealAnswer) return;
    navigator.clipboard.writeText(evaluation.idealAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleIdealAudio = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (evaluation.idealAnswer) {
      speak(evaluation.idealAnswer);
    }
  };

  // SVG Circular Gauge parameters
  const circleSize = 130;
  const strokeWidth = 9;
  const radius = (circleSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (avgScore / 100) * circumference;
  const gaugeColor =
    avgScore >= 80 ? '#45a66b' : avgScore >= 60 ? '#8067e8' : '#d99a32';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full max-w-6xl mx-auto"
    >
      {/* ── Hero Performance Verdict Card ── */}
      <div className="rounded-2xl p-6 md:p-8 bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        {/* Ambient background blur */}
        <div
          className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{ background: gaugeColor }}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          {/* Radial Circular Score Gauge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div className="relative" style={{ width: circleSize, height: circleSize }}>
              <svg width={circleSize} height={circleSize} className="rotate-[-90deg]">
                {/* Background Track */}
                <circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth={strokeWidth}
                />
                {/* Animated Progress Stroke */}
                <motion.circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800 leading-none">
                  {avgScore}
                  <span className="text-base font-bold text-slate-400">%</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Overall
                </span>
              </div>
            </div>

            <span
              className="mt-3 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider"
              style={{
                background:
                  avgScore >= 80
                    ? 'rgba(69, 166, 107, 0.12)'
                    : avgScore >= 60
                    ? 'rgba(128, 103, 232, 0.12)'
                    : 'rgba(217, 154, 50, 0.12)',
                color: gaugeColor,
              }}
            >
              {avgScore >= 85
                ? 'Strong Hire Rating'
                : avgScore >= 70
                ? 'Solid Answer'
                : 'Needs Refinement'}
            </span>
          </div>

          {/* Executive Evaluator Verdict */}
          <div className="md:col-span-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Bot size={16} />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                Interviewer Assessment
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-extrabold text-slate-800 mb-2">
              {avgScore >= 80
                ? 'High-Impact Articulation with Solid Engineering Principles'
                : avgScore >= 65
                ? 'Good Foundational Knowledge with Actionable Expansion Areas'
                : 'Foundational Answer — Needs Stronger Architecture & Examples'}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              "{evaluation.encouragingFeedback || evaluation.feedback || 'Good effort structuring your thoughts for this interview question.'}"
            </p>
          </div>
        </div>
      </div>

      {/* ── 4-Dimension Rubric Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <ScoreCard icon={Layers} label="Technical Depth" score={techNorm} delay={0.05} />
        <ScoreCard icon={MessageSquare} label="Communication" score={commNorm} delay={0.1} />
        <ScoreCard icon={Target} label="Completeness" score={compNorm} delay={0.15} />
        <ScoreCard icon={Sparkles} label="Problem Solving" score={probNorm} delay={0.2} />
      </div>

      {/* ── Voice & Spoken Delivery Studio Telemetry ── */}
      <div className="card-elevated rounded-3xl p-6 bg-white border border-slate-200/80 shadow-md shadow-slate-200/30">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-soft flex items-center justify-center text-cyan-text">
              <Mic size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Spoken Delivery & Voice Telemetry
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">Cadence, fluency, and verbal hesitation analysis</p>
            </div>
          </div>

          {evaluation.deliveryScore !== undefined && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-soft text-cyan-text border border-cyan/20">
              Delivery Score: {normalizeScore(evaluation.deliveryScore)}%
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          {/* Speaking Pace (WPM) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <Gauge size={14} className="text-primary" />
              <span>Speaking Pace</span>
            </div>
            <div className="text-xl font-black text-slate-800">
              {wpm > 0 ? `${wpm} WPM` : '—'}
            </div>
            <span className="text-[11px] font-bold text-primary mt-0.5">
              {wpm >= 110 && wpm <= 165
                ? 'Optimal Pace (110–165)'
                : wpm < 110 && wpm > 0
                ? 'Deliberate / Slow'
                : wpm > 165
                ? 'A Bit Fast'
                : 'Cadence Normal'}
            </span>
          </div>

          {/* Fluency Score */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <Sparkles size={14} className="text-success" />
              <span>Fluency Rating</span>
            </div>
            <div className="text-xl font-black text-slate-800">
              {fluency}%
            </div>
            <span className="text-[11px] font-bold text-success mt-0.5">
              {fluency >= 85 ? 'High Speech Fluency' : fluency >= 70 ? 'Moderate Pauses' : 'Hesitant Delivery'}
            </span>
          </div>

          {/* Filler Words */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <Activity size={14} className="text-warning" />
              <span>Verbal Fillers</span>
            </div>
            <div className="text-xl font-black text-slate-800">
              {fillerCount}
            </div>
            <span
              className="text-[11px] font-bold mt-0.5"
              style={{ color: fillerCount === 0 ? '#45a66b' : fillerCount <= 2 ? '#d99a32' : '#d95757' }}
            >
              {fillerCount === 0 ? 'Zero Fillers · Crisp' : `${fillerCount} filler word${fillerCount > 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Time & Words */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <Clock size={14} className="text-slate-400" />
              <span>Spoken Length</span>
            </div>
            <div className="text-xl font-black text-slate-800">
              {durationFormatted}
            </div>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5">
              {evaluation.totalWords ?? 0} total words
            </span>
          </div>
        </div>

        {/* AI Voice Coaching Snippet */}
        {(evaluation.pacingFeedback || evaluation.fillerFeedback) && (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex flex-col gap-1.5">
            {evaluation.pacingFeedback && (
              <p>
                <strong className="text-slate-800">Pacing Commentary:</strong> {evaluation.pacingFeedback}
              </p>
            )}
            {evaluation.fillerFeedback && (
              <p>
                <strong className="text-slate-800">Speech Habits:</strong> {evaluation.fillerFeedback}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Interactive 3-Tab Assessment Suite ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-primary text-white shadow-xs scale-102'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Award size={15} /> Strengths & Gaps
        </button>

        <button
          onClick={() => setActiveTab('speech')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'speech'
              ? 'bg-primary text-white shadow-xs scale-102'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <FileText size={15} /> Spoken Transcript & Fillers
        </button>

        <button
          onClick={() => setActiveTab('ideal')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ideal'
              ? 'bg-primary text-white shadow-xs scale-102'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={15} /> Principal Engineer Model Answer
        </button>
      </div>

      {/* ── Tab Content Container ── */}
      <AnimatePresence mode="wait">
        {/* Tab 1: Strengths, Missing Concepts, Suggestions */}
        {activeTab === 'feedback' && (
          <motion.div
            key="tab-feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="card-elevated rounded-3xl p-6 bg-white border border-success/30 shadow-xs">
                <div className="flex items-center gap-2 mb-3.5">
                  <div className="w-8 h-8 rounded-xl bg-success-soft flex items-center justify-center text-success">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-success">
                      What You Articulated Well
                    </h4>
                    <p className="text-[11px] text-slate-400">Key strengths observed by the interviewer</p>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700">
                  {strengthsList.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-success-soft/20 border border-success/15">
                      <CheckCircle2 size={15} className="text-success flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Concepts & Edge Cases */}
              <div className="card-elevated rounded-3xl p-6 bg-white border border-warning/30 shadow-xs">
                <div className="flex items-center gap-2 mb-3.5">
                  <div className="w-8 h-8 rounded-xl bg-warning-soft flex items-center justify-center text-warning">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-warning">
                      Key Concepts Missed
                    </h4>
                    <p className="text-[11px] text-slate-400">Important keywords or mechanisms to include</p>
                  </div>
                </div>

                {evaluation.missingConcepts && evaluation.missingConcepts.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {evaluation.missingConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-warning-soft/70 border border-warning/30 text-warning"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Covered all foundational concepts expected for this role level.</p>
                )}

                {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-slate-100">
                    <p className="text-[11px] font-extrabold text-slate-600 uppercase mb-2">Areas for Technical Depth:</p>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {evaluation.weaknesses.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-warning font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Actionable Suggestions */}
            {evaluation.suggestions && evaluation.suggestions.length > 0 && (
              <div className="card-elevated rounded-3xl p-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
                    <Lightbulb size={16} />
                  </div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Actionable Improvement Strategy
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                  {evaluation.suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-primary-soft text-primary font-black flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 2: Spoken Transcript & Verbal Habits */}
        {activeTab === 'speech' && (
          <motion.div
            key="tab-speech"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            {/* Narrative Structure Critique */}
            {evaluation.structureFeedback && (
              <div className="card-elevated rounded-3xl p-6 bg-white border border-cyan/30 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-soft flex items-center justify-center text-cyan-text">
                    <Layers size={16} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Answer Framing & Narrative Flow
                  </h4>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium bg-cyan-soft/20 p-4 rounded-2xl border border-cyan/15">
                  {evaluation.structureFeedback}
                </p>
              </div>
            )}

            {/* Candidate Spoken Transcript with Fillers Highlighted */}
            <div className="card-elevated rounded-3xl p-6 bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Your Spoken Transcript Review
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Filler words and verbal pauses are highlighted in amber
                  </p>
                </div>

                {fillerCount > 0 && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-warning-soft text-warning border border-warning/20">
                    {fillerCount} filler word{fillerCount > 1 ? 's' : ''} detected
                  </span>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm leading-relaxed text-slate-800 font-sans max-h-64 overflow-y-auto font-medium">
                {transcriptSegments.length > 0 ? (
                  transcriptSegments.map((seg, idx) =>
                    seg.isFiller ? (
                      <span
                        key={idx}
                        className="bg-warning-soft text-warning px-1.5 py-0.5 rounded-md font-black border border-warning/30 inline-block mx-0.5"
                        title="Detected filler word — practice pausing silently"
                      >
                        {seg.text}
                      </span>
                    ) : (
                      <span key={idx}>{seg.text}</span>
                    )
                  )
                ) : (
                  <span className="text-slate-400 italic">No spoken transcript recorded for this response.</span>
                )}
              </div>

              {/* Detected Fillers List Chips */}
              {evaluation.fillerWords && evaluation.fillerWords.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500">Detected Fillers:</span>
                  {Array.from(new Set(evaluation.fillerWords)).map((filler, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-bold"
                    >
                      "{filler}"
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Principal Engineer Model Answer */}
        {activeTab === 'ideal' && (
          <motion.div
            key="tab-ideal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="card-elevated rounded-3xl p-6 md:p-8 bg-white border border-primary/30 shadow-lg shadow-primary/5"
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Principal Engineer Exemplar Response
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">Gold standard model answer crafted for this role</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleIdealAudio}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-danger-soft border-danger/30 text-danger'
                      : 'bg-white border-slate-200 hover:border-primary/40 text-slate-700 shadow-2xs'
                  }`}
                  title={isSpeaking ? 'Stop audio playback' : 'Listen to exemplar answer'}
                >
                  {isSpeaking ? (
                    <><VolumeX size={14} /> Stop Audio</>
                  ) : (
                    <><Volume2 size={14} className="text-primary" /> Listen Aloud</>
                  )}
                </button>

                <button
                  onClick={handleCopyIdeal}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Copy exemplar to clipboard"
                >
                  {copied ? (
                    <><Check size={14} className="text-success" /> Copied!</>
                  ) : (
                    <><Copy size={14} /> Copy</>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-soft/30 via-slate-50/50 to-primary-soft/10 border border-primary/20 text-sm leading-relaxed text-slate-800 font-sans whitespace-pre-line font-medium">
              {evaluation.idealAnswer || 'A comprehensive model answer will appear here.'}
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
              <Lightbulb size={15} className="text-primary flex-shrink-0" />
              <span>
                Notice how the model answer opens with core architecture, articulates operational mechanics, and wraps up with production trade-offs.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Next Question Floating Action Dock ── */}
      <div className="flex justify-center pt-3 pb-6">
        <motion.button
          id="next-question-btn"
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            if (isSpeaking) stopSpeaking();
            onNext();
          }}
          className="px-10 py-4 rounded-2xl text-base font-extrabold text-white shadow-lg cursor-pointer transition-all flex items-center gap-2.5"
          style={{
            background: isLastQuestion
              ? 'linear-gradient(135deg, #45a66b 0%, #2e7a4d 100%)'
              : 'linear-gradient(135deg, #8067e8 0%, #5d45c7 100%)',
            boxShadow: isLastQuestion
              ? '0 12px 30px rgba(69, 166, 107, 0.35)'
              : '0 12px 30px rgba(128, 103, 232, 0.35)',
          }}
        >
          {isLastQuestion ? '📊 Generate Final Performance Report' : 'Next Interview Question'}
          <ArrowRight size={20} strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
}
