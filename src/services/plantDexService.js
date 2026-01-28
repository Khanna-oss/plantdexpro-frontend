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
              funFact: { type: Type.STRING },
              visualFeatures: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    part: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  }
                },
                description: "The specific unique visual features of this individual sample."
              }
            },
            required: ["scientificName", "commonName", "isEdible", "description", "visualFeatures"]
          }
        }
      },
      required: ["plants"]
    };

    try {
      // Use flash-preview for rapid identification, but strict instructions for non-generic data
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ 
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }, 
            { text: "Identify this plant species. Return species-specific morphological characteristics. Be precise. Do not provide generic info." }
          ] 
        }],
        config: { 
          responseMimeType: "application/json", 
          responseSchema: schema,
          safetySettings: [{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }]
        }
      });

      const data = JSON.parse(response.text || "{}");
      if (data.plants?.[0]) {
        const p = data.plants[0];
        
        // Parallel fetch for grounded Truthful Nutrition data
        if (p.isEdible) {
          const healthData = await healthProfileService.getProfile(p.commonName, p.scientificName, true);
          if (healthData) {
            p.nutrients = healthData.nutrients;
            p.healthHints = healthData.healthHints;
            p.edibleParts = healthData.edibleParts;
          }
        }
        
        plantDexService.saveToHistory({
          name: p.commonName || p.scientificName,
          date: new Date().toLocaleDateString(),
          image: `data:image/jpeg;base64,${base64Image}`,
          isEdible: p.isEdible
        });
      }
      return data;
    } catch (e) {
      console.error("ID Engine Critical Error:", e);
      return { error: "Botanical identification logic failed." };
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