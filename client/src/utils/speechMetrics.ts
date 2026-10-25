/**
 * Speech Metrics Utility — Application Logic
 *
 * These calculations are DETERMINISTIC and run entirely in the frontend.
 * Gemini NEVER computes these values — it only interprets them.
 */

// ──────────────────────────── Filler Words ────────────────────────────

export const FILLER_WORDS = [
  'um', 'uh', 'er', 'ah', 'actually', 'basically', 'like',
  'you know', 'hmm', 'well', 'sort of', 'kind of', 'i mean',
  'honestly', 'literally', 'right',
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

/**
 * Breaks a transcript down into segments with isFiller flags for visual highlighting.
 */
export function segmentTranscriptFillers(transcript: string): Array<{ text: string; isFiller: boolean }> {
  if (!transcript) return [];
  // Build a master regex matching any of the filler words/phrases
  const pattern = new RegExp(`\\b(${FILLER_WORDS.join('|')})\\b`, 'gi');
  const segments: Array<{ text: string; isFiller: boolean }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(transcript)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: transcript.substring(lastIndex, match.index), isFiller: false });
    }
    segments.push({ text: match[0], isFiller: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < transcript.length) {
    segments.push({ text: transcript.substring(lastIndex), isFiller: false });
  }

  return segments;
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
  const score = 100 - (fillerCount * 4) - (repeatedCount * 3);
  return Math.max(0, Math.min(100, score));
}

// ──────────────────────────── Word Count & Pacing ────────────────────────────

/**
 * Counts total words in the transcript.
 */
export function countWords(transcript: string): number {
  return transcript.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculates Words Per Minute and conversational pacing rating.
 */
export function calculatePacing(totalWords: number, durationSeconds: number): {
  wpm: number;
  pacingRating: 'Too Slow' | 'Optimal' | 'A Bit Fast' | 'Too Fast';
} {
  if (durationSeconds <= 5 || totalWords === 0) {
    return { wpm: 0, pacingRating: 'Optimal' };
  }

  const wpm = Math.round((totalWords / durationSeconds) * 60);

  if (wpm < 105) return { wpm, pacingRating: 'Too Slow' };
  if (wpm <= 165) return { wpm, pacingRating: 'Optimal' };
  if (wpm <= 190) return { wpm, pacingRating: 'A Bit Fast' };
  return { wpm, pacingRating: 'Too Fast' };
}

// ──────────────────────────── All Metrics ────────────────────────────

export interface SpeechMetricsResult {
  totalWords: number;
  fillerWords: string[];
  fillerWordCount: number;
  repeatedWords: string[];
  repeatedWordCount: number;
  fluencyScore: number;
  wordsPerMinute?: number;
  pacingRating?: string;
}

/**
 * Computes all speech metrics for a given transcript.
 * Single entry point for the complete analysis.
 */
export function computeSpeechMetrics(transcript: string, durationSeconds: number = 0): SpeechMetricsResult {
  const totalWords = countWords(transcript);
  const fillerWords = detectFillerWords(transcript);
  const repeatedWords = detectRepeatedWords(transcript);
  const fluencyScore = calculateFluencyScore(fillerWords.length, repeatedWords.length);
  const { wpm, pacingRating } = calculatePacing(totalWords, durationSeconds);

  return {
    totalWords,
    fillerWords,
    fillerWordCount: fillerWords.length,
    repeatedWords,
    repeatedWordCount: repeatedWords.length,
    fluencyScore,
    wordsPerMinute: wpm,
    pacingRating,
  };
}
