import { GoogleGenAI, Type } from "@google/genai";
import { etlNutritionService } from "./etlNutritionService.js";

const CACHE_PREFIX = 'plantdex_nutrition_v2_';
const TTL = 24 * 60 * 60 * 1000;

export const aiNutritionLookup = {
  fetchNutrition: async (plantName, scientificName, tags = []) => {
    const API_KEY = process.env.API_KEY;
    
    // 1. ETL PRIMARY CHECK (Authoritative Data Warehouse)
    const etlResult = etlNutritionService.lookup(scientificName || plantName);
    if (etlResult) return etlResult;

    if (!API_KEY) return null;

    const lookupKey = scientificName || plantName;
    const cacheKey = `${CACHE_PREFIX}${lookupKey.toLowerCase().replace(/\W/g, '_')}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < TTL) return data;
      }
    } catch (e) {}

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const schema = {
      type: Type.OBJECT,
      properties: {
        nutrients: {
          type: Type.OBJECT,
          properties: {
            vitamins: { type: Type.STRING },
            minerals: { type: Type.STRING },
            proteins: { type: Type.STRING },
            calories: { type: Type.STRING }
          },
          required: ["vitamins", "minerals", "proteins", "calories"]
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
        confidence: { type: Type.NUMBER }
      },
      required: ["nutrients", "healthHints", "confidence"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Research the nutritional profile of ${scientificName} (${plantName}). 
        Avoid all generic placeholders. Provide only verified botanical data. 
        If specific values are unknown, state "Unknown concentration".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const result = JSON.parse(response.text);

      // Validation logic: Ensure AI isn't hallucinating filler text
      const invalidPhrases = ['analyzing', 'calculating', 'determining', 'fetching'];
      const vitaminsStr = (result.nutrients?.vitamins || "").toLowerCase();
      
      if (invalidPhrases.some(p => vitaminsStr.includes(p)) || result.confidence < 60) {
        return null; 
      }

      const dataToCache = {
        nutrients: result.nutrients,
        healthHints: result.healthHints || [],
        isVerified: false,
        source: "AI Research Inference"
      };

      try {
        localStorage.setItem(cacheKey, JSON.stringify({ data: dataToCache, timestamp: Date.now() }));
      } catch (e) {}

      return dataToCache;
    } catch (error) {
      console.error("AI Nutrition Fallback Failed:", error);
      return null;
    }
  }
};