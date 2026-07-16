// ──────────────────────────── Job Roles ────────────────────────────

export const JOB_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Cloud Engineer',
  'Java Developer',
  'Python Developer',
  'Data Analyst',
  'Machine Learning Engineer',
] as const;

export type JobRole = (typeof JOB_ROLES)[number];

// ──────────────────────────── Experience Levels ────────────────────────────

export const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Experienced'] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

// ──────────────────────────── Question ────────────────────────────

export interface Question {
  id: string;
  index: number;
  text: string;
  difficulty: string;
  type: string;
  category: string;
}

// ──────────────────────────── Evaluation ────────────────────────────

export interface Evaluation {
  technicalAccuracy: number;
  communication: number;
  completeness: number;
  problemSolving: number;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  idealAnswer: string;
  suggestions: string[];
  encouragingFeedback: string;
}

// ──────────────────────────── Speech Metrics ────────────────────────────

export interface SpeechMetrics {
  totalWords: number;
  fillerWords: string[];
  fillerWordCount: number;
  repeatedWords: string[];
  repeatedWordCount: number;
  fluencyScore: number;
}

// ──────────────────────────── Response ────────────────────────────

export interface AnswerResponse {
  responseId: string;
  evaluation: Evaluation;
}

// ──────────────────────────── Interview Session ────────────────────────────

export interface InterviewSession {
  sessionId: string;
  userId: string;
  userName: string;
  role: JobRole;
  experience: ExperienceLevel;
  questions: Question[];
}

// ──────────────────────────── Question Score ────────────────────────────

export interface QuestionScore {
  questionIndex: number;
  technicalAccuracy: number;
  communication: number;
  completeness: number;
  problemSolving: number;
  fluencyScore: number;
}

// ──────────────────────────── Report ────────────────────────────

export interface InterviewReport {
  sessionId: string;
  overallTechnicalScore: number;
  communicationScore: number;
  fluencyScore: number;
  questionScores: QuestionScore[];
  strengths: string[];
  weaknesses: string[];
  topicsToImprove: string[];
  practiceAreas: string[];
  interviewReadiness: string;
  aiSummary: string;
}

// ──────────────────────────── Submit Answer Payload ────────────────────────────

export interface SubmitAnswerPayload {
  questionIndex: number;
  transcript: string;
  editedTranscript: string;
  totalWords: number;
  fillerWords: string[];
  fillerWordCount: number;
  repeatedWords: string[];
  repeatedWordCount: number;
  fluencyScore: number;
  questionDuration: number;
}

// ──────────────────────────── API Response Wrapper ────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
