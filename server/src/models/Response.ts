import mongoose, { Document, Schema, Types } from 'mongoose';

// Evaluation structure returned by Gemini
export interface IEvaluation {
  technicalAccuracy: number; // 0-10
  communication: number; // 0-10
  completeness: number; // 0-10
  problemSolving: number; // 0-10
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  idealAnswer: string;
  suggestions: string[];
  encouragingFeedback: string;
}

export interface IResponse extends Document {
  sessionId: Types.ObjectId;
  questionId: Types.ObjectId;
  questionIndex: number;
  transcript: string; // Raw speech recognition output
  editedTranscript: string; // User-edited version
  totalWords: number;
  fillerWords: string[]; // Detected filler words with positions
  fillerWordCount: number;
  repeatedWords: string[]; // Detected repeated consecutive words
  repeatedWordCount: number;
  fluencyScore: number; // 0-100
  questionDuration: number; // Seconds spent on this question
  evaluation?: IEvaluation; // Gemini's evaluation
}

const evaluationSchema = new Schema<IEvaluation>(
  {
    technicalAccuracy: { type: Number, min: 0, max: 10 },
    communication: { type: Number, min: 0, max: 10 },
    completeness: { type: Number, min: 0, max: 10 },
    problemSolving: { type: Number, min: 0, max: 10 },
    strengths: [String],
    weaknesses: [String],
    missingConcepts: [String],
    idealAnswer: String,
    suggestions: [String],
    encouragingFeedback: String,
  },
  { _id: false }
);

const responseSchema = new Schema<IResponse>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    questionIndex: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    transcript: {
      type: String,
      default: '',
    },
    editedTranscript: {
      type: String,
      default: '',
    },
    totalWords: {
      type: Number,
      default: 0,
    },
    fillerWords: {
      type: [String],
      default: [],
    },
    fillerWordCount: {
      type: Number,
      default: 0,
    },
    repeatedWords: {
      type: [String],
      default: [],
    },
    repeatedWordCount: {
      type: Number,
      default: 0,
    },
    fluencyScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    questionDuration: {
      type: Number,
      default: 0,
    },
    evaluation: {
      type: evaluationSchema,
    },
  },
  {
    timestamps: true,
  }
);

responseSchema.index({ sessionId: 1, questionIndex: 1 });

export const Response = mongoose.model<IResponse>('Response', responseSchema);
