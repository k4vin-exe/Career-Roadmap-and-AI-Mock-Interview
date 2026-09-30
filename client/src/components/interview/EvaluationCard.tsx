import { motion } from 'framer-motion';
import { CheckCircle, Target, MessageSquare, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

interface EvaluationData {
  technicalAccuracy: number;
  communication: number;
  completeness: number;
  problemSolving: number;
  feedback: string;
  expectedPoints: string[];
}

interface EvaluationCardProps {
  evaluation: EvaluationData;
  onNext: () => void;
  isLastQuestion: boolean;
}

function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', width: 140, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 100, background: 'var(--surface-muted)', overflow: 'hidden', position: 'relative' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 100, background: color, boxShadow: `0 0 10px ${color}80` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay, type: 'spring', bounce: 0.2 }}
        />
      </div>
      <span style={{ fontSize: 13, fontWeight: 900, width: 36, textAlign: 'right', color }}>{score}%</span>
    </div>
  );
}

export default function EvaluationCard({
  evaluation,
  onNext,
  isLastQuestion,
}: EvaluationCardProps) {
  const avgScore = Math.round(
    (evaluation.technicalAccuracy +
      evaluation.communication +
      evaluation.completeness +
      evaluation.problemSolving) /
      4
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px', gap: 24, alignItems: 'stretch' }}>
        
        {/* Score Breakdown */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Score Breakdown
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ScoreBar label="Technical Accuracy" score={evaluation.technicalAccuracy} delay={0.1} />
            <ScoreBar label="Communication" score={evaluation.communication} delay={0.2} />
            <ScoreBar label="Completeness" score={evaluation.completeness} delay={0.3} />
            <ScoreBar label="Problem Solving" score={evaluation.problemSolving} delay={0.4} />
          </div>
        </div>

        {/* Overall Score */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: 24, padding: 32, boxShadow: '0 20px 40px rgba(49,46,129,0.2)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
            <Sparkles size={120} color="#fff" />
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, position: 'relative', zIndex: 1 }}>
            Overall Score
          </p>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
            style={{ fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 1, position: 'relative', zIndex: 1, textShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
          >
            {avgScore}<span style={{ fontSize: 24, opacity: 0.6 }}>%</span>
          </motion.div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* AI Feedback */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={16} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              AI Feedback
            </h3>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            {evaluation.feedback}
          </p>
        </div>

        {/* Expected Talking Points */}
        {evaluation.expectedPoints && evaluation.expectedPoints.length > 0 && (
          <div style={{ background: 'var(--success-soft)', borderRadius: 24, padding: 32, border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={16} color="#10b981" />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Key Points Expected
              </h3>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
              {evaluation.expectedPoints.map((point, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <CheckCircle size={18} color="#10b981" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <motion.button
          id="next-question-btn"
          whileHover={{ scale: 1.05, boxShadow: '0 15px 30px rgba(99,102,241,0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          style={{ 
            padding: '0 40px', height: 64, borderRadius: 32, 
            background: isLastQuestion ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #4f46e5)', 
            color: '#fff', fontSize: 18, fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 
          }}
        >
          {isLastQuestion ? '📊 Generate Final Report' : 'Next Question'} <ArrowRight size={22} strokeWidth={3} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
