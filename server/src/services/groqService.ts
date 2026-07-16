import { Groq } from 'groq-sdk';
import config from '../config/index.js';

/**
 * GroqService — Singleton wrapper around Groq Cloud SDK.
 * Serves as an OpenAI-compatible fast fallback/alternative for Gemini.
 */
class GroqService {
  private groq: Groq | null = null;
  private static instance: GroqService;
  private defaultModel = 'llama-3.3-70b-versatile';

  private constructor() {
    if (config.groqApiKey) {
      this.groq = new Groq({ apiKey: config.groqApiKey });
    } else {
      console.warn('⚠️  Groq API Key is missing. GroqService will not be functional.');
    }
  }

  static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
  }

  /**
   * Generates content and parses JSON from the response.
   * Utilizes Groq's native json_object response format.
   */
  async generateJSON<T>(prompt: string, maxRetries = 3): Promise<T> {
    if (!this.groq) {
      throw new Error('Groq API Key not configured. Cannot perform request.');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.groq.chat.completions.create({
          model: this.defaultModel,
          messages: [
            {
              role: 'system',
              content: 'You are an expert system that output answers strictly in JSON format. Do not write explanations outside of JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          // Use higher temperature for question generation to ensure variety
          response_format: { type: 'json_object' },
          temperature: 0.85,
        });

        const text = response.choices[0]?.message?.content;
        if (!text) {
          throw new Error('Groq returned an empty response.');
        }

        // Parse directly
        return JSON.parse(text) as T;
      } catch (error) {
        lastError = error as Error;
        console.error(`Groq attempt ${attempt}/${maxRetries} failed:`, lastError.message);

        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          await this.delay(Math.pow(2, attempt - 1) * 1000);
        }
      }
    }

    throw new Error(`Groq API failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default GroqService;
