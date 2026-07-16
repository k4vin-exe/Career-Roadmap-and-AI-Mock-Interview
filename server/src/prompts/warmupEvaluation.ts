import { JobRole, ExperienceLevel } from '../models/index.js';

/**
 * Generates a prompt that evaluates the candidate's self-introduction.
 * This is NOT a technical evaluation — it focuses on:
 *  - Communication clarity
 *  - Confidence & presence
 *  - Background relevance for the target role
 *  - Structure of self-introduction
 */
export function generateWarmupEvaluationPrompt(
  name: string,
  role: JobRole,
  experience: ExperienceLevel,
  transcript: string,
  totalWords: number,
  fluencyScore: number
): string {
  return `You are a warm, experienced ${role} hiring manager conducting the start of an interview.

The candidate, ${name}, is applying for a ${role} position at ${experience.toLowerCase()} level.

They have just given their self-introduction. Your job is to:
1. Evaluate their self-introduction kindly but honestly
2. Generate a natural, human follow-up transition message to begin the technical interview

Candidate's self-introduction:
"${transcript}"

Pre-calculated speech metrics (do NOT recalculate):
- Total Words: ${totalWords}
- Fluency Score: ${fluencyScore}/100

Evaluate on these dimensions (score 0-100):
- communicationClarity: How clearly they expressed themselves
- confidencePresence: How confident and composed they sounded
- backgroundRelevance: How relevant their background is to the ${role} role
- structureCoherence: How well-structured and coherent the introduction was

Also provide:
- highlights: 2-3 specific positive things you noticed (be specific, not generic)
- suggestions: 1-2 brief actionable suggestions for their self-intro (keep it encouraging)
- transitionMessage: A NATURAL, warm 2-sentence message that:
    * Briefly acknowledges something specific they said (don't just say "great!")
    * Naturally transitions: "Now let's get into the interview..."
    * Must sound like a REAL human interviewer, not a bot
    * Example style: "I liked hearing about your work with React at your last company — that's very relevant to what we do here. Let's jump into some technical questions and see how you approach problems."

Respond with ONLY valid JSON, no other text:
{
  "communicationClarity": 75,
  "confidencePresence": 70,
  "backgroundRelevance": 80,
  "structureCoherence": 65,
  "highlights": ["specific highlight 1", "specific highlight 2"],
  "suggestions": ["brief suggestion 1"],
  "transitionMessage": "Natural transition sentence here. Let's move on to the technical part of the interview."
}`;
}
