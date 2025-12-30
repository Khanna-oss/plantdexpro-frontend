
import { GoogleGenAI, Type } from "@google/genai";
import { validateNutritionAI } from "../utils/validateNutritionAI";
import { aiConfidenceService } from "./aiConfidenceService";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

const CACHE_KEY_PREFIX = 'plantdex_hp_v2_';

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
        contents: `Provide an extremely specific nutritional profile for ${scientificName}. Focus on verified data. If unknown, say 'Data Unconfirmed'. Avoid generic phrases.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: profileSchema,
          temperature: 0.1
        }
      });

      const data = JSON.parse(response.text || "{}");
      const validData = validateNutritionAI(data);

      if (validData) {
        validData.confidence = aiConfidenceService.calculateScore(0.9, 1.0, 'llm');
        localStorage.setItem(cacheKey, JSON.stringify(validData));
        return validData;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};
