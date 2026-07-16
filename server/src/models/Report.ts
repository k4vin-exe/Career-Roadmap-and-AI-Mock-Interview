import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQuestionScore {
  questionIndex: number;
  technicalAccuracy: number;
  communication: number;
  completeness: number;
  problemSolving: number;
  fluencyScore: number;
}

export interface IReport extends Document {
  sessionId: Types.ObjectId;
  overallTechnicalScore: number; // 0-100
  communicationScore: number; // 0-100
  fluencyScore: number; // 0-100 (average of all questions)
  questionScores: IQuestionScore[];
  strengths: string[];
  weaknesses: string[];
  topicsToImprove: string[];
  practiceAreas: string[];
  interviewReadiness: string; // e.g., "Ready", "Almost Ready", "Needs Practice"
  aiSummary: string; // Gemini-generated narrative summary
}

const questionScoreSchema = new Schema<IQuestionScore>(
  {
    questionIndex: { type: Number, required: true },
    technicalAccuracy: { type: Number, min: 0, max: 10 },
    communication: { type: Number, min: 0, max: 10 },
    completeness: { type: Number, min: 0, max: 10 },
    problemSolving: { type: Number, min: 0, max: 10 },
    fluencyScore: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const reportSchema = new Schema<IReport>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
      unique: true,
    },
    overallTechnicalScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    fluencyScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    questionScores: [questionScoreSchema],
    strengths: [String],
    weaknesses: [String],
    topicsToImprove: [String],
    practiceAreas: [String],
    interviewReadiness: {
      type: String,
    },
    aiSummary: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model<IReport>('Report', reportSchema);
