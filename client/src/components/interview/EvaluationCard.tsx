/**
 * EvaluationCard — AI Evaluation Feedback Display
 *
 * Renders the AI's structured evaluation of a candidate's answer,
 * including score breakdowns, feedback, and expected talking points.
 */

import { motion } from 'framer-motion';
import { CheckCircle, Target, MessageSquare, TrendingUp } from 'lucide-react';

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

function ScoreBar({
  label,
  score,
  delay = 0,
}: {
  label: string;
  score: number;
  delay?: number;
}) {
  const color =
    score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-sm font-semibold text-text-primary">{score}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Overall Score Header */}
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-sm text-text-secondary uppercase tracking-wider mb-2">
          Answer Score
        </p>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="text-5xl font-bold gradient-text mb-1"
        >
          {avgScore}%
        </motion.div>
      </div>

      {/* Score Breakdown */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-accent-light" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Score Breakdown
          </h3>
        </div>
        <ScoreBar label="Technical Accuracy" score={evaluation.technicalAccuracy} delay={0.1} />
        <ScoreBar label="Communication" score={evaluation.communication} delay={0.2} />
        <ScoreBar label="Completeness" score={evaluation.completeness} delay={0.3} />
        <ScoreBar label="Problem Solving" score={evaluation.problemSolving} delay={0.4} />
      </div>

      {/* AI Feedback */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={16} className="text-accent-light" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            AI Feedback
          </h3>
        </div>
        <p className="text-text-primary text-sm leading-relaxed">
          {evaluation.feedback}
        </p>
      </div>

      {/* Expected Talking Points */}
      {evaluation.expectedPoints && evaluation.expectedPoints.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-accent-light" />
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Key Points Expected
            </h3>
          </div>
          <ul className="space-y-2">
            {evaluation.expectedPoints.map((point, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-start gap-2.5"
              >
                <CheckCircle size={15} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-text-primary text-sm">{point}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Continue Button */}
      <motion.button
        id="next-question-btn"
        onClick={onNext}
        className="w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        whileHover={{ scale: 1.01, boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
        whileTap={{ scale: 0.99 }}
      >
        {isLastQuestion ? '📊 Generate Final Report' : '→ Next Question'}
      </motion.button>
    </motion.div>
  );
}
