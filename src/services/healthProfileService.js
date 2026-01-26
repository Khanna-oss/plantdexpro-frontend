import { GoogleGenAI, Type } from "@google/genai";
import { aiConfidenceService } from "./aiConfidenceService.js";

const API_KEY = process.env.API_KEY || '';
const CACHE_KEY_PREFIX = 'plantdex_hp_v11_';

const _validateNutrition = (data) => {
  if (!data || typeof data !== 'object') return null;
  const { nutrients } = data;
  if (!nutrients || (!nutrients.vitamins && !nutrients.minerals)) return null;
  const text = JSON.stringify(data).toLowerCase();
  // Strictly reject common AI placeholders
  if (text.includes("tracing") || text.includes("placeholder") || text.includes("unknown")) return null;
  return data;
};

export const healthProfileService = {
  getProfile: async (commonName, scientificName, isEdible) => {
    if (!scientificName || !isEdible) return null;
    
    const cacheKey = `${CACHE_KEY_PREFIX}${scientificName.toLowerCase().replace(/\s/g, '_')}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (_validateNutrition(parsed)) return parsed;
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
        benefitChips: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        specificUsage: { type: Type.STRING }
      },
      required: ["nutrients", "healthHints", "specificUsage", "benefitChips"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Biochemical and Pharmacognosy analysis for ${scientificName} (${commonName}).
        1. VITAMINS: List specific vitamins (e.g. A, B-Complex, C, E).
        2. MINERALS: List specific minerals (e.g. Iron, Potassium, Magnesium).
        3. HEALTH HINTS: 3 clinical/traditional therapeutic observations.
        4. BENEFIT CHIPS: 4 short tags (e.g. "Antioxidant", "Iron Rich").
        5. PREPARATION: Detailed culinary/medicinal steps.
        MANDATORY: Provide scientific compounds. DO NOT use "Tracing" or placeholders.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: profileSchema,
          temperature: 0.1
        }
      });

      const data = JSON.parse(response.text || "{}");
      const validData = _validateNutrition(data);

      if (validData) {
        validData.confidence = aiConfidenceService.calculateScore(0.98, 1.0, 'llm');
        localStorage.setItem(cacheKey, JSON.stringify(validData));
        return validData;
      }
      return null;
    } catch (error) {
      console.error("Health Profile Error:", error);
      return null;
    }
  }
};