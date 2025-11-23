
import { GoogleGenAI } from "@google/genai";
import { ModelType } from "../types";
import { MODEL_CONFIGS, DEFAULT_SYSTEM_PROMPT } from "../constants";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a full game based on a prompt using the Thinking Model (Gemini 3 Pro)
 */
export const generateGame = async (prompt: string, context?: string): Promise<string> => {
  try {
    const fullPrompt = `
      ${DEFAULT_SYSTEM_PROMPT}
      
      USER REQUEST: ${prompt}
      
      ${context ? `EXISTING CODE (Refine this): ${context}` : ''}
      
      INSTRUCTIONS:
      Generate the complete index.html file code now. 
      Ensure all Three.js imports use ES modules from 'https://esm.sh/three'.
      Do not include explanations, just the code inside a markdown block.
    `;

    const response = await ai.models.generateContent({
      model: ModelType.GENERATOR,
      contents: fullPrompt,
      config: MODEL_CONFIGS[ModelType.GENERATOR],
    });

    const text = response.text || "";
    return extractCodeBlock(text);
  } catch (error) {
    console.error("Game Generation Error:", error);
    throw new Error("Failed to generate game logic. Please try again.");
  }
};

/**
 * Uses Flash Lite for quick explanations or simple edits logic
 */
export const quickAssist = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: ModelType.FAST_ASSIST,
      contents: `You are a helper for a Game Engine. Answer briefly. Query: ${query}`,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Quick Assist Error:", error);
    return "AI system is currently busy.";
  }
};

/**
 * Uses Google Search Grounding to research topics for games
 */
export const researchTopic = async (topic: string): Promise<{ text: string; sources: string[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: ModelType.RESEARCHER,
      contents: `Research this topic to help design a game: ${topic}. Focus on key visual elements, physics rules, or mechanics relevant to a video game.`,
      config: MODEL_CONFIGS[ModelType.RESEARCHER],
    });

    const text = response.text || "";
    
    // Safely extract sources with strict type checking
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((c: any) => c.web?.uri)
      .filter((u: any): u is string => typeof u === 'string') || [];

    return { text, sources };
  } catch (error) {
    console.error("Research Error:", error);
    return { text: "Could not perform research at this time.", sources: [] };
  }
};

/**
 * Helper to strip markdown code fences if present
 */
const extractCodeBlock = (text: string): string => {
  const codeBlockRegex = /```html([\s\S]*?)```/i;
  const match = text.match(codeBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  // If no html block, look for just generic code block
  const genericBlockRegex = /```([\s\S]*?)```/i;
  const matchGeneric = text.match(genericBlockRegex);
  if (matchGeneric && matchGeneric[1]) {
    return matchGeneric[1].trim();
  }
  
  return text;
};
