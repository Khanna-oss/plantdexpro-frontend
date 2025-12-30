
import { GoogleGenAI, Type } from "@google/genai";
import { validateNutritionAI } from "../utils/validateNutritionAI.js";
import { aiConfidenceService } from "./aiConfidenceService.js";

const API_KEY = process.env.API_KEY || '';

const CACHE_KEY_PREFIX = 'plantdex_hp_v5_';

export const healthProfileService = {
  getProfile: async (commonName, scientificName, isEdible) => {
    if (!scientificName || !isEdible) return null;
    
    const cacheKey = `${CACHE_KEY_PREFIX}${scientificName.toLowerCase().replace(/\s/g, '_')}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (validateNutritionAI(parsed)) return parsed;
      } catch (e) { localStorage.removeItem(cacheKey); }
    }

    if (!API_KEY) return null;
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const profileSchema = {
      type: Type.OBJECT,
      properties: {
        nutrients: {
          type: Type.OBJECT,
          properties: {
            vitamins: { type: Type.STRING },
            minerals: { type: Type.STRING },
            proteins: { type: Type.STRING }
          },
          required: ["vitamins", "minerals"]
        },
        healthHints: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              desc: { type: Type.STRING }
            }
          }
        },
        specificUsage: { type: Type.STRING }
      },
      required: ["nutrients", "healthHints", "specificUsage"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Research task for ${scientificName} (${commonName}):
        1. Identify specific vitamins present (e.g. "Vitamin C, B-complex").
        2. Identify specific minerals (e.g. "Iron, Potassium").
        3. Provide 3 factual health observations.
        4. Detail a standard preparation method.
        MANDATORY: Do not use placeholder phrases like "Tracing" or "Unknown". Use established botanical science.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: profileSchema,
          temperature: 0.1
        }
      });

      const text = response.text || "{}";
      const data = JSON.parse(text);
      const validData = validateNutritionAI(data);

      if (validData) {
        validData.confidence = aiConfidenceService.calculateScore(0.98, 1.0, 'llm');
        localStorage.setItem(cacheKey, JSON.stringify(validData));
        return validData;
      }
      return null;
    } catch (error) {
      console.error("Health Profile Generation Failed:", error);
      return null;
    }
  }
};
