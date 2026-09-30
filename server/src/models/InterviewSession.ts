import mongoose, { Document, Schema, Types } from 'mongoose';

export type JobRole = string;

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Experienced';

export type SessionStatus = 'in-progress' | 'completed' | 'abandoned';

export interface IInterviewSession extends Document {
  userId: Types.ObjectId;
  role: JobRole;
  experience: ExperienceLevel;
  status: SessionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // Total duration in seconds
}

const interviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
    },
    experience: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: ['Beginner', 'Intermediate', 'Experienced'],
    },
    status: {
      type: String,
      default: 'in-progress',
      enum: ['in-progress', 'completed', 'abandoned'],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const InterviewSession = mongoose.model<IInterviewSession>(
  'InterviewSession',
  interviewSessionSchema
);
