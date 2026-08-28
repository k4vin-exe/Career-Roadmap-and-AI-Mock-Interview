/**
 * Roadmap Generation Prompt
 *
 * Generates a personalized week-by-week career roadmap using the candidate's
 * full profile. The AI decides the number of weeks based on experience gap.
 *
 * Reference: roadmap.sh topic trees are embedded as domain knowledge in the prompt.
 */

interface ProfileInput {
  name: string;
  workExperience: string;
  currentRole: string;
  skills: string[];
  ugField: string;
  pgField: string;
  bio: string;
  desiredRole: string;
}

export function generateRoadmapPrompt(profile: ProfileInput): string {
  const skillList = profile.skills.length > 0 ? profile.skills.join(', ') : 'None';
  const hasPG = profile.pgField && profile.pgField !== 'Not Applicable' && profile.pgField !== '';
  const exp = profile.workExperience === '0' ? 'Fresher' : `${profile.workExperience} years`;

  return `You are a career coach. Create a personalized week-by-week roadmap for this candidate.

Candidate: ${profile.name} | Target: ${profile.desiredRole} | Experience: ${exp}
Current Role: ${profile.currentRole || 'N/A'} | Skills: ${skillList}
Education: ${profile.ugField}${hasPG ? `, ${profile.pgField}` : ''} | Bio: ${profile.bio || 'N/A'}

Rules:
- Weeks: 6–12 based on skill gap (personalize, skip known topics)
- Each week: 5 daily tasks (specific, e.g. "Learn ES6 arrow functions (2hrs)", not vague)
- Mark weeks for mock interview practice with practiceInterview:true (typically after major milestones)
- estimatedReadinessDate: realistic from today ${new Date().toISOString().split('T')[0]}
- aiSummary: 2 sentences explaining the roadmap logic for this candidate

Return ONLY this JSON (no markdown, no explanation):
{
  "targetRole": "${profile.desiredRole}",
  "totalWeeks": <number 6-12>,
  "weeklyPlan": [
    {
      "week": 1,
      "theme": "<4-6 word theme>",
      "goal": "<one sentence outcome>",
      "topics": ["topic1", "topic2", "topic3"],
      "dailyBreakdown": [
        {"day":1,"task":"<specific task>","estimatedHours":2},
        {"day":2,"task":"<specific task>","estimatedHours":2},
        {"day":3,"task":"<specific task>","estimatedHours":2},
        {"day":4,"task":"<specific task>","estimatedHours":2},
        {"day":5,"task":"<specific task>","estimatedHours":2}
      ],
      "milestone": "<deliverable>",
      "practiceInterview": false
    }
  ],
  "keySkillsToLearn": ["skill1","skill2","skill3"],
  "estimatedReadinessDate": "YYYY-MM-DD",
  "aiSummary": "<2 sentence summary>"
}`.trim();
}

