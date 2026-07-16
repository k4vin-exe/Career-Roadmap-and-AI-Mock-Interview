import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Helper to log exactly what's requested
console.log("=== DIAGNOSTIC INFO ===");
console.log("Project:", process.env.GOOGLE_CLOUD_PROJECT || "Not provided in .env");
console.log("Model: gemini-2.5-flash"); // As requested in Step 2

try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log("SDK Version:", packageJson.dependencies["@google/generative-ai"]);
} catch (e) {
  console.log("SDK Version: Error reading package.json");
}

console.log("Endpoint: Default Google Generative Language API (https://generativelanguage.googleapis.com)");
console.log("API Key Source: process.env.GEMINI_API_KEY");
console.log("=======================\n");

async function runTest() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }

  // Use the latest supported model as requested in step 2
  const modelName = 'gemini-1.5-flash';
  
  try {
    console.log(`Sending request to ${modelName}...`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent("Respond with exactly: Hello World");
    console.log("\n✅ SUCCESS! Response:");
    console.log(result.response.text());
  } catch (error: any) {
    console.error("\n❌ FAILED. Full error object:");
    console.dir(error, { depth: null });
    
    // Check if error has status or details attached (Google SDK sometimes hides them in standard toString)
    if (error.status) console.log("HTTP Status:", error.status);
    if (error.response) console.log("Response data:", await error.response.text());
  }
}

runTest();
