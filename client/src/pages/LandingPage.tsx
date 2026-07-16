import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Brain, BarChart3, Sparkles, ArrowRight } from 'lucide-react';
import { Button, Card } from '../components';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Questions',
    description: 'Dynamic questions tailored to your role and experience level',
  },
  {
    icon: Mic,
    title: 'Voice Interaction',
    description: 'Speak naturally — AI listens, transcribes, and evaluates your answers',
  },
  {
    icon: BarChart3,
    title: 'Speech Analysis',
    description: 'Real-time fluency scoring, filler word detection, and communication feedback',
  },
  {
    icon: Sparkles,
    title: 'Detailed Reports',
    description: 'Comprehensive interview reports with actionable improvement suggestions',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-glow border border-accent/20 text-accent-light text-sm mb-8"
          >
            <Sparkles size={16} />
            <span>Powered by Google Gemini AI</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="text-text-primary">Ace Your Next</span>
            <br />
            <span className="gradient-text">Technical Interview</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-text-secondary max-w-2xl mx-auto mb-10"
          >
            Practice with an AI interviewer that speaks, listens, and provides
            real-time feedback on your technical and communication skills.
          </motion.p>

          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.3 }}
          >
             <Button
               size="lg"
               onClick={() => navigate('/setup')}
               rightIcon={<ArrowRight size={20} />}
             >
               Start Mock Interview
             </Button>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 text-text-primary"
          >
            Why Practice With Us?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                 <Card variant="glass" hoverEffect className="p-6 h-full flex flex-col group">
                    <div className="w-12 h-12 rounded-xl bg-accent-glow flex items-center justify-center mb-4 group-hover:animate-pulse-glow transition-all duration-300">
                      <feature.icon size={24} className="text-accent-light" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed flex-1">
                      {feature.description}
                    </p>
                 </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="px-6 py-8 border-t border-border text-center text-text-secondary text-sm">
        <p>AI Mock Interview Platform — Final Year Engineering Project</p>
      </footer>
    </div>
  );
}
