import GroqService from './src/services/groqService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testGroq() {
  console.log("=== Testing Groq Connection ===");
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ GROQ_API_KEY is not defined in .env");
    console.log("Please get a free key from https://console.groq.com and add it to your .env file.");
    return;
  }

  console.log("Found GROQ_API_KEY in .env");
  const groqService = GroqService.getInstance();
  
  try {
    console.log("Sending structured test completion to llama-3.3-70b-versatile...");
    const result = await groqService.generateJSON<{ greeting: string, success: boolean }>(
      "Respond with a JSON object containing a 'greeting' property saying hello and a 'success' property set to true."
    );
    console.log("\n✅ SUCCESS! Response object:");
    console.log(result);
  } catch (error: any) {
    console.error("\n❌ FAILED to connect to Groq:");
    console.error(error.message);
  }
}

testGroq();
