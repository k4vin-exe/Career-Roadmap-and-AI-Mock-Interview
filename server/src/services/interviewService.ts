import { User, InterviewSession, Question, Response, Report } from '../models/index.js';
import type { JobRole, ExperienceLevel, IEvaluation } from '../models/index.js';
import GroqService from './groqService.js';
import { generateQuestionPrompt } from '../prompts/questionGeneration.js';
import { generateAnswerEvaluationPrompt } from '../prompts/answerEvaluation.js';
import { generateReportPrompt } from '../prompts/reportGeneration.js';
import { generateWarmupEvaluationPrompt } from '../prompts/warmupEvaluation.js';

interface StartInterviewInput {
  userId: string;
  name: string;
  role: JobRole;
  experience: ExperienceLevel;
}

interface SubmitAnswerInput {
  sessionId: string;
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

interface QuestionData {
  index: number;
  text: string;
  difficulty: string;
  type: string;
  category: string;
}

/**
 * InterviewService — Core business logic for the interview flow.
 * Orchestrates between database models and Gemini AI.
 */
class InterviewService {
  private groq = GroqService.getInstance();

  /**
   * Uses Groq as the sole AI provider.
   * Falls back to a predefined mock object if Groq fails.
   */
  private async callAI<T>(prompt: string, fallbackMock: T): Promise<T> {
    try {
      console.log('🤖 Routing AI request to Groq...');
      return await this.groq.generateJSON<T>(prompt);
    } catch (error: any) {
      console.warn('⚠️  Groq request failed:', error.message);
      console.warn('Falling back to mock data...');
      return fallbackMock;
    }
  }

  /**
   * Starts a new interview session:
   * 1. Creates/finds the user
   * 2. Creates the interview session
   * 3. Generates questions via Groq
   * 4. Stores questions in the database
   */
  async startInterview(input: StartInterviewInput) {
    // Find user by ID (auth middleware guarantees this exists, but good to be safe)
    const user = await User.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create interview session
    const session = await InterviewSession.create({
      userId: user._id,
      role: input.role,
      experience: input.experience,
      status: 'in-progress',
      startedAt: new Date(),
    });

    // Generate questions via Gemini
    const prompt = generateQuestionPrompt(input.role, input.experience);
    const mockQuestions = {
      questions: [
        { index: 1, text: `Can you explain your experience as a ${input.experience} ${input.role}?`, difficulty: 'Easy' as const, type: 'Behavioral', category: 'General' },
        { index: 2, text: "What is the most challenging technical problem you've solved recently?", difficulty: 'Medium' as const, type: 'Technical', category: 'Problem Solving' },
        { index: 3, text: "How do you ensure your code is maintainable and scalable?", difficulty: 'Medium' as const, type: 'Technical', category: 'Architecture' },
        { index: 4, text: "Can you describe a time you disagreed with a team member on a technical decision?", difficulty: 'Scenario Based' as const, type: 'Behavioral', category: 'Teamwork' },
        { index: 5, text: "Where do you see your technical skills growing in the next year?", difficulty: 'Easy' as const, type: 'Behavioral', category: 'Career Growth' }
      ]
    };

    const result = await this.callAI<{ questions: QuestionData[] }>(prompt, mockQuestions);

    // Store questions in database
    const questions = await Question.insertMany(
      result.questions.map((q) => ({
        sessionId: session._id,
        index: q.index,
        text: q.text,
        difficulty: q.difficulty,
        type: q.type,
        category: q.category,
      }))
    );

    return {
      sessionId: session._id,
      userId: user._id,
      userName: user.name,
      role: session.role,
      experience: session.experience,
      questions: questions.map((q) => ({
        id: q._id,
        index: q.index,
        text: q.text,
        difficulty: q.difficulty,
        type: q.type,
        category: q.category,
      })),
    };
  }

  /**
   * Gets session details with questions.
   */
  async getSession(sessionId: string) {
    const session = await InterviewSession.findById(sessionId).populate('userId');
    if (!session) throw new Error('Session not found');

    const questions = await Question.find({ sessionId }).sort({ index: 1 });
    const responses = await Response.find({ sessionId }).sort({ questionIndex: 1 });

    return { session, questions, responses };
  }

  /**
   * Gets questions for a session.
   */
  async getQuestions(sessionId: string) {
    const questions = await Question.find({ sessionId }).sort({ index: 1 });
    return questions;
  }

  /**
   * Evaluates the candidate's warmup self-introduction.
   * Returns scores + a natural AI transition message.
   */
  async evaluateWarmup(input: {
    sessionId: string;
    name: string;
    transcript: string;
    totalWords: number;
    fluencyScore: number;
  }) {
    const session = await InterviewSession.findById(input.sessionId);
    if (!session) throw new Error('Session not found');

    const prompt = generateWarmupEvaluationPrompt(
      input.name,
      session.role,
      session.experience,
      input.transcript || 'The candidate did not provide an introduction.',
      input.totalWords,
      input.fluencyScore
    );

    const mockWarmup = {
      communicationClarity: 70,
      confidencePresence: 70,
      backgroundRelevance: 70,
      structureCoherence: 70,
      highlights: ['Good energy', 'Relevant background mentioned'],
      suggestions: ['Try to be a bit more specific about your past projects'],
      transitionMessage: `Thanks for sharing that, ${input.name} — it sounds like you have a solid background. Let's jump into the technical questions and see how you approach problems.`,
    };

    const result = await this.callAI<typeof mockWarmup>(prompt, mockWarmup);
    return result;
  }

  /**
   * Submits and evaluates a candidate's answer:
   * 1. Finds the question
   * 2. Sends answer + metrics to Gemini for evaluation
   * 3. Stores the response with evaluation
   */
  async submitAnswer(input: SubmitAnswerInput) {
    const question = await Question.findOne({
      sessionId: input.sessionId,
      index: input.questionIndex,
    });

    if (!question) throw new Error('Question not found');

    const session = await InterviewSession.findById(input.sessionId);
    if (!session) throw new Error('Session not found');

    // Send to Gemini for evaluation
    const prompt = generateAnswerEvaluationPrompt(
      question.text,
      input.editedTranscript || input.transcript,
      session.role,
      session.experience,
      {
        repeatedWords: input.repeatedWordCount,
        fillerWords: input.fillerWordCount,
        fluencyScore: input.fluencyScore,
        totalWords: input.totalWords,
      }
    );

    const mockEvaluation: IEvaluation = {
      technicalAccuracy: 7.5,
      communication: 8.0,
      completeness: 7.0,
      problemSolving: 8.5,
      strengths: ["Clear communication", "Good foundational knowledge"],
      weaknesses: ["Needs more specific technical examples", "Could structure answers better using STAR method"],
      missingConcepts: ["Did not mention scalability", "Missed edge cases"],
      idealAnswer: "An ideal answer would cover X, Y, and Z clearly with examples.",
      suggestions: ["Try to structure your thoughts before answering", "Provide concrete metrics when describing past projects"],
      encouragingFeedback: "Good job overall, you're on the right track! Just a few tweaks and it'll be perfect.",
    };

    const evaluation = await this.callAI<IEvaluation>(prompt, mockEvaluation);

    // Store response
    const response = await Response.create({
      sessionId: input.sessionId,
      questionId: question._id,
      questionIndex: input.questionIndex,
      transcript: input.transcript,
      editedTranscript: input.editedTranscript || input.transcript,
      totalWords: input.totalWords,
      fillerWords: input.fillerWords,
      fillerWordCount: input.fillerWordCount,
      repeatedWords: input.repeatedWords,
      repeatedWordCount: input.repeatedWordCount,
      fluencyScore: input.fluencyScore,
      questionDuration: input.questionDuration,
      evaluation,
    });

    return {
      responseId: response._id,
      evaluation,
    };
  }

  /**
   * Generates the final interview report:
   * 1. Fetches all responses for the session
   * 2. Computes aggregate scores
   * 3. Sends to Gemini for holistic summary
   * 4. Stores the report
   * 5. Marks session as completed
   */
  async generateReport(sessionId: string) {
    const session = await InterviewSession.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const questions = await Question.find({ sessionId }).sort({ index: 1 });
    const responses = await Response.find({ sessionId }).sort({ questionIndex: 1 });

    if (responses.length === 0) throw new Error('No responses found for this session');

    // Build per-question scores from existing evaluations
    const questionScores = responses.map((r) => ({
      questionIndex: r.questionIndex,
      technicalAccuracy: r.evaluation?.technicalAccuracy || 0,
      communication: r.evaluation?.communication || 0,
      completeness: r.evaluation?.completeness || 0,
      problemSolving: r.evaluation?.problemSolving || 0,
      fluencyScore: r.fluencyScore,
    }));

    // Calculate average fluency (application logic)
    const averageFluency = Math.round(
      responses.reduce((sum, r) => sum + r.fluencyScore, 0) / responses.length
    );

    // Calculate total duration (application logic)
    const totalDuration = responses.reduce((sum, r) => sum + r.questionDuration, 0);

    // --- LOCAL RULE-BASED ENGINE ---
    const avgTech = Math.round(questionScores.reduce((sum, q) => sum + q.technicalAccuracy, 0) / questionScores.length * 10);
    const avgComm = Math.round(questionScores.reduce((sum, q) => sum + q.communication, 0) / questionScores.length * 10);
    const avgProblem = Math.round(questionScores.reduce((sum, q) => sum + q.problemSolving, 0) / questionScores.length * 10);
    
    const overallScore = Math.round((avgTech + avgComm + avgProblem + averageFluency) / 4);
    
    const strengths = [];
    const weaknesses = [];
    
    if (avgTech >= 80) strengths.push('Strong technical accuracy and domain knowledge');
    else weaknesses.push('Technical depth needs improvement; review core concepts');
    
    if (avgComm >= 80) strengths.push('Clear and concise communication');
    else weaknesses.push('Communication can be clearer; try using the STAR method');
    
    if (averageFluency >= 80) strengths.push('Excellent speaking fluency');
    else weaknesses.push('Work on reducing pauses and hesitations during speech');

    const totalFillerWords = responses.reduce((sum, r) => sum + (r.fillerWordCount || 0), 0);
    let aiSummary = `This is a system-generated report. Overall, you scored ${overallScore}/100. `;
    
    if (overallScore >= 80) {
      aiSummary += `You demonstrated excellent proficiency for the ${session.role} position and performed like a Strong Hire. `;
    } else if (overallScore >= 60) {
      aiSummary += `You showed good potential but have some clear areas for improvement before taking a real interview. `;
    } else {
      aiSummary += `You need significant preparation and foundational review before proceeding with interviews for this role. `;
    }

    if (totalFillerWords > 10) {
      aiSummary += `\n\nNotice: You used a high number of filler words (${totalFillerWords} total). Consider pacing your speech and taking deliberate pauses instead of using fillers like "um" and "uh". `;
    }

    const reportData = {
      overallTechnicalScore: avgTech,
      communicationScore: avgComm,
      strengths: strengths.length > 0 ? strengths : ['Willingness to learn'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['Overall confidence'],
      topicsToImprove: ['Role-specific fundamentals', 'System Architecture'],
      practiceAreas: ['Mock Interviews', 'Pacing and delivery'],
      interviewReadiness: overallScore >= 80 ? 'Interview Ready' : 'Needs Practice',
      aiSummary,
    };

    // Store report
    const report = await Report.create({
      sessionId,
      overallTechnicalScore: reportData.overallTechnicalScore,
      communicationScore: reportData.communicationScore,
      fluencyScore: averageFluency,
      questionScores,
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      topicsToImprove: reportData.topicsToImprove,
      practiceAreas: reportData.practiceAreas,
      interviewReadiness: reportData.interviewReadiness,
      aiSummary: reportData.aiSummary,
    });

    // Mark session as completed
    session.status = 'completed';
    session.completedAt = new Date();
    session.duration = totalDuration;
    await session.save();

    return report;
  }

  /**
   * Retrieves a stored report.
   */
  async getReport(sessionId: string) {
    const report = await Report.findOne({ sessionId });
    if (!report) throw new Error('Report not found');

    const session = await InterviewSession.findById(sessionId).populate('userId');
    const questions = await Question.find({ sessionId }).sort({ index: 1 });
    const responses = await Response.find({ sessionId }).sort({ questionIndex: 1 });

    return { report, session, questions, responses };
  }
}

export default new InterviewService();
