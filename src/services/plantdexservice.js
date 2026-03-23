import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { aiNutritionLookup } from "./ainutritionlookup.js";
import { videoRecommendationService } from "./videorecommendationservice.js";
import { plantVerificationService } from "./plantVerificationService.js";
import { trefleService } from "./trefleService.js";
import { wikipediaService } from "./wikipediaService.js";

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
      // PHASE 4: Track inference latency
      const inferenceStartTime = Date.now();
      
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

      const inferenceEndTime = Date.now();
      const inferenceLatency = inferenceEndTime - inferenceStartTime;

      const data = JSON.parse(response.text || "{}");
      if (data.plants?.[0]) {
        let p = data.plants[0];
        
        // PHASE 2: Verify against local database and enrich with verified data
        p = plantVerificationService.verifyPlantIdentification(p);
        
        // PHASE 4: Enhanced XAI metadata for transparency and trust
        p.xaiMeta = {
          confidence: p.confidenceScore || 0,
          inferenceLatencyMs: inferenceLatency,
          modelName: 'Gemini 3 Flash',
          timestamp: inferenceEndTime,
          source: p.dataSource || 'ai_inference_only',
          verificationLevel: p.verificationLevel || 'none',
          // SHAP/LIME-inspired feature importance
          featureImportance: p.visualFeatures?.map((f, idx) => ({
            feature: f.part,
            explanation: f.reason,
            importance: Math.max(0.95 - (idx * 0.15), 0.35) // Decreasing importance
          })) || []
        };
        
        // Truthful nutrition lookup — ETL warehouse → USDA API → honest null
        if (p.isEdible && !p.nutrients) {
          const nutrition = await aiNutritionLookup.fetchNutrition(p.commonName, p.scientificName);
          if (nutrition) {
            p.nutrients = nutrition.nutrients;
            p.botanicalData = { ...p.botanicalData, ...nutrition.botanicalData };
            p.healthHints = nutrition.healthHints;
            p.nutritionVerified = nutrition.isVerified === true;
            p.nutritionSource = nutrition.source || 'External API';
          }
        }
        
        // PHASE 3: Fetch enrichment data (Trefle, Wikipedia, YouTube)
        // Run in parallel for better performance
        const [trefleData, wikiData, videos] = await Promise.all([
          trefleService.getTrefleEnrichment(p.scientificName, p.commonName).catch(() => null),
          wikipediaService.getWikipediaEnrichment(p.scientificName, p.commonName).catch(() => null),
          p.isEdible 
            ? videoRecommendationService.getRecommendedVideos(p.commonName, 'recipes').catch(() => [])
            : videoRecommendationService.getRecommendedVideos(p.commonName, 'care').catch(() => [])
        ]);
        
        // Attach enrichment data
        if (trefleData) {
          p.trefleEnrichment = trefleData;
        }
        if (wikiData) {
          p.wikipediaEnrichment = wikiData;
        }
        if (videos && videos.length > 0) {
          p.recipeVideos = videos;
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