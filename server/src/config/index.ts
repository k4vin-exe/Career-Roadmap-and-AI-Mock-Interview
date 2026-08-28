import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  geminiApiKey: string;
  groqApiKey: string;
  clientUrl: string;
  jwtSecret: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-mock-interview',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-for-development-only',
};

// Validate critical environment variables (need at least one AI key)
export function validateEnv(): void {
  const hasGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  const hasGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';

  if (!hasGemini && !hasGroq) {
    console.warn(
      `⚠️  Missing both GEMINI_API_KEY and GROQ_API_KEY environment variables.\n` +
      `   Please provide at least one AI key in your .env file to enable full AI capability.`
    );
  }
}

export default config;
