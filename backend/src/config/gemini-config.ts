/* import * as dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

class MockGoogleGenerativeAI {
  constructor(config: { apiKey: string; projectId?: string }) {
    console.log("Configured with:", config);
  }
}

export const configureGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables");
  }

  return new MockGoogleGenerativeAI({
    apiKey,
    projectId: process.env.GEMINI_PROJECT_ID || "",
  });
};
 */
import * as dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

export const configureGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables");
  }

  return new GoogleGenerativeAI(apiKey); // Use the official GoogleGenerativeAI client
};
