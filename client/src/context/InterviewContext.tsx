import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { InterviewSession, Question, Evaluation } from '../utils/types';

// ──────────────────────────── State ────────────────────────────

interface AnswerRecord {
  questionIndex: number;
  transcript: string;
  editedTranscript: string;
  evaluation?: Evaluation;
  totalWords: number;
  fillerWordCount: number;
  repeatedWordCount: number;
  fluencyScore: number;
  questionDuration: number;
}

interface InterviewState {
  // Session data
  session: InterviewSession | null;
  questions: Question[];
  currentQuestionIndex: number; // 0-based for array indexing

  // Interview progress
  status: 'idle' | 'setup' | 'in-progress' | 'evaluating' | 'feedback' | 'completed';
  answers: AnswerRecord[];

  // Timing
  interviewStartTime: number | null;
  questionStartTime: number | null;

  // Loading & errors
  isLoading: boolean;
  error: string | null;
}

const initialState: InterviewState = {
  session: null,
  questions: [],
  currentQuestionIndex: 0,
  status: 'idle',
  answers: [],
  interviewStartTime: null,
  questionStartTime: null,
  isLoading: false,
  error: null,
};

// ──────────────────────────── Actions ────────────────────────────

type InterviewAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'START_SESSION'; payload: InterviewSession }
  | { type: 'SET_STATUS'; payload: InterviewState['status'] }
  | { type: 'START_INTERVIEW' }
  | { type: 'START_QUESTION' }
  | { type: 'SUBMIT_ANSWER'; payload: AnswerRecord }
  | { type: 'NEXT_QUESTION' }
  | { type: 'COMPLETE_INTERVIEW' }
  | { type: 'RESET' };

// ──────────────────────────── Reducer ────────────────────────────

function interviewReducer(state: InterviewState, action: InterviewAction): InterviewState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'START_SESSION':
      return {
        ...state,
        session: action.payload,
        questions: action.payload.questions,
        status: 'in-progress',
        isLoading: false,
        error: null,
      };

    case 'SET_STATUS':
      return { ...state, status: action.payload };

    case 'START_INTERVIEW':
      return {
        ...state,
        interviewStartTime: Date.now(),
        status: 'in-progress',
      };

    case 'START_QUESTION':
      return {
        ...state,
        questionStartTime: Date.now(),
        status: 'in-progress',
      };

    case 'SUBMIT_ANSWER':
      return {
        ...state,
        answers: [...state.answers, action.payload],
        status: 'feedback',
      };

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        questionStartTime: null,
        status: 'in-progress',
      };

    case 'COMPLETE_INTERVIEW':
      return {
        ...state,
        status: 'completed',
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ──────────────────────────── Context ────────────────────────────

interface InterviewContextType {
  state: InterviewState;
  dispatch: React.Dispatch<InterviewAction>;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

// ──────────────────────────── Provider ────────────────────────────

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(interviewReducer, initialState);

  return (
    <InterviewContext.Provider value={{ state, dispatch }}>
      {children}
    </InterviewContext.Provider>
  );
}

// ──────────────────────────── Hook ────────────────────────────

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
}
