import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  geminiApiKey: string;
  clientUrl: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-mock-interview',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

// Validate critical environment variables
const requiredVars = ['GEMINI_API_KEY'] as const;

export function validateEnv(): void {
  const missing = requiredVars.filter(
    (key) => !process.env[key] || process.env[key] === `your_${key.toLowerCase()}_here`
  );

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing or placeholder environment variables: ${missing.join(', ')}\n` +
      `   Copy .env.example to .env and fill in your values.`
    );
  }
}

export default config;
