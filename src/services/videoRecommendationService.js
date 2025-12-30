
import { GoogleGenAI } from "@google/genai";
import { youtubeCacheService } from "./youtubeCacheService.js";
import { validateVideoRecommendations } from "../utils/validateVideoRecommendations.js";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const videoRecommendationService = {
  /**
   * Finds recommended videos for a plant using Google Search Grounding.
   */
  getRecommendedVideos: async (plantName, context = 'recipes') => {
    const cacheKey = youtubeCacheService.generateKey(plantName, context);
    
    // 1. Check Cache
    const cachedVideos = youtubeCacheService.get(cacheKey);
    if (cachedVideos) {
        const validCached = validateVideoRecommendations(cachedVideos);
        if (validCached.length > 0) return validCached;
    }

    if (!API_KEY) return [];

    try {
      let prompt = "";
      if (context === 'recipes') {
        prompt = `Find 3 real YouTube videos for "${plantName}" recipes. 
        Return ONLY a JSON array in this exact format: [{"title": "string", "channel": "string", "link": "https://youtube.com/watch?v=...", "reason": "string"}].`;
      } else {
        prompt = `Find 3 real YouTube videos about "${plantName}" care and benefits. 
        Return ONLY a JSON array in this exact format: [{"title": "string", "channel": "string", "link": "https://youtube.com/watch?v=...", "reason": "string"}].`;
      }

      // 2. Call Gemini 3 Pro (Required for Search Grounding + Complex Reasoning)
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text || "";
      let videos = [];
      
      try {
          // Robust JSON Extraction (WP-U3 AJAX Logic)
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
              videos = JSON.parse(jsonMatch[0]);
          }
      } catch (e) {
          console.warn("Manual JSON parse fallback triggered", e);
      }

      // 3. Filter & Validate
      const validVideos = validateVideoRecommendations(videos).slice(0, 3);

      // 4. Cache Result
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
