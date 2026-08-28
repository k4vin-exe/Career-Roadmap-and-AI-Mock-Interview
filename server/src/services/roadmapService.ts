import { RoadmapProfile } from '../models/RoadmapProfile.js';
import GeminiService from './geminiService.js';
import GroqService from './groqService.js';
import config from '../config/index.js';
import { generateRoadmapPrompt } from '../prompts/roadmapGeneration.js';

interface UserProfileInput {
  name: string;
  workExperience: string;
  currentRole: string;
  skills: string[];
  ugField: string;
  pgField: string;
  bio: string;
  desiredRole: string;
}

interface GeneratedRoadmap {
  targetRole: string;
  totalWeeks: number;
  weeklyPlan: Array<{
    week: number;
    theme: string;
    goal: string;
    topics: string[];
    dailyBreakdown: Array<{ day: number; task: string; estimatedHours: number }>;
    milestone: string;
    practiceInterview: boolean;
  }>;
  keySkillsToLearn: string[];
  estimatedReadinessDate: string;
  aiSummary: string;
}

class RoadmapService {
  private gemini = GeminiService.getInstance();
  private groq = GroqService.getInstance();

  /**
   * AI provider helper — tries Groq, falls back to Gemini, then mock.
   * Identical pattern to InterviewService.callAI().
   */
  private async callAI<T>(prompt: string, fallback: T): Promise<T> {
    const hasGroq = !!config.groqApiKey;
    const hasGemini = !!config.geminiApiKey;

    if (hasGroq) {
      try {
        console.log('🗺️  Roadmap: routing to Groq...');
        return await this.groq.generateJSON<T>(prompt);
      } catch (err: any) {
        console.warn('⚠️  Groq failed for roadmap:', err.message);
        if (!hasGemini) return fallback;
      }
    }

    if (hasGemini) {
      try {
        console.log('🗺️  Roadmap: routing to Gemini...');
        return await this.gemini.generateJSON<T>(prompt);
      } catch (err: any) {
        console.warn('⚠️  Gemini failed for roadmap:', err.message);
      }
    }

    console.warn('⚠️  All AI providers failed for roadmap. Using mock.');
    return fallback;
  }

  /**
   * Generates a personalized roadmap for the given user profile,
   * stores it in MongoDB, and returns the full roadmap with profileId.
   */
  async generateRoadmap(userId: string, profileInput: UserProfileInput) {
    const prompt = generateRoadmapPrompt(profileInput);

    const mockRoadmap: GeneratedRoadmap = {
      targetRole: profileInput.desiredRole,
      totalWeeks: 8,
      weeklyPlan: Array.from({ length: 8 }, (_, i) => ({
        week: i + 1,
        theme: `Week ${i + 1} — Foundation ${i + 1}`,
        goal: `Complete foundational learning for week ${i + 1}.`,
        topics: ['Topic A', 'Topic B', 'Topic C'],
        dailyBreakdown: Array.from({ length: 5 }, (_, d) => ({
          day: d + 1,
          task: `Day ${d + 1} task for week ${i + 1}`,
          estimatedHours: 2,
        })),
        milestone: `Build a small project for week ${i + 1}`,
        practiceInterview: i === 3 || i === 7,
      })),
      keySkillsToLearn: ['Core Skill 1', 'Core Skill 2', 'Core Skill 3'],
      estimatedReadinessDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      aiSummary: `This is a mock 8-week roadmap for ${profileInput.name} targeting the role of ${profileInput.desiredRole}. AI service was unavailable during generation.`,
    };

    const roadmapData = await this.callAI<GeneratedRoadmap>(prompt, mockRoadmap);

    // Persist to DB
    const doc = await RoadmapProfile.create({
      userId,
      profile: profileInput,
      targetRole: roadmapData.targetRole || profileInput.desiredRole,
      totalWeeks: roadmapData.totalWeeks,
      weeklyPlan: roadmapData.weeklyPlan,
      keySkillsToLearn: roadmapData.keySkillsToLearn,
      estimatedReadinessDate: roadmapData.estimatedReadinessDate,
      aiSummary: roadmapData.aiSummary,
    });

    return this.formatRoadmap(doc);
  }

  /**
   * Retrieves a stored roadmap by MongoDB _id (used as profileId on the client).
   */
  async getRoadmap(profileId: string) {
    const doc = await RoadmapProfile.findById(profileId);
    if (!doc) throw new Error('Roadmap not found');
    return this.formatRoadmap(doc);
  }

  /**
   * Updates the completed tasks map for a roadmap
   */
  async updateProgress(profileId: string, userId: string, completedTasks: Record<string, boolean>) {
    const doc = await RoadmapProfile.findOne({ _id: profileId, userId });
    if (!doc) throw new Error('Roadmap not found or unauthorized');

    // Convert plain object to Map for Mongoose
    doc.completedTasks = new Map(Object.entries(completedTasks));
    await doc.save();
    
    return this.formatRoadmap(doc);
  }

  private formatRoadmap(doc: any) {
    return {
      profileId: String(doc._id),
      targetRole: doc.targetRole,
      totalWeeks: doc.totalWeeks,
      weeklyPlan: doc.weeklyPlan,
      keySkillsToLearn: doc.keySkillsToLearn,
      estimatedReadinessDate: doc.estimatedReadinessDate,
      aiSummary: doc.aiSummary,
      completedTasks: doc.completedTasks ? Object.fromEntries(doc.completedTasks) : {},
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}

export default new RoadmapService();
