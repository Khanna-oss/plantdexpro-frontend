import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { healthProfileService } from "./healthProfileService.js";
import { videoRecommendationService } from "./videoRecommendationService.js";

const API_KEY = process.env.API_KEY || '';

export const plantDexService = {
  identifyPlant: async (base64Image) => {
    if (!API_KEY) return { error: "Missing API Key. Check environment variables." };
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
                description: "List the visual features used for identification (Explainable AI)."
              }
            },
            required: ["scientificName", "commonName", "isEdible", "description", "visualFeatures"]
          }
        }
      },
      required: ["plants"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ 
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }, 
            { text: "Identify this plant species. For Academic XAI purpose: specify exactly which morphological features (leaf, stem, flower) you used to make this decision." }
          ] 
        }],
        config: { 
          responseMimeType: "application/json", 
          responseSchema: schema,
          safetySettings: [{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }]
        }
      });

      const data = JSON.parse(response.text || "{}");
      if (data.plants && data.plants.length > 0) {
        const p = data.plants[0];
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
      console.error("PlantDex Identification Error:", e);
      return { error: "AI Engine error during botanical analysis." };
    }
  },

  findSpecificRecipes: async (query) => {
    return await videoRecommendationService.getRecommendedVideos(query, 'recipes');
  },

  getHistory: () => {
    try {
      return JSON.parse(localStorage.getItem('plant_hist_v1') || '[]');
    } catch (e) { return []; }
  },

  saveToHistory: (item) => {
    try {
      const hist = plantDexService.getHistory();
      const filtered = hist.filter(h => h.name !== item.name);
      localStorage.setItem('plant_hist_v1', JSON.stringify([item, ...filtered].slice(0, 10)));
    } catch (e) { console.error("History Save Error:", e); }
  }
};