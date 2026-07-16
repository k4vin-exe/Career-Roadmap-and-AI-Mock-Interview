import { JobRole, ExperienceLevel } from '../models/index.js';

/**
 * A pool of question framings to vary the phrasing so they never feel robotic or repeated.
 * A random subset is injected into the prompt to nudge the LLM.
 */
const STYLE_HINTS = [
  "Ask it casually like a senior colleague, not like reading from a script.",
  "Open the question with a brief real-world context before asking.",
  "Use 'walk me through', 'tell me about', or 'how would you approach' phrasing.",
  "Start the question with a concise scenario, then ask the specific thing.",
  "Make the behavioral question very specific — ask about a real past situation.",
  "For the scenario question, describe a concrete business or engineering problem.",
  "Avoid starting any question with 'Can you explain' or 'What is the'.",
];

function pickHints(n: number): string {
  const shuffled = [...STYLE_HINTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).join('\n- ');
}

/**
 * Generates the prompt for creating interview questions.
 * Uses a high-variety, conversational framing to prevent repetition.
 */
export function generateQuestionPrompt(role: JobRole, experience: ExperienceLevel): string {
  const hints = pickHints(4);
  const seed = Math.floor(Math.random() * 9999); // Forces LLM to consider it a "fresh" request

  return `You are a friendly but sharp senior ${role} interviewer at a top tech company. You are conducting a live voice interview with a ${experience.toLowerCase()} candidate.

Your personality: direct, curious, warm. You ask questions that feel natural — like a real conversation, not a quiz.

Generate exactly 5 interview questions. SEED:${seed}

Progression:
1. Easy warm-up — fundamental concept for ${role}
2. Easy-Medium — slightly deeper technical follow-up
3. Medium — requires genuine understanding + practical knowledge
4. Scenario-based — a realistic engineering/product problem for a ${role}
5. Behavioral — a past-experience question relevant to a ${role} role

Strict rules:
- Every question MUST be specific to the ${role} role
- Difficulty MUST match ${experience.toLowerCase()} level
- Questions must sound like a REAL person talking — natural, conversational phrasing
- NO two questions can start the same way
- Do NOT use: "Can you explain", "What is", "Define", "Tell me what" — vary it
- Style hints for this batch:
  - ${hints}
- Do NOT include numbering in the question text
- Each question should be a single complete sentence, 15-35 words

Respond with ONLY valid JSON, no other text:
{
  "questions": [
    {
      "index": 1,
      "text": "question text here",
      "difficulty": "Easy",
      "type": "Technical",
      "category": "specific topic"
    },
    {
      "index": 2,
      "text": "question text here",
      "difficulty": "Easy-Medium",
      "type": "Technical",
      "category": "specific topic"
    },
    {
      "index": 3,
      "text": "question text here",
      "difficulty": "Medium",
      "type": "Technical",
      "category": "specific topic"
    },
    {
      "index": 4,
      "text": "question text here",
      "difficulty": "Scenario Based",
      "type": "Scenario",
      "category": "specific topic"
    },
    {
      "index": 5,
      "text": "question text here",
      "difficulty": "Behavioral",
      "type": "Behavioral",
      "category": "specific topic"
    }
  ]
}`;
}
