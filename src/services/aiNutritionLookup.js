import { GoogleGenAI, Type } from "@google/genai";

const CACHE_PREFIX = 'plantdex_nutrition_';
const TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Service to fetch grounded nutrition data using Gemini.
 * Implements 24h caching, structural validation, and confidence thresholding.
 */
export const aiNutritionLookup = {
  fetchNutrition: async (plantName, scientificName, tags = []) => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY || (!plantName && !scientificName)) return null;

    const lookupKey = scientificName || plantName;
    const cacheKey = `${CACHE_PREFIX}${lookupKey.toLowerCase().replace(/\W/g, '_')}`;

    // 1. Caching Layer (localStorage)
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < TTL) {
          console.debug(`[NutritionCache] Hit for ${lookupKey}`);
          return data;
        }
      }
    } catch (e) {
      console.warn("Cache read error:", e);
    }

    // 2. ML/LLM Pipeline
    // Initialize right before call to ensure fresh API key
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const schema = {
      type: Type.OBJECT,
      properties: {
        nutrients: {
          type: Type.OBJECT,
          properties: {
            vitamins: { type: Type.STRING, description: "Specific vitamins found (e.g., A, C, K)." },
            minerals: { type: Type.STRING, description: "Predominant minerals." },
            proteins: { type: Type.STRING, description: "Protein density or amino acid profile." },
            calories: { type: Type.STRING, description: "Estimated caloric density per 100g." }
          },
          required: ["vitamins", "minerals", "proteins", "calories"]
        },
        healthHints: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, description: "Short benefit name." },
              desc: { type: Type.STRING, description: "Brief scientific explanation." }
            },
            required: ["label", "desc"]
          }
        },
        confidence: { 
          type: Type.NUMBER, 
          description: "Numerical confidence score (0-100) based on data availability." 
        }
      },
      required: ["nutrients", "healthHints", "confidence"]
    };

    try {
      // Use gemini-3-flash-preview for fast but accurate lookup
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide safety-verified botanical nutrition data for: ${scientificName} (${plantName}). 
        Visual Context: ${tags.join(', ')}. 
        You must return accurate, grounded data. If data is unknown, set confidence low.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const result = JSON.parse(response.text);

      // 3. Validation & Confidence Check (>= 60%)
      if (result && result.confidence >= 60 && result.nutrients) {
        const dataToCache = {
          nutrients: result.nutrients,
          healthHints: result.healthHints || []
        };

        // 4. Update Cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: dataToCache,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn("Cache write failed:", e);
        }

        return dataToCache;
      }

      console.warn(`[NutritionLookup] Confidence ${result?.confidence}% below threshold for ${lookupKey}`);
      return null;
    } catch (error) {
      console.error("Nutrition Lookup Pipeline Failed:", error);
      return null;
    }
  }
};