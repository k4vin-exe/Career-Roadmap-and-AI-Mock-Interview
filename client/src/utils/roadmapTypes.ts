// ─── Career Roadmap TypeScript Types ─────────────────────────────────────────

export interface UserProfile {
  name: string;
  workExperience: '0' | '1-2' | '3-5' | '5-10' | '10+';
  currentRole: string; // empty string if fresher
  skills: string[];
  ugField: string;
  pgField: string; // empty string if not applicable
  bio: string;
  desiredRole: string;
}

export interface DailyTask {
  day: number;
  task: string;
  estimatedHours: number;
  completed?: boolean; // tracked client-side in localStorage
}

export interface WeeklyPlan {
  week: number;
  theme: string;
  goal: string;
  topics: string[];
  resources: { title: string; url: string }[];
  dailyBreakdown: DailyTask[];
  milestone: string;
  practiceInterview: boolean;
  completed?: boolean; // derived — all tasks done
}

export interface Roadmap {
  profileId: string;
  profile: UserProfile;
  targetRole: string;
  totalWeeks: number;
  weeklyPlan: WeeklyPlan[];
  keySkillsToLearn: string[];
  estimatedReadinessDate: string; // ISO date string e.g. "2024-10-15"
  aiSummary: string;
  createdAt: string;
}

// Progress stored in localStorage keyed by profileId
export interface RoadmapProgress {
  profileId: string;
  completedTasks: Record<string, boolean>; // key: "w{week}-d{day}" → true
  lastUpdated: string;
  currentWeek: number;
}

// Computed stats derived from progress
export interface RoadmapStats {
  totalTasks: number;
  completedCount: number;
  percentage: number;
  currentWeek: number;
  weeksCompleted: number;
}

// Experience options for the onboarding form
export const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'Fresher (No experience)' },
  { value: '1-2', label: '1–2 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '5-10', label: '5–10 years' },
  { value: '10+', label: '10+ years' },
] as const;

export const UG_FIELDS = [
  'Computer Science / IT',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Data Science / AI',
  'Business Administration',
  'Mathematics / Statistics',
  'Physics',
  'Other',
] as const;

export const PG_FIELDS = [
  'Not Applicable',
  'Computer Science / IT',
  'Data Science / AI / ML',
  'Software Engineering',
  'MBA',
  'Electronics',
  'Other',
] as const;
