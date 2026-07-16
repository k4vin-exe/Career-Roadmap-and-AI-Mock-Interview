import { JobRole, ExperienceLevel } from '../models/index.js';

/**
 * Generates the prompt for creating interview questions.
 * Questions follow a specific difficulty progression:
 * Q1: Easy, Q2: Easy-Medium, Q3: Medium, Q4: Scenario Based, Q5: Behavioral
 */
export function generateQuestionPrompt(role: JobRole, experience: ExperienceLevel): string {
  return `You are an expert technical interviewer conducting an interview for a ${role} position.
The candidate has ${experience.toLowerCase()} level experience.

Generate exactly 5 interview questions following this strict difficulty progression:

Question 1: Easy - A fundamental concept question for ${role}
Question 2: Easy-Medium - A slightly deeper technical question
Question 3: Medium - A question requiring solid understanding and practical knowledge
Question 4: Scenario Based - A real-world scenario or problem-solving question relevant to ${role}
Question 5: Behavioral - A behavioral/soft-skill question relevant to a ${role} role

Rules:
- Questions MUST be specific to the ${role} role
- Questions MUST be appropriate for ${experience.toLowerCase()} level
- Each question should be clear, concise, and professional
- Do NOT include answers
- Do NOT include numbering in the question text itself

Respond with ONLY valid JSON in this exact format, no other text:
{
  "questions": [
    {
      "index": 1,
      "text": "question text here",
      "difficulty": "Easy",
      "type": "Technical",
      "category": "specific topic category"
    },
    {
      "index": 2,
      "text": "question text here",
      "difficulty": "Easy-Medium",
      "type": "Technical",
      "category": "specific topic category"
    },
    {
      "index": 3,
      "text": "question text here",
      "difficulty": "Medium",
      "type": "Technical",
      "category": "specific topic category"
    },
    {
      "index": 4,
      "text": "question text here",
      "difficulty": "Scenario Based",
      "type": "Scenario",
      "category": "specific topic category"
    },
    {
      "index": 5,
      "text": "question text here",
      "difficulty": "Behavioral",
      "type": "Behavioral",
      "category": "specific topic category"
    }
  ]
}`;
}
