import { JobRole, ExperienceLevel } from '../models/index.js';
import { getCurriculumTopics, resolveRoleKey } from '../utils/roadmapTopics.js';

export interface LearningContext {
  topics?: string[];
  focusArea?: string;
  theme?: string;
  week?: number;
}

/**
 * Generates the prompt for creating interview questions.
 * Grounded directly in technical learning curriculum modules from roadmaps.json.
 * Strictly eliminates generic HR/behavioral questions in favor of rigorous technical inquiries.
 */
export function generateQuestionPrompt(
  role: JobRole,
  experience: ExperienceLevel,
  learningContext?: LearningContext
): string {
  // If specific topics/theme not supplied, pull authoritative curriculum from roadmaps.json
  const resolvedRole = resolveRoleKey(role);
  const curriculum = getCurriculumTopics(resolvedRole, experience, learningContext?.week);

  const activeTopics = (learningContext?.topics && learningContext.topics.length > 0)
    ? learningContext.topics
    : curriculum.topics;

  const activeTheme = learningContext?.theme || learningContext?.focusArea || curriculum.theme;
  const seed = Math.floor(Math.random() * 9999);

  const formattedTopics = activeTopics.map((t) => `  - ${t}`).join('\n');

  return `You are a Principal Technical Bar-Raiser and Senior ${resolvedRole} Engineer conducting a live technical voice interview with a ${experience.toLowerCase()} candidate.

==================================================
LEARNING CURRICULUM CONTEXT:
The candidate has completed intensive learning on the following curriculum module:
Theme: ${activeTheme}
Core Technical Learning Topics:
${formattedTopics}
==================================================

CRITICAL OBJECTIVE:
The candidate requested deep, realistic TECHNICAL questions directly testing the technical concepts they have learned.
DO NOT ASK GENERIC HR, BEHAVIORAL, OR TEXTBOOK DEFINITION QUESTIONS.

BANNED QUESTIONS (NEVER ASK THESE):
- DO NOT ask "Tell me about yourself" or "Walk me through your resume".
- DO NOT ask behavioral HR questions like "Tell me about a time you had a conflict with a coworker" or "What is your greatest weakness".
- DO NOT ask superficial definitions like "What is React?" or "Can you explain what an API is?".

REQUIRED 5-QUESTION TECHNICAL PROGRESSION:
Generate exactly 5 rigorous, practical technical questions testing the candidate's mastery of the learning topics above:

1. [Index 1: Core Technical Mechanics & Runtime]
   Ask about the internal mechanics or under-the-hood execution flow of one of the learned topics (e.g., memory layout, browser rendering phases, event loop ordering, OS thread pool, or protocol handshake).
   Difficulty: "Easy" (for Beginner) or "Easy-Medium" (for Intermediate/Experienced). Type: "Technical".

2. [Index 2: Implementation Mechanics & Code Construction]
   Ask how to practically architect, construct, or implement a specific feature using the learned topics, including handling tricky edge cases or avoiding common anti-patterns.
   Difficulty: "Easy-Medium" or "Medium". Type: "Technical".

3. [Index 3: Performance Optimization & Bottlenecks]
   Ask about diagnosing performance trade-offs, reducing memory overhead, eliminating latency, or handling scale/concurrency relevant to the learned topics.
   Difficulty: "Medium". Type: "Technical".

4. [Index 4: Real-world Production Incident & Debugging Challenge]
   Describe a realistic engineering bug, production incident, or unexpected failure mode related to these topics (e.g. race conditions, memory leaks, hydration mismatches, deadlocks, cascading re-renders). Ask how the candidate would systematically isolate, diagnose, and fix it.
   Difficulty: "Scenario Based". Type: "Scenario".

5. [Index 5: Advanced Technical Trade-offs & Architectural Decisions]
   Ask the candidate to compare two technical approaches, libraries, or architectural patterns relevant to the learning topics and defend their decision with technical trade-offs.
   Difficulty: "Medium". Type: "Technical".

STYLE RULES:
- Frame questions conversationally as a senior tech colleague would ask them in an on-site technical round.
- Avoid starting questions with "What is", "Can you define", or "Explain what". Use "How would you diagnose...", "Walk me through how...", "In what scenario would...", "How does the runtime handle...".
- Each question MUST be a single, complete sentence, between 18 and 38 words.
- Do NOT include numbering in the question text.
- SEED: ${seed}

Respond with ONLY valid JSON, no markdown formatting or extra text:
{
  "questions": [
    {
      "index": 1,
      "text": "question text here",
      "difficulty": "Easy-Medium",
      "type": "Technical",
      "category": "specific topic from learning"
    },
    {
      "index": 2,
      "text": "question text here",
      "difficulty": "Medium",
      "type": "Technical",
      "category": "specific topic from learning"
    },
    {
      "index": 3,
      "text": "question text here",
      "difficulty": "Medium",
      "type": "Technical",
      "category": "specific topic from learning"
    },
    {
      "index": 4,
      "text": "question text here",
      "difficulty": "Scenario Based",
      "type": "Scenario",
      "category": "specific topic from learning"
    },
    {
      "index": 5,
      "text": "question text here",
      "difficulty": "Medium",
      "type": "Technical",
      "category": "specific topic from learning"
    }
  ]
}`;
}
