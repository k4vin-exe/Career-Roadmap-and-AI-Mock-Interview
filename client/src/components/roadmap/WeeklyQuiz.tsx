import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Trophy, Sparkles, AlertCircle, Award
} from 'lucide-react';
import { getQuizForWeek, type QuizQuestion } from '../../utils/roadmapQuizBank';

interface WeeklyQuizProps {
  weekNumber: number;
  theme: string;
  goal: string;
  topics: string[];
  targetRole: string;
  isCompleted: boolean;
  onQuizComplete: (week: number) => void;
}

export default function WeeklyQuiz({
  weekNumber,
  theme,
  goal,
  topics,
  targetRole,
  isCompleted,
  onQuizComplete,
}: WeeklyQuizProps) {
  const questions: QuizQuestion[] = useMemo(() => {
    return getQuizForWeek(weekNumber, theme, goal, topics, targetRole);
  }, [weekNumber, theme, goal, topics, targetRole]);

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isRetaking, setIsRetaking] = useState<boolean>(false);

  const currentQ = questions[currentIdx];
  const totalQuestions = questions.length;

  // Calculate score
  const correctCount = useMemo(() => {
    return Object.entries(userAnswers).reduce((count, [idxStr, selectedIdx]) => {
      const q = questions[Number(idxStr)];
      return q && q.correctIndex === selectedIdx ? count + 1 : count;
    }, 0);
  }, [userAnswers, questions]);

  const passingScore = Math.ceil(totalQuestions * 0.6); // 2 out of 3
  const isPassed = correctCount >= passingScore;

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return; // Prevent changing after answer
    setSelectedOption(idx);
    setShowExplanation(true);
    setUserAnswers((prev) => ({ ...prev, [currentIdx]: idx }));
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
      if (isPassed) {
        onQuizComplete(weekNumber);
      }
    }
  };

  const handleRetake = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setUserAnswers({});
    setIsFinished(false);
    setIsRetaking(true);
  };

  // If already completed and user isn't currently retaking
  if (isCompleted && !isRetaking && !isFinished) {
    return (
      <div
        style={{
          background: 'rgba(69,166,107,0.06)',
          border: '1px solid rgba(69,166,107,0.25)',
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0,
            }}
          >
            <Award size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
                Week {weekNumber} Quiz Completed
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'var(--success-soft)',
                  color: 'var(--success-text)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Passed
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              You have verified your mastery of this week's technical curriculum.
            </p>
          </div>
        </div>
        <button
          onClick={handleRetake}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RotateCcw size={14} /> Retake Quiz
        </button>
      </div>
    );
  }

  // Finished view (Score screen)
  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: isPassed ? 'rgba(69,166,107,0.06)' : 'rgba(233,119,63,0.06)',
          border: `1px solid ${isPassed ? 'rgba(69,166,107,0.25)' : 'rgba(233,119,63,0.25)'}`,
          borderRadius: 18,
          padding: '28px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-md)',
            color: isPassed ? 'var(--success)' : 'var(--coral)',
          }}
        >
          {isPassed ? <Trophy size={32} /> : <AlertCircle size={32} />}
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
          {isPassed ? `🎉 Week ${weekNumber} Quiz Passed!` : 'Keep Learning!'}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.6 }}>
          {isPassed
            ? `You scored ${correctCount} out of ${totalQuestions} (${Math.round((correctCount / totalQuestions) * 100)}%). Outstanding mastery of this week's topics!`
            : `You scored ${correctCount} out of ${totalQuestions}. A score of at least ${passingScore} is required to unlock the next week. Review this week's topics and try again!`}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <button
            onClick={handleRetake}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <RotateCcw size={16} /> Retake Quiz
          </button>
          {isPassed && (
            <button
              onClick={() => {
                setIsFinished(false);
                setIsRetaking(false);
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <CheckCircle2 size={16} /> Finish Week
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Active Question view
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--surface-solid)',
        border: '1.5px solid rgba(128,103,232,0.25)',
        borderRadius: 18,
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Quiz Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--primary-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <HelpCircle size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              Week {weekNumber} Knowledge Check
            </h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Pass this quiz (score ≥ {passingScore}/{totalQuestions}) to complete Week {weekNumber}
            </p>
          </div>
        </div>
        <div
          style={{
            padding: '4px 12px',
            borderRadius: 100,
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--primary)',
          }}
        >
          {currentIdx + 1} / {totalQuestions}
        </div>
      </div>

      {/* Question Text */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
          {currentQ.question}
        </p>
      </div>

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {currentQ.options.map((opt, i) => {
          const isSelected = selectedOption === i;
          const isCorrect = i === currentQ.correctIndex;
          const isRevealed = selectedOption !== null;

          let bg = 'var(--surface-muted)';
          let border = '1px solid var(--border)';
          let textColor = 'var(--text)';

          if (isRevealed) {
            if (isCorrect) {
              bg = 'rgba(69,166,107,0.12)';
              border = '1.5px solid var(--success)';
              textColor = 'var(--success-text)';
            } else if (isSelected && !isCorrect) {
              bg = 'rgba(217,87,87,0.12)';
              border = '1.5px solid var(--danger)';
              textColor = 'var(--danger-text)';
            }
          } else if (isSelected) {
            bg = 'var(--primary-soft)';
            border = '1.5px solid var(--primary)';
          }

          const optionLetter = String.fromCharCode(65 + i);

          return (
            <motion.button
              key={i}
              whileHover={!isRevealed ? { scale: 1.01 } : {}}
              whileTap={!isRevealed ? { scale: 0.99 } : {}}
              onClick={() => handleSelectOption(i)}
              disabled={isRevealed}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '13px 16px',
                borderRadius: 12,
                cursor: isRevealed ? 'default' : 'pointer',
                textAlign: 'left',
                background: bg,
                border: border,
                color: textColor,
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isRevealed && isCorrect ? 'var(--success)' : isRevealed && isSelected && !isCorrect ? 'var(--danger)' : 'white',
                  color: isRevealed && (isCorrect || (isSelected && !isCorrect)) ? 'white' : 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: 800,
                  boxShadow: 'var(--shadow-sm)',
                  flexShrink: 0,
                }}
              >
                {isRevealed && isCorrect ? (
                  <CheckCircle2 size={16} />
                ) : isRevealed && isSelected && !isCorrect ? (
                  <XCircle size={16} />
                ) : (
                  optionLetter
                )}
              </span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{opt}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation Banner */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: selectedOption === currentQ.correctIndex ? 'rgba(69,166,107,0.08)' : 'rgba(217,87,87,0.08)',
              border: `1px solid ${selectedOption === currentQ.correctIndex ? 'rgba(69,166,107,0.25)' : 'rgba(217,87,87,0.25)'}`,
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Sparkles
                size={18}
                style={{
                  color: selectedOption === currentQ.correctIndex ? 'var(--success)' : 'var(--danger)',
                  marginTop: 2,
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: selectedOption === currentQ.correctIndex ? 'var(--success-text)' : 'var(--danger-text)',
                    margin: '0 0 4px',
                  }}
                >
                  {selectedOption === currentQ.correctIndex ? 'Correct Explanation' : 'Explanation'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
                  {currentQ.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action footer */}
      {selectedOption !== null && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleNext}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            {currentIdx < totalQuestions - 1 ? 'Next Question' : 'See Results'} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
