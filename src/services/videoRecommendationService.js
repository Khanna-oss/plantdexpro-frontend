
import { GoogleGenAI } from "@google/genai";
import { youtubeCacheService } from "./youtubeCacheService.js";
import { validateVideoRecommendations } from "../utils/validateVideoRecommendations.js";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const videoRecommendationService = {
  getRecommendedVideos: async (plantName, context = 'recipes') => {
    const cacheKey = youtubeCacheService.generateKey(plantName, context);
    
    const cachedVideos = youtubeCacheService.get(cacheKey);
    if (cachedVideos) {
        const validCached = validateVideoRecommendations(cachedVideos);
        if (validCached.length > 0) return validCached;
    }

    if (!API_KEY) return [];

    try {
      let prompt = `Find 3 YouTube videos for "${plantName}" ${context}. 
      Return ONLY a JSON array: [{"title": "string", "channel": "string", "link": "https://youtube.com/watch?v=...", "reason": "string"}].`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text || "";
      let videos = [];
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
          try {
              videos = JSON.parse(jsonMatch[0]);
          } catch (e) { console.error("JSON parse error", e); }
      }

      const validVideos = validateVideoRecommendations(videos).slice(0, 3);

      if (validVideos.length > 0) {
        youtubeCacheService.set(cacheKey, validVideos);
      }

      return validVideos;

    } catch (error) {
      console.error("Video Search Failed:", error);
      return [];
    }
  }
};
