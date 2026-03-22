import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { aiNutritionLookup } from "./ainutritionlookup.js";
import { videoRecommendationService } from "./videorecommendationservice.js";
import { plantVerificationService } from "./plantVerificationService.js";

export const plantDexService = {
  identifyPlant: async (base64Image) => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) return { error: "Missing Gemini API Key. Please configure VITE_GEMINI_API_KEY in .env file." };
    
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
                }
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
            { text: "Identify this plant species from the image. Provide botanical details and morphological features." }
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
        let p = data.plants[0];
        
        // PHASE 2: Verify against local database and enrich with verified data
        p = plantVerificationService.verifyPlantIdentification(p);
        
        // Add XAI metadata for transparency
        p.xaiMeta = {
          confidence: p.confidenceScore || 0,
          latency: Date.now(),
          source: p.dataSource || 'ai_inference_only',
          verificationLevel: p.verificationLevel || 'none'
        };
        
        // Trigger enriched nutrition data for edible species (if not already from verified DB)
        if (p.isEdible && !p.nutrients) {
          const tags = p.visualFeatures?.map(f => f.reason) || [];
          const nutrition = await aiNutritionLookup.fetchNutrition(p.commonName, p.scientificName, tags);
          if (nutrition) {
            p.nutrients = nutrition.nutrients;
            p.botanicalData = { ...p.botanicalData, ...nutrition.botanicalData };
            p.healthHints = nutrition.healthHints;
          }
        }
        
        // Save to history with verification metadata
        plantDexService.saveToHistory({
          name: p.commonName || p.scientificName,
          scientificName: p.scientificName,
          date: new Date().toLocaleDateString(),
          image: `data:image/jpeg;base64,${base64Image}`,
          isEdible: p.isEdible,
          confidence: p.confidenceScore || 0,
          verified: p.verificationStatus === 'verified',
          dataSource: p.dataSource
        });
        
        data.plants[0] = p;
      }
      return data;
    } catch (e) {
      console.error("Identification logic failed:", e);
      return { error: "Botanical identification failed. Please check your image clarity." };
    }
  },

  // Delegate to plantVerificationService
  checkVerificationStatus: (scientificName, commonName) => {
    return plantVerificationService.checkVerificationStatus(scientificName, commonName);
  },

  getVerificationStats: () => {
    return plantVerificationService.getVerificationStats();
  },

  getVerifiedPlants: () => {
    return plantVerificationService.getVerifiedPlants();
  },

  findSpecificRecipes: async (query) => {
    return await videoRecommendationService.getRecommendedVideos(query, 'recipes');
  },

  getHistory: () => JSON.parse(localStorage.getItem('plant_hist_v1') || '[]'),
  saveToHistory: (item) => {
    const hist = plantDexService.getHistory();
    const updated = [item, ...hist].filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
    localStorage.setItem('plant_hist_v1', JSON.stringify(updated.slice(0, 10)));
  }
};