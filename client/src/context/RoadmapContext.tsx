import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { UserProfile, Roadmap } from '../utils/roadmapTypes';

// ─── State ─────────────────────────────────────────────────────────────────────
interface RoadmapState {
  profile: UserProfile | null;
  roadmap: Roadmap | null;
  isGenerating: boolean;
  error: string | null;
}

const initialState: RoadmapState = {
  profile: null,
  roadmap: null,
  isGenerating: false,
  error: null,
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ROADMAP'; payload: Roadmap }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

function roadmapReducer(state: RoadmapState, action: Action): RoadmapState {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, error: null };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_ROADMAP':
      return { ...state, roadmap: action.payload, isGenerating: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isGenerating: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface RoadmapContextValue {
  state: RoadmapState;
  dispatch: React.Dispatch<Action>;
}

const RoadmapContext = createContext<RoadmapContextValue | null>(null);

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(roadmapReducer, initialState);
  return (
    <RoadmapContext.Provider value={{ state, dispatch }}>
      {children}
    </RoadmapContext.Provider>
  );
}

export function useRoadmap() {
  const ctx = useContext(RoadmapContext);
  if (!ctx) throw new Error('useRoadmap must be used within RoadmapProvider');
  return ctx;
}
