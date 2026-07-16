import { JobRole, ExperienceLevel, IQuestionScore } from '../models/index.js';

interface ReportInput {
  role: JobRole;
  experience: ExperienceLevel;
  questionScores: IQuestionScore[];
  questions: string[];
  answers: string[];
  averageFluency: number;
  totalDuration: number;
}

/**
 * Generates the prompt for creating the final interview report.
 * Gemini receives all question-level scores and generates a holistic summary.
 */
export function generateReportPrompt(input: ReportInput): string {
  const questionsAndAnswers = input.questions
    .map((q, i) => {
      const score = input.questionScores[i];
      return `Q${i + 1}: "${q}"
Answer: "${input.answers[i]}"
Scores: Technical=${score?.technicalAccuracy || 0}/10, Communication=${score?.communication || 0}/10, Completeness=${score?.completeness || 0}/10, Problem Solving=${score?.problemSolving || 0}/10, Fluency=${score?.fluencyScore || 0}/100`;
    })
    .join('\n\n');

  return `You are an expert interviewer generating a final interview report.

Role: ${input.role}
Experience Level: ${input.experience}
Total Interview Duration: ${Math.round(input.totalDuration / 60)} minutes
Average Speech Fluency: ${input.averageFluency}/100

Questions, Answers, and Per-Question Scores:
${questionsAndAnswers}

Based on all the data above, generate a comprehensive final interview report.

Calculate the overall scores as weighted averages:
- Overall Technical Score: Average of all technicalAccuracy scores, scaled to 0-100
- Communication Score: Average of all communication scores, scaled to 0-100

Provide:
1. Overall strengths across all answers
2. Overall weaknesses across all answers
3. Specific topics the candidate should study and improve
4. Recommended practice areas (resources, exercises, projects)
5. Interview readiness level: "Ready", "Almost Ready", "Needs Practice", or "Needs Significant Improvement"
6. A detailed, encouraging narrative summary (3-5 sentences) that captures the overall interview performance

Respond with ONLY valid JSON in this exact format, no other text:
{
  "overallTechnicalScore": 72,
  "communicationScore": 68,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "topicsToImprove": ["topic 1", "topic 2", "topic 3"],
  "practiceAreas": ["area 1", "area 2", "area 3"],
  "interviewReadiness": "Almost Ready",
  "aiSummary": "Detailed narrative summary here..."
}`;
}
