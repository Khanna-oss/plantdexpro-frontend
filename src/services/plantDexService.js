
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { healthProfileService } from "./healthProfileService";
import { videoRecommendationService } from "./videoRecommendationService";
import { aiConfidenceService } from "./aiConfidenceService";
import { classificationEnsemble } from "./classificationEnsemble";
import { dataWarehouseService } from "./dataWarehouseService";
import { recommendationEngine } from "./recommendationEngine";

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
              { text: "Identify this plant. Provide multiple interpretation candidates if ambiguous." }
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
        
        // DW-U4 ensemble check: Calibrate model confidence (0-100)
        p.uiConfidence = aiConfidenceService.calculateScore(p.confidenceScore || 0.8, 1.0, 'vision');

        // DW-U1 Warehouse: Log the identification event as a 'Fact'
        dataWarehouseService.logIdentificationFact(p, p.uiConfidence);

        // DW-U3 Association: Attach recommendations
        p.recommendations = recommendationEngine.getRelatedPlants(p.scientificName || p.commonName);

        if (p.isEdible && p.scientificName) {
           const richProfile = await healthProfileService.getProfile(p.commonName, p.scientificName, true);
           if (richProfile) {
             p.nutrients = richProfile.nutrients;
             p.healthHints = richProfile.healthHints;
             p.specificUsage = richProfile.specificUsage;
             p.nutritionConfidence = richProfile.confidence;
           }
        }

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
      return { error: "AI Processing Error" };
    }
  },

  /**
   * Restoration of missing method to fix the PC.findSpecificRecipes TypeError
   */
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
