/**
 * Speech Metrics Utility — Application Logic
 *
 * These calculations are DETERMINISTIC and run entirely in the frontend.
 * Gemini NEVER computes these values — it only interprets them.
 */

// ──────────────────────────── Filler Words ────────────────────────────

const FILLER_WORDS = [
  'um', 'uh', 'actually', 'basically', 'like',
  'you know', 'hmm', 'well', 'sort of', 'kind of',
];

/**
 * Detects filler words in the transcript.
 * Returns an array of detected filler words (with duplicates for each occurrence).
 */
export function detectFillerWords(transcript: string): string[] {
  const lowerTranscript = transcript.toLowerCase();
  const detected: string[] = [];

  for (const filler of FILLER_WORDS) {
    // Use regex to match whole word/phrase boundaries
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerTranscript.match(regex);
    if (matches) {
      detected.push(...matches.map(() => filler));
    }
  }

  return detected;
}

// ──────────────────────────── Repeated Words ────────────────────────────

/**
 * Detects consecutive repeated words in the transcript.
 * E.g., "I I", "the the", "React React"
 * Returns an array of the repeated word pairs.
 */
export function detectRepeatedWords(transcript: string): string[] {
  const words = transcript.toLowerCase().split(/\s+/).filter(Boolean);
  const repeated: string[] = [];

  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1] && words[i].length > 1) {
      repeated.push(`${words[i]} ${words[i]}`);
    }
  }

  return repeated;
}

// ──────────────────────────── Fluency Score ────────────────────────────

/**
 * Calculates the fluency score.
 * Formula: Start at 100, subtract 5 per filler word, subtract 3 per repeated word.
 * Clamped between 0 and 100.
 */
export function calculateFluencyScore(fillerCount: number, repeatedCount: number): number {
  const score = 100 - (fillerCount * 5) - (repeatedCount * 3);
  return Math.max(0, Math.min(100, score));
}

// ──────────────────────────── Word Count ────────────────────────────

/**
 * Counts total words in the transcript.
 */
export function countWords(transcript: string): number {
  return transcript.trim().split(/\s+/).filter(Boolean).length;
}

// ──────────────────────────── All Metrics ────────────────────────────

export interface SpeechMetricsResult {
  totalWords: number;
  fillerWords: string[];
  fillerWordCount: number;
  repeatedWords: string[];
  repeatedWordCount: number;
  fluencyScore: number;
}

/**
 * Computes all speech metrics for a given transcript.
 * Single entry point for the complete analysis.
 */
export function computeSpeechMetrics(transcript: string): SpeechMetricsResult {
  const totalWords = countWords(transcript);
  const fillerWords = detectFillerWords(transcript);
  const repeatedWords = detectRepeatedWords(transcript);
  const fluencyScore = calculateFluencyScore(fillerWords.length, repeatedWords.length);

  return {
    totalWords,
    fillerWords,
    fillerWordCount: fillerWords.length,
    repeatedWords,
    repeatedWordCount: repeatedWords.length,
    fluencyScore,
  };
}
