import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [isLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-accent-glow flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-accent-light" />
          </div>

          {isLoading ? (
            <>
              <Loader2 size={24} className="animate-spin text-accent mx-auto mb-4" />
              <p className="text-text-secondary">
                Report UI will be built in Milestone 8
              </p>
            </>
          ) : (
            <p className="text-text-secondary">
              Session: {sessionId}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
