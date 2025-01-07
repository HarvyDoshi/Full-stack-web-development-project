import * as dotenv from "dotenv";
dotenv.config();

export const configureGemini = () => {
  const apiKey = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCMWGAVa0YG2RE2K77sTB7XhOrxmVQ5YoU`;
  if (!apiKey) {
    console.warn("GOOGLE_API_KEY is not defined. Gemini API will be skipped.");
    return null;
  }

  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
  } catch (error) {
    console.error("Error initializing GoogleGenerativeAI:", error);
    console.warn("Falling back to mock Gemini API response.");
    return null;
  }
}; 
