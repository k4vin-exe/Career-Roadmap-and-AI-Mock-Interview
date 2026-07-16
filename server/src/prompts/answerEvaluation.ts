import { JobRole, ExperienceLevel } from '../models/index.js';

interface SpeechMetrics {
  repeatedWords: number;
  fillerWords: number;
  fluencyScore: number;
  totalWords: number;
}

/**
 * Generates the prompt for evaluating a single answer.
 * Gemini receives the application-computed speech metrics for interpretation,
 * but NEVER calculates them itself.
 */
export function generateAnswerEvaluationPrompt(
  question: string,
  answer: string,
  role: JobRole,
  experience: ExperienceLevel,
  metrics: SpeechMetrics
): string {
  return `You are an expert technical interviewer evaluating a candidate's response.

Role: ${role}
Experience Level: ${experience}

Question Asked:
"${question}"

Candidate's Answer:
"${answer}"

Speech Metrics (calculated by the application — DO NOT recalculate these):
- Total Words: ${metrics.totalWords}
- Repeated Words: ${metrics.repeatedWords}
- Filler Words: ${metrics.fillerWords}
- Fluency Score: ${metrics.fluencyScore}/100

Instructions:
1. Evaluate the TECHNICAL ACCURACY of the answer for a ${experience.toLowerCase()} level ${role}
2. Assess COMMUNICATION quality — interpret the speech metrics provided above
3. Evaluate COMPLETENESS — did the candidate cover the key points?
4. Assess PROBLEM SOLVING ability shown in the answer
5. Provide specific STRENGTHS of the answer
6. Identify specific WEAKNESSES
7. List MISSING CONCEPTS the candidate should have mentioned
8. Provide an IDEAL ANSWER for comparison
9. Give actionable SUGGESTIONS for improvement
10. End with ENCOURAGING FEEDBACK to motivate the candidate

Scoring: Rate each category from 0-10 where:
- 0-3: Poor
- 4-5: Below Average
- 6-7: Good
- 8-9: Very Good
- 10: Excellent

Respond with ONLY valid JSON in this exact format, no other text:
{
  "technicalAccuracy": 7,
  "communication": 6,
  "completeness": 5,
  "problemSolving": 6,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "missingConcepts": ["concept 1", "concept 2"],
  "idealAnswer": "A comprehensive ideal answer here...",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "encouragingFeedback": "Encouraging message here..."
}`;
}
