import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';

/**
 * GeminiService — Singleton wrapper around Google Generative AI SDK.
 * All AI calls go through this service for consistent error handling and retries.
 */
class GeminiService {
  private model;
  private static instance: GeminiService;

  private constructor() {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Sends a prompt to Gemini and parses the JSON response.
   * Includes retry logic for transient failures.
   */
  async generateJSON<T>(prompt: string, maxRetries = 3): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response (handle markdown code blocks)
        const jsonStr = this.extractJSON(text);
        return JSON.parse(jsonStr) as T;
      } catch (error) {
        lastError = error as Error;

        console.error(`Gemini attempt ${attempt}/${maxRetries} failed:`, lastError.message);

        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          await this.delay(Math.pow(2, attempt - 1) * 1000);
        }
      }
    }

    throw new Error(`Gemini API failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Extracts JSON string from Gemini response, handling markdown code blocks.
   */
  private extractJSON(text: string): string {
    // Try to extract from ```json ... ``` blocks
    const jsonBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      return jsonBlockMatch[1].trim();
    }

    // Try to find raw JSON object
    const jsonObjMatch = text.match(/\{[\s\S]*\}/);
    if (jsonObjMatch) {
      return jsonObjMatch[0];
    }

    throw new Error('No valid JSON found in Gemini response');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default GeminiService;
