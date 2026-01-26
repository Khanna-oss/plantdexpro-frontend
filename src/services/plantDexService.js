import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { videoRecommendationService } from "./videoRecommendationService.js";
import { aiConfidenceService } from "./aiConfidenceService.js";
import { dataWarehouseService } from "./dataWarehouseService.js";
import { recommendationEngine } from "./recommendationEngine.js";
import { healthProfileService } from "./healthProfileService.js";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

const HISTORY_KEY = 'plantdex_history_v2';

export const plantDexService = {
  identifyPlant: async (base64Image) => {
    if (!API_KEY) return { error: "Configuration Error" };

    const plantSchema = {
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
              videoContext: { type: Type.STRING }
            },
            required: ["scientificName", "commonName", "isEdible", "description", "videoContext"]
          }
        }
      },
      required: ["plants"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
              { text: "Identify this plant. Provide botanical details and edibility status." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: plantSchema,
          safetySettings: [{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }]
        },
      });

      const data = JSON.parse(response.text || "{}");
      let plants = data.plants || [];

      if (plants.length > 0) {
        const p = plants[0];
        p.uiConfidence = aiConfidenceService.calculateScore(p.confidenceScore || 0.8, 1.0, 'vision');
        
        if (p.isEdible) {
          const hp = await healthProfileService.getProfile(p.commonName, p.scientificName, true);
          if (hp) {
            p.nutrients = hp.nutrients;
            p.healthHints = hp.healthHints;
            p.benefitChips = hp.benefitChips;
            p.specificUsage = hp.specificUsage;
            p.nutritionConfidence = hp.confidence;
          }
        }

        dataWarehouseService.logIdentificationFact(p, p.uiConfidence);
        p.recommendations = recommendationEngine.getRelatedPlants(p.scientificName || p.commonName);

        plantDexService.saveToHistory({
          name: p.commonName || p.scientificName,
          date: new Date().toLocaleDateString(),
          image: `data:image/jpeg;base64,${base64Image}`,
          isEdible: p.isEdible,
          uiConfidence: p.uiConfidence
        });
      }

      return { plants };
    } catch (error) {
      console.error(error);
      return { error: "AI Processing Error" };
    }
  },

  findSpecificRecipes: async (plantName) => {
    try {
      return await videoRecommendationService.getRecommendedVideos(plantName, 'recipes');
    } catch (e) {
      console.error("Video fetch failed:", e);
      return [];
    }
  },

  getHistory: () => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch (e) { return []; }
  },

  saveToHistory: (item) => {
    try {
      const history = plantDexService.getHistory();
      const filtered = history.filter(h => h.name !== item.name);
      localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...filtered].slice(0, 10)));
    } catch (e) { console.error(e); }
  }
};