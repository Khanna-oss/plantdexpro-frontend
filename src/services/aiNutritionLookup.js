import { GoogleGenAI, Type } from "@google/genai";

const CACHE_PREFIX = 'plantdex_nutrition_';
const TTL = 24 * 60 * 60 * 1000; // 24 hours

export const aiNutritionLookup = {
  fetchNutrition: async (plantName, scientificName, tags = []) => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY || (!plantName && !scientificName)) return null;

    const lookupKey = scientificName || plantName;
    const cacheKey = `${CACHE_PREFIX}${lookupKey.toLowerCase().replace(/\W/g, '_')}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < TTL) return data;
      }
    } catch (e) {
      console.warn("Cache read error:", e);
    }

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
            },
            required: ["label", "desc"]
          }
        },
        confidence: { type: Type.NUMBER }
      },
      required: ["nutrients", "healthHints", "confidence"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide grounded botanical nutrition data for: ${scientificName} (${plantName}).
        IMPORTANT: DO NOT use filler phrases like "Analyzing", "Calculating", or "Determining". 
        If specific data is not available from verified sources, return a confidence score below 60.
        Visual Features for reference: ${tags.join(', ')}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const result = JSON.parse(response.text);

      if (result && result.confidence >= 60 && result.nutrients) {
        // Robust check to ensure no "Analyzing..." text survived the prompt
        const filler = ['analyzing', 'calculating', 'placeholder', 'searching', 'determining'];
        const isFiller = (s) => s && typeof s === 'string' && filler.some(f => s.toLowerCase().includes(f));
        
        if (isFiller(result.nutrients.vitamins) || isFiller(result.nutrients.minerals)) {
          return null;
        }

        const dataToCache = {
          nutrients: result.nutrients,
          healthHints: result.healthHints || []
        };

        try {
          localStorage.setItem(cacheKey, JSON.stringify({ data: dataToCache, timestamp: Date.now() }));
        } catch (e) {}

        return dataToCache;
      }
      return null;
    } catch (error) {
      console.error("Nutrition Lookup Pipeline Failed:", error);
      return null;
    }
  }
};