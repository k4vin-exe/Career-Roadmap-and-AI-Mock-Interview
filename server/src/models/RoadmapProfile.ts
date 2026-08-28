import mongoose, { Schema, type Document } from 'mongoose';

// ─── Daily Task ───────────────────────────────────────────────────────────────
interface IDailyTask {
  day: number;
  task: string;
  estimatedHours: number;
}

// ─── Weekly Plan ─────────────────────────────────────────────────────────────
interface IWeeklyPlan {
  week: number;
  theme: string;
  goal: string;
  topics: string[];
  dailyBreakdown: IDailyTask[];
  milestone: string;
  practiceInterview: boolean;
}

// ─── User Profile snapshot (stored alongside the roadmap) ─────────────────────
interface IUserProfile {
  name: string;
  workExperience: string;
  currentRole: string;
  skills: string[];
  ugField: string;
  pgField: string;
  bio: string;
  desiredRole: string;
}

// ─── Document Interface ───────────────────────────────────────────────────────
export interface IRoadmapProfile extends Document {
  userId: mongoose.Types.ObjectId;
  profile: IUserProfile;
  targetRole: string;
  totalWeeks: number;
  weeklyPlan: IWeeklyPlan[];
  keySkillsToLearn: string[];
  estimatedReadinessDate: string;
  aiSummary: string;
  completedTasks: Map<string, boolean>;
  createdAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const DailyTaskSchema = new Schema<IDailyTask>(
  {
    day: { type: Number, required: true },
    task: { type: String, required: true },
    estimatedHours: { type: Number, default: 2 },
  },
  { _id: false }
);

const WeeklyPlanSchema = new Schema<IWeeklyPlan>(
  {
    week: { type: Number, required: true },
    theme: { type: String, required: true },
    goal: { type: String, required: true },
    topics: [{ type: String }],
    dailyBreakdown: [DailyTaskSchema],
    milestone: { type: String, required: true },
    practiceInterview: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserProfileSchema = new Schema<IUserProfile>(
  {
    name: { type: String, required: true },
    workExperience: { type: String, required: true },
    currentRole: { type: String, default: '' },
    skills: [{ type: String }],
    ugField: { type: String, required: true },
    pgField: { type: String, default: '' },
    bio: { type: String, default: '' },
    desiredRole: { type: String, required: true },
  },
  { _id: false }
);

const RoadmapProfileSchema = new Schema<IRoadmapProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    profile: { type: UserProfileSchema, required: true },
    targetRole: { type: String, required: true },
    totalWeeks: { type: Number, required: true },
    weeklyPlan: [WeeklyPlanSchema],
    keySkillsToLearn: [{ type: String }],
    estimatedReadinessDate: { type: String },
    aiSummary: { type: String },
    completedTasks: { type: Map, of: Boolean, default: {} },
  },
  { timestamps: true }
);

export const RoadmapProfile = mongoose.model<IRoadmapProfile>('RoadmapProfile', RoadmapProfileSchema);
