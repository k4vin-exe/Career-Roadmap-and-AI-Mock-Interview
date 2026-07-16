import mongoose, { Document, Schema, Types } from 'mongoose';

export type QuestionDifficulty = 'Easy' | 'Easy-Medium' | 'Medium' | 'Scenario Based' | 'Behavioral';

export interface IQuestion extends Document {
  sessionId: Types.ObjectId;
  index: number; // 1-5
  text: string;
  difficulty: QuestionDifficulty;
  type: string; // e.g., "Technical", "Scenario", "Behavioral"
  category: string; // e.g., "React", "System Design", "Teamwork"
}

const questionSchema = new Schema<IQuestion>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: [true, 'Session ID is required'],
    },
    index: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: [true, 'Question text is required'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Easy-Medium', 'Medium', 'Scenario Based', 'Behavioral'],
    },
    type: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient query: get all questions for a session in order
questionSchema.index({ sessionId: 1, index: 1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
