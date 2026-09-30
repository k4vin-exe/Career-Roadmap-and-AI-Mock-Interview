import { RoadmapProfile } from '../models/RoadmapProfile.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

class RoadmapService {
  /**
   * Generates a personalized roadmap using our local curated JSON dataset,
   * stores it in MongoDB, and returns the full roadmap.
   */
  async generateRoadmap(userId: string, profileInput: UserProfileInput) {
    const roadmapsPath = path.resolve(__dirname, '../data/roadmaps.json');
    let localData: any = {};
    if (fs.existsSync(roadmapsPath)) {
      localData = JSON.parse(fs.readFileSync(roadmapsPath, 'utf-8'));
    }

    // Match role (fallback to Frontend Developer if not found in db)
    const roleKey = localData[profileInput.desiredRole] ? profileInput.desiredRole : 'Frontend Developer';
    
    // Parse experience to Beginner/Intermediate/Experienced
    let expKey = 'Beginner';
    const expLower = profileInput.workExperience.toLowerCase();
    if (expLower.includes('2') || expLower.includes('3') || expLower.includes('4')) expKey = 'Intermediate';
    if (expLower.includes('5') || expLower.includes('6') || expLower.includes('experienced') || expLower.includes('senior')) expKey = 'Experienced';

    const fallbackData = localData[roleKey]?.[expKey] || [];
    
    // Map JSON to the WeeklyPlan schema.
    // The githubRoadmapScraper already formats the JSON directly into the WeeklyPlan schema!
    const weeklyPlan = fallbackData.map((item: any, i: number) => {
      return {
        week: item.week || i + 1,
        theme: item.theme || `Week ${i + 1}`,
        goal: item.goal || 'Master the topics.',
        topics: item.topics || [],
        resources: item.resources || [],
        dailyBreakdown: item.dailyBreakdown || [],
        milestone: item.milestone || 'Complete the week.',
        practiceInterview: item.practiceInterview || false
      };
    });

    // If dataset is missing or empty, provide a single generic week so UI doesn't crash
    if (weeklyPlan.length === 0) {
      weeklyPlan.push({
        week: 1,
        theme: 'Week 1 — Fundamentals',
        goal: 'Core concepts.',
        topics: [profileInput.desiredRole],
        resources: [],
        dailyBreakdown: [{ day: 1, task: 'Getting started', estimatedHours: 2 }],
        milestone: 'Complete setup',
        practiceInterview: false
      });
    }

    const totalWeeks = weeklyPlan.length;

    // Persist to DB
    const doc = await RoadmapProfile.create({
      userId,
      profile: profileInput,
      targetRole: profileInput.desiredRole,
      totalWeeks,
      weeklyPlan,
      keySkillsToLearn: [profileInput.desiredRole, 'System Architecture', 'Best Practices'],
      estimatedReadinessDate: new Date(Date.now() + totalWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      aiSummary: `System-generated highly-structured roadmap for ${profileInput.name} targeting ${profileInput.desiredRole}. Features curated real-world resources and milestones instead of AI hallucination.`,
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

    doc.completedTasks = new Map(Object.entries(completedTasks));
    await doc.save();
    
    return this.formatRoadmap(doc);
  }

  private formatRoadmap(doc: any) {
    return {
      profileId: String(doc._id),
      profile: doc.profile,
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
