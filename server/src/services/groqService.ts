import { Groq, toFile } from 'groq-sdk';
import config from '../config/index.js';
import fs from 'fs';
import path from 'path';

/**
 * GroqService — Singleton wrapper around Groq Cloud SDK.
 * Serves as an OpenAI-compatible fast fallback/alternative for Gemini.
 */
class GroqService {
  private groq: Groq | null = null;
  private static instance: GroqService;
  private defaultModel = 'llama-3.3-70b-versatile';
  private fallbackModels = ['openai/gpt-oss-20b', 'qwen/qwen3.6-27b'];

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
  async generateJSON<T>(prompt: string, maxRetries = 2): Promise<T> {
    if (!this.groq) {
      throw new Error('Groq API Key not configured. Cannot perform request.');
    }

    const modelsToTry = [this.defaultModel, ...this.fallbackModels];
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🤖 Groq: trying model ${model} (attempt ${attempt}/${maxRetries})...`);
          const response = await this.groq.chat.completions.create({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert system. Output answers ONLY as valid JSON. No explanations, no markdown, just raw JSON.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000,
          });

          const text = response.choices[0]?.message?.content;
          if (!text) {
            throw new Error('Groq returned an empty response.');
          }

          // Clean up and parse JSON (handle potential markdown wrappers)
          const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          return JSON.parse(cleaned) as T;
        } catch (error: any) {
          lastError = error as Error;
          // If model doesn't exist, stop retrying this model immediately
          if (error?.status === 404 || error?.error?.code === 'model_not_found') {
            console.warn(`⚠️  Groq: model ${model} not found, trying next...`);
            break;
          }
          console.error(`Groq attempt ${attempt}/${maxRetries} with ${model} failed:`, lastError.message);
          if (attempt < maxRetries) {
            await this.delay(Math.pow(2, attempt - 1) * 1000);
          }
        }
      }
    }

    throw new Error(`Groq API failed with all models: ${lastError?.message}`);
  }

  /**
   * Transcribes audio using Groq's whisper-large-v3 model.
   * @param readStream A ReadStream or Blob/File containing the audio data.
   */
  async transcribeAudio(filePath: string): Promise<string> {
    if (!this.groq) {
      throw new Error('Groq API Key not configured. Cannot perform request.');
    }

    try {
      console.log('🎙️ Groq: transcribing audio using whisper-large-v3...');
      const filename = path.basename(filePath);
      const fileStream = fs.createReadStream(filePath);
      // Wrap using toFile so Groq SDK sets the correct Content-Disposition / MIME type
      const groqFile = await toFile(fileStream, filename, { type: 'audio/webm' });
      const transcription = await this.groq.audio.transcriptions.create({
        file: groqFile,
        model: 'whisper-large-v3',
        response_format: 'json',
      });
      console.log('✅ Transcription complete:', transcription.text);
      return transcription.text;
    } catch (error: any) {
      console.error('Groq audio transcription failed:', error.message, error?.error);
      throw new Error(`Groq Transcription API failed: ${error.message}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default GroqService;
