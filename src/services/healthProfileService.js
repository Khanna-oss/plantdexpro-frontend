
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

const CACHE_KEY_PREFIX = 'plantdex_health_profile_';

export const healthProfileService = {
  /**
   * Generates a plant-specific health profile.
   * Returns cached data if available for the scientific name.
   */
  getProfile: async (commonName, scientificName, isEdible) => {
    // 1. Validation & Cache Check
    if (!scientificName || !isEdible) return null;
    
    const cacheKey = `${CACHE_KEY_PREFIX}${scientificName.toLowerCase().replace(/\s/g, '_')}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) { localStorage.removeItem(cacheKey); }
    }

    if (!API_KEY) return null;

    // 2. Define Schema for Strict JSON
    const profileSchema = {
      type: Type.OBJECT,
      properties: {
        nutrients: {
          type: Type.OBJECT,
          properties: {
            vitamins: { type: Type.STRING, description: "Specific vitamins (e.g. 'A, C, K') or 'N/A'" },
            minerals: { type: Type.STRING, description: "Specific minerals (e.g. 'Iron, Potassium') or 'N/A'" },
            proteins: { type: Type.STRING, description: "Protein content description or 'N/A'" }
          }
        },
        healthHints: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, description: "Short benefit name (e.g. 'Anti-inflammatory')" },
              desc: { type: Type.STRING, description: "1 precise sentence on why THIS plant helps." }
            }
          }
        },
        specificUsage: { 
            type: Type.STRING, 
            description: "Real, traditional, or culinary usage instruction. (e.g. 'Steep dried leaves for 5 mins')." 
        }
      },
      required: ["nutrients", "healthHints", "specificUsage"]
    };

    try {
      // 3. Generate Content
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the plant "${scientificName}" (Common: ${commonName}). 
        Provide REAL, SCIENTIFICALLY BACKED nutritional data and health benefits. 
        Do not hallucinate. If data is unknown, return 'N/A'. 
        Do not return generic text like "rich in vitamins". Be specific.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: profileSchema,
          temperature: 0.2 // Low temperature for factual accuracy
        }
      });

      const text = response.text || "{}";
      const data = JSON.parse(text);

      // 4. Cache and Return
      localStorage.setItem(cacheKey, JSON.stringify(data));
      return data;

    } catch (error) {
      console.error("Health Profile Generation Failed:", error);
      return null; // Fail gracefully
    }
  }
};
