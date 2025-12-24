import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_ID, SYSTEM_PROMPT } from "../constants";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

// Initialize the API client
const getAIClient = (): GoogleGenAI => {
  if (!genAI) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
      throw new Error("API Key not found");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

// Start a new chat session
export const startNewSession = async (): Promise<void> => {
  const ai = getAIClient();
  chatSession = ai.chats.create({
    model: GEMINI_MODEL_ID,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7, // Balanced creativity and structure
    },
  });
};

// Send a message to the active chat session
export const sendMessage = async (message: string): Promise<string> => {
  if (!chatSession) {
    await startNewSession();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    return response.text || "";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

// Helper to extract JSON from markdown code blocks if present
export const extractJsonFromResponse = (text: string): any | null => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse JSON from response", e);
      return null;
    }
  }
  return null;
};
