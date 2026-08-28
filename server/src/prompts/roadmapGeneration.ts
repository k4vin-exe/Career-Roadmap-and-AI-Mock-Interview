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
  const skillList = profile.skills.length > 0 ? profile.skills.join(', ') : 'None specified';
  const hasPG = profile.pgField && profile.pgField !== 'Not Applicable' && profile.pgField !== '';

  return `
You are an expert career coach and technical curriculum designer. Your job is to create a detailed, personalized, week-by-week career development roadmap for a candidate who wants to become a ${profile.desiredRole}.

## Candidate Profile
- **Name:** ${profile.name}
- **Work Experience:** ${profile.workExperience === '0' ? 'Fresher (No experience)' : profile.workExperience + ' years'}
- **Current / Last Role:** ${profile.currentRole || 'N/A'}
- **Existing Skills:** ${skillList}
- **UG Field of Study:** ${profile.ugField}
- **PG Field of Study:** ${hasPG ? profile.pgField : 'Not Applicable'}
- **About Them:** ${profile.bio || 'No bio provided'}
- **Target Role:** ${profile.desiredRole}

## Instructions
1. Analyze the gap between the candidate's current profile and what is needed for the target role: **${profile.desiredRole}**.
2. Build a realistic, week-by-week roadmap. Let the number of weeks be decided by the actual skill gap — it should be between 6 and 16 weeks. Do NOT artificially pad or compress.
3. Leverage established learning sequences (like those on roadmap.sh) for the target role. Cover the full stack of knowledge needed.
4. Each week must have 5 daily tasks (Monday–Friday). Each task should be concrete — not vague like "Learn JavaScript", but specific like "Learn JavaScript ES6 arrow functions, destructuring, and template literals (2 hrs)".
5. Mark weeks where it makes sense to practice a mock interview with "practiceInterview: true" — typically at the end of major learning phases.
6. Personalize around the candidate's existing skills — skip or compress topics they already know.
7. Give an "estimatedReadinessDate" that is realistic based on the week count (today is ${new Date().toISOString().split('T')[0]}).

## Output Format
Return ONLY valid JSON matching this exact schema. No explanation text, no markdown, just JSON:

\`\`\`json
{
  "targetRole": "${profile.desiredRole}",
  "totalWeeks": <number between 6–16>,
  "weeklyPlan": [
    {
      "week": 1,
      "theme": "<Week theme in 4-6 words>",
      "goal": "<One sentence describing what they will be able to do after this week>",
      "topics": ["<topic 1>", "<topic 2>", "<topic 3>"],
      "dailyBreakdown": [
        { "day": 1, "task": "<Specific task description>", "estimatedHours": 2 },
        { "day": 2, "task": "<Specific task description>", "estimatedHours": 2 },
        { "day": 3, "task": "<Specific task description>", "estimatedHours": 2 },
        { "day": 4, "task": "<Specific task description>", "estimatedHours": 2 },
        { "day": 5, "task": "<Specific task description>", "estimatedHours": 2 }
      ],
      "milestone": "<Tangible deliverable or project to build this week>",
      "practiceInterview": false
    }
  ],
  "keySkillsToLearn": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "estimatedReadinessDate": "<ISO date string: YYYY-MM-DD>",
  "aiSummary": "<2–3 sentence personalized summary explaining the roadmap logic for this candidate>"
}
\`\`\`

Make the roadmap motivating, achievable, and realistic. Each day should take 2–3 hours so it fits alongside a student's or working professional's schedule.
`.trim();
}
