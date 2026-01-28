import { GoogleGenAI, Type } from "@google/genai";

const CACHE_PREFIX = 'plantdex_nutrition_';
const TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Service to fetch grounded nutrition data using Gemini 3.
 * Implements caching, structural validation, and confidence thresholding.
 */
export const aiNutritionLookup = {
  fetchNutrition: async (plantName, scientificName, tags = []) => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY || (!plantName && !scientificName)) return null;

    const lookupKey = scientificName || plantName;
    const cacheKey = `${CACHE_PREFIX}${lookupKey.toLowerCase().replace(/\W/g, '_')}`;

    // 1. Caching Layer
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
      console.warn("Cache read error", e);
    }

    // 2. ML/LLM Pipeline Initialization
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const schema = {
      type: Type.OBJECT,
      properties: {
        nutrients: {
          type: Type.OBJECT,
          properties: {
            vitamins: { type: Type.STRING, description: "Comma separated list of specific vitamins." },
            minerals: { type: Type.STRING, description: "Specific minerals present in high concentrations." },
            proteins: { type: Type.STRING, description: "Protein content or amino acid profile details." },
            calories: { type: Type.STRING, description: "Estimated caloric density per 100g." }
          },
          required: ["vitamins", "minerals", "proteins"]
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
        confidence: { 
          type: Type.NUMBER, 
          description: "Numerical confidence score (0-100) based on source reliability." 
        }
      },
      required: ["nutrients", "healthHints", "confidence"]
    };

    try {
      // 3. Grounded Generation Call
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide verified nutrition data for the plant: ${scientificName} (Commonly: ${plantName}). 
        Context Tags: ${tags.join(', ')}. 
        Focus on safety-first data. Use grounded botanical databases.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          thinkingConfig: { thinkingBudget: 0 } // Flash response for rapid lookup
        }
      });

      const result = JSON.parse(response.text);

      // 4. Validation & Confidence Threshold (>= 60%)
      if (result && result.confidence >= 60 && result.nutrients) {
        const dataToCache = {
          nutrients: result.nutrients,
          healthHints: result.healthHints || []
        };

        // 5. Success - Update Cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: dataToCache,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn("Local storage quota exceeded, skipping cache write.");
        }

        return dataToCache;
      }

      console.warn(`[NutritionLookup] Confidence too low (${result?.confidence}%) for ${lookupKey}`);
      return null;
    } catch (error) {
      // 6. Graceful Failure Handling
      if (error.message?.includes('429')) {
        console.error("Rate limit reached for nutrition lookup. Failing silently.");
      } else {
        console.error("Critical error in Nutrition AI Pipeline:", error);
      }
      return null;
    }
  }
};