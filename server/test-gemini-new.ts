import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

console.log("=== DIAGNOSTIC INFO ===");
console.log("Project:", process.env.GOOGLE_CLOUD_PROJECT || "Not provided in .env");
console.log("Model: gemini-2.5-flash");

try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log("SDK Version (@google/generative-ai):", packageJson.dependencies["@google/generative-ai"]);
  console.log("SDK Version (@google/genai):", packageJson.dependencies["@google/genai"]);
} catch (e) {
  console.log("SDK Version: Error reading package.json");
}

console.log("API Key Source: process.env.GEMINI_API_KEY");
console.log("=======================\n");

async function runTest() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }

  const modelName = 'gemini-2.0-flash';
  
  try {
    console.log(`Sending request to ${modelName} via @google/genai...`);
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Respond with exactly: Hello World"
    });
    
    console.log("\n✅ SUCCESS! Response:");
    console.log(response.text);
  } catch (error: any) {
    console.error("\n❌ FAILED. Full error object:");
    console.dir(error, { depth: null });
  }
}

runTest();
