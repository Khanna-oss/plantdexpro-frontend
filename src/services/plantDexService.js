import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { healthProfileService } from "./healthProfileService.js";
import { videoRecommendationService } from "./videoRecommendationService.js";

const API_KEY = process.env.API_KEY || '';

export const plantDexService = {
  identifyPlant: async (base64Image) => {
    if (!API_KEY) return { error: "Missing API Key" };
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const schema = {
      type: Type.OBJECT,
      properties: {
        plants: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              scientificName: { type: Type.STRING },
              commonName: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              isEdible: { type: Type.BOOLEAN },
              description: { type: Type.STRING },
              funFact: { type: Type.STRING }
            },
            required: ["scientificName", "commonName", "isEdible", "description"]
          }
        }
      },
      required: ["plants"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Image } }, { text: "Identify this plant." }] }],
        config: { responseMimeType: "application/json", responseSchema: schema }
      });

      const data = JSON.parse(response.text || "{}");
      if (data.plants?.[0]) {
        const p = data.plants[0];
        if (p.isEdible) {
          const healthData = await healthProfileService.getProfile(p.commonName, p.scientificName, true);
          if (healthData) {
            p.nutrients = healthData.nutrients;
            p.healthHints = healthData.healthHints;
          }
        }
      }
      return data;
    } catch (e) {
      return { error: "AI Error: " + e.message };
    }
  },

  findSpecificRecipes: async (query) => {
    return await videoRecommendationService.getRecommendedVideos(query, 'recipes');
  },

  getHistory: () => JSON.parse(localStorage.getItem('plant_hist_v1') || '[]'),
  saveToHistory: (item) => {
    const hist = plantDexService.getHistory();
    localStorage.setItem('plant_hist_v1', JSON.stringify([item, ...hist].slice(0, 10)));
  }
};