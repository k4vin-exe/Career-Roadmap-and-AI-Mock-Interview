import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Briefcase, TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { startInterview } from '../services/api';
import { JOB_ROLES, EXPERIENCE_LEVELS } from '../utils/types';
import type { JobRole, ExperienceLevel } from '../utils/types';
import { Button, Card, Input, Select } from '../components';

export default function SetupPage() {
  const navigate = useNavigate();
  const { dispatch } = useInterview();

  const [name, setName] = useState('');
  const [role, setRole] = useState<JobRole | ''>('');
  const [experience, setExperience] = useState<ExperienceLevel | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = name.trim().length >= 2 && role !== '' && experience !== '';

  const handleStart = async () => {
    if (!isValid) return;

    setIsLoading(true);
    setError('');

    try {
      const session = await startInterview(name.trim(), role, experience);
      dispatch({ type: 'START_SESSION', payload: session });
      navigate('/interview');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Button 
          variant="ghost" 
          leftIcon={<ArrowLeft size={18} />} 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          Back
        </Button>

        <Card variant="glass" className="p-8">
          <h1 className="text-3xl font-bold mb-3 text-text-primary">Setup Your Interview</h1>
          <p className="text-text-secondary mb-10">Fill in the details to begin your AI mock interview.</p>

          <div className="space-y-8 mb-8">
            <Input
              label="Your Name"
              icon={User}
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />

            <Select
              label="Job Role"
              icon={Briefcase}
              options={JOB_ROLES}
              value={role}
              onChange={(val) => setRole(val as JobRole)}
            />

            <Select
              label="Experience Level"
              icon={TrendingUp}
              options={EXPERIENCE_LEVELS}
              value={experience}
              onChange={(val) => setExperience(val as ExperienceLevel)}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-error text-sm mb-4 text-center bg-error/10 border border-error/20 rounded-lg p-3"
            >
              {error}
            </motion.p>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!isValid}
            isLoading={isLoading}
            onClick={handleStart}
            rightIcon={<ArrowRight size={20} />}
          >
            {isLoading ? 'Starting Interview...' : 'Start Interview'}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
