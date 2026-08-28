import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Brain, BarChart3, Sparkles, ArrowRight, Map, Target, CheckCircle2 } from 'lucide-react';
import { Button, Card } from '../components';

const interviewFeatures = [
  { icon: Brain, title: 'AI-Powered Questions', description: 'Dynamic questions tailored to your role and experience level' },
  { icon: Mic, title: 'Voice Interaction', description: 'Speak naturally — AI listens, transcribes, and evaluates your answers' },
  { icon: BarChart3, title: 'Speech Analysis', description: 'Real-time fluency scoring, filler word detection, and communication feedback' },
  { icon: Sparkles, title: 'Detailed Reports', description: 'Comprehensive interview reports with actionable improvement suggestions' },
];

const roadmapFeatures = [
  { icon: Target, title: 'Personalized Plans', description: 'AI builds a week-by-week roadmap based on your skills and target role' },
  { icon: CheckCircle2, title: 'Progress Tracking', description: 'Check off daily tasks and watch your progress grow week by week' },
  { icon: Map, title: 'Structured Learning', description: 'Guided topics sequenced like roadmap.sh for your specific career path' },
  { icon: Mic, title: 'Practice Integration', description: 'Jump into mock interviews at the end of each learning phase' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">

      {/* ── Hero ── */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-glow border border-accent/20 text-accent-light text-sm mb-8"
          >
            <Sparkles size={16} />
            <span>Career Solutions</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="text-text-primary">Your AI-Powered</span>
            <br />
            <span className="gradient-text">Career Co-Pilot</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-text-secondary max-w-2xl mx-auto mb-10"
          >
            Build a personalized career roadmap, track your learning, and practice with an AI interviewer — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate('/roadmap/start')}
              rightIcon={<ArrowRight size={20} />}
            >
              <Map size={18} />
              Build My Roadmap
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate('/setup')}
              rightIcon={<ArrowRight size={18} />}
            >
              Start Mock Interview
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Career Roadmap Section ── */}
      <section className="px-6 py-20 border-t border-border" style={{ background: 'rgba(99,102,241,0.03)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-glow border border-accent/20 text-accent-light text-xs font-semibold uppercase tracking-wide mb-4">
              <Map size={13} /> Career Roadmap
            </div>
            <h2 className="text-3xl font-bold text-text-primary">Your Personalized Learning Path</h2>
            <p className="text-text-secondary mt-3 max-w-xl mx-auto">
              Tell us about yourself and we'll generate a week-by-week plan to land your dream role.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {roadmapFeatures.map((feature, index) => (
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
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed flex-1">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" onClick={() => navigate('/roadmap/start')} rightIcon={<ArrowRight size={18} />}>
              <Map size={18} /> Get My Roadmap
            </Button>
          </div>
        </div>
      </section>

      {/* ── Mock Interview Section ── */}
      <section className="px-6 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-glow border border-accent/20 text-accent-light text-xs font-semibold uppercase tracking-wide mb-4">
              <Mic size={13} /> Mock Interview
            </div>
            <h2 className="text-3xl font-bold text-text-primary">Practice Makes Perfect</h2>
            <p className="text-text-secondary mt-3 max-w-xl mx-auto">
              Practice technical interviews with an AI that speaks, listens, and gives you real-time feedback.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {interviewFeatures.map((feature, index) => (
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
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed flex-1">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 border-t border-border text-center text-text-secondary text-sm">
        <p>Career R&I — Project</p>
      </footer>
    </div>
  );
}
