
import { GoogleGenAI, Type } from "@google/genai";
import { validateNutritionAI } from "../utils/validateNutritionAI.js";
import { aiConfidenceService } from "./aiConfidenceService.js";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

const CACHE_KEY_PREFIX = 'plantdex_hp_v3_';

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
        contents: `Provide a detailed nutritional and biochemical profile for ${scientificName} (${commonName}). 
        Be extremely specific. Mention actual vitamins (e.g., Vitamin C, K) and minerals (e.g., Magnesium, Iron). 
        Do not use vague marketing language like "very healthy" or "miracle plant". 
        Focus on culinary and medicinal properties backed by botanical science.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: profileSchema,
          temperature: 0.2
        }
      });

      const data = JSON.parse(response.text || "{}");
      const validData = validateNutritionAI(data);

      if (validData) {
        validData.confidence = aiConfidenceService.calculateScore(0.95, 1.0, 'llm');
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
