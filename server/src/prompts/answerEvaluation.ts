import { JobRole, ExperienceLevel } from '../models/index.js';

interface SpeechMetrics {
  repeatedWords: number;
  fillerWords: number;
  fillerList?: string[];
  fluencyScore: number;
  totalWords: number;
  durationSeconds?: number;
  wpm?: number;
}

/**
 * Generates the prompt for evaluating a candidate's spoken answer.
 * Includes both technical depth and spoken communication delivery metrics.
 */
export function generateAnswerEvaluationPrompt(
  question: string,
  answer: string,
  role: JobRole,
  experience: ExperienceLevel,
  metrics: SpeechMetrics
): string {
  const pacingDesc = metrics.wpm 
    ? `${metrics.wpm} WPM (${metrics.wpm >= 110 && metrics.wpm <= 165 ? 'Optimal conversation pace' : metrics.wpm < 110 ? 'Slow / Hesitant' : 'Fast / Rushed'})` 
    : 'Not measured';
  const fillers = metrics.fillerList && metrics.fillerList.length > 0 
    ? metrics.fillerList.join(', ') 
    : (metrics.fillerWords > 0 ? `${metrics.fillerWords} detected` : 'None detected');

  return `You are a Principal Engineering Interviewer at a top tier technology company evaluating a candidate's spoken response.

Role: ${role}
Target Level: ${experience}

Question Asked:
"${question}"

Candidate's Spoken Answer (transcribed via speech recognition):
"${answer ? answer.trim() : '(No answer recorded)'}"

Candidate's Speech Delivery Metrics:
- Total Words: ${metrics.totalWords}
- Duration: ${metrics.durationSeconds ? `${metrics.durationSeconds}s` : 'N/A'}
- Speaking Pace: ${pacingDesc}
- Filler Words: ${fillers} (Count: ${metrics.fillerWords})
- Fluency Score: ${metrics.fluencyScore}/100

Instructions for Evaluation:
1. TECHNICAL ACCURACY (0-10): Evaluate architectural correctness, precision of technical terms, handling of real-world edge cases, and engineering trade-offs appropriate for a ${experience.toLowerCase()} ${role}.
2. COMMUNICATION (0-10): Assess clarity, executive presence, articulation, and conciseness. Penalize vague hand-waving or disjointed thoughts.
3. COMPLETENESS (0-10): Did the candidate answer the exact question directly, or did they miss core facets?
4. PROBLEM SOLVING (0-10): Ability to break down the problem methodically, reason from first principles, and propose practical solutions.
5. DELIVERY SCORE (0-10): Spoken delivery quality based on the speech metrics (fluency, lack of hesitation/fillers, pacing).
6. PACING FEEDBACK: 1-2 constructive sentences on their speaking speed and rhythm.
7. FILLER FEEDBACK: 1-2 sentences on how their verbal filler habits impacted confidence, and advice on pausing silently instead.
8. STRUCTURE FEEDBACK: Comment on how they structured the answer (e.g. STAR method for behavioral/scenario questions, or Definition -> Mechanism -> Trade-offs for technical questions).
9. STRENGTHS: 2-3 specific points the candidate stated accurately or articulated well.
10. WEAKNESSES: 2-3 specific technical gaps, omissions, or structural flaws.
11. MISSING CONCEPTS: 2-4 crucial industry terms, tools, design patterns, or considerations that a high-performing ${role} should have mentioned.
12. IDEAL ANSWER: A comprehensive, polished, conversational model answer (2-3 paragraphs) demonstrating how a senior candidate would speak this answer aloud naturally and authoritatively.
13. SUGGESTIONS: 2-3 actionable, high-impact tips for their next interview.
14. ENCOURAGING FEEDBACK: An uplifting, motivating closing remark recognizing their effort.

Scoring Scale:
- 0-3: Poor / Fundamental misunderstandings
- 4-5: Below Average / Vague or superficial
- 6-7: Good / Solid competence
- 8-9: Very Good / Clear hire
- 10: Exceptional / Staff level benchmark

Respond with ONLY valid JSON in this exact structure, with no markdown code blocks or additional text:
{
  "technicalAccuracy": 8,
  "communication": 7,
  "completeness": 7,
  "problemSolving": 8,
  "deliveryScore": 7,
  "pacingFeedback": "Speaking pace was well-controlled at ~130 WPM, making technical concepts easy to follow.",
  "fillerFeedback": "Minimal filler words used. Maintaining silent pauses instead of filler words will further boost your authority.",
  "structureFeedback": "Good direct definition. To elevate it further, conclude with production trade-offs or a real-world scenario.",
  "strengths": ["Clear explanation of core mechanics", "Accurate technical terminology"],
  "weaknesses": ["Did not mention scalability implications", "Overlooked failure recovery"],
  "missingConcepts": ["Connection pooling", "Idempotency", "Circuit breaker pattern"],
  "idealAnswer": "When approaching this problem, I prioritize three core areas...",
  "suggestions": ["Cite specific libraries or protocols you have used in production", "Frame your answer with a high-level overview before diving into details"],
  "encouragingFeedback": "Strong grasp of the foundational principles! With slightly more emphasis on system trade-offs, this would be an outstanding interview response."
}`;
}
