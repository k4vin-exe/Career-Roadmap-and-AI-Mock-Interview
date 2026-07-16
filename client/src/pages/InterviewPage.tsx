import { motion } from 'framer-motion';
import { useInterview } from '../context/InterviewContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Mic, MessageSquare } from 'lucide-react';

export default function InterviewPage() {
  const { state } = useInterview();
  const navigate = useNavigate();

  // Redirect if no session
  useEffect(() => {
    if (!state.session) {
      navigate('/setup');
    }
  }, [state.session, navigate]);

  if (!state.session) return null;

  const currentQuestion = state.questions[state.currentQuestionIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Interview in Progress
            </h1>
            <p className="text-text-secondary">
              {state.session.role} • {state.session.experience}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">Question</p>
            <p className="text-2xl font-bold gradient-text">
              {state.currentQuestionIndex + 1} / {state.questions.length}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <div className="glass rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-glow flex items-center justify-center flex-shrink-0">
              <MessageSquare size={20} className="text-accent-light" />
            </div>
            <div>
              <p className="text-xs text-accent-light font-medium uppercase tracking-wider mb-2">
                {currentQuestion?.difficulty} • {currentQuestion?.category}
              </p>
              <p className="text-lg text-text-primary leading-relaxed">
                {currentQuestion?.text}
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder for voice controls — will be built in Milestone 5 */}
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-glow flex items-center justify-center mx-auto mb-4">
            <Mic size={28} className="text-accent-light" />
          </div>
          <p className="text-text-secondary">
            Voice controls will be activated in Milestone 5
          </p>
          <p className="text-sm text-text-muted mt-2">
            Interview flow wiring in Milestone 6
          </p>
        </div>
      </motion.div>
    </div>
  );
}
