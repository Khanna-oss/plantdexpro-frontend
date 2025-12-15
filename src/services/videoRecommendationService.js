
import { GoogleGenAI } from "@google/genai";
import { youtubeCacheService } from "./youtubeCacheService";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const videoRecommendationService = {
  /**
   * Finds recommended videos for a plant.
   * Uses caching and AI-based search.
   */
  getRecommendedVideos: async (plantName, context = 'recipes') => {
    const cacheKey = youtubeCacheService.generateKey(plantName, context);
    
    // 1. Check Cache
    const cachedVideos = youtubeCacheService.get(cacheKey);
    if (cachedVideos) return cachedVideos;

    if (!API_KEY) return [];

    try {
      // 2. Construct Query based on context
      // context is usually 'recipes' (edible) or 'care' (non-edible)
      let prompt = "";
      if (context === 'recipes') {
        prompt = `Find 3 high-quality YouTube cooking videos or recipes specifically for "${plantName}". 
        Prefer videos with high view counts or reputable chefs. 
        Return JSON list: [{title, channel, link, duration}].`;
      } else {
        prompt = `Find 3 high-quality YouTube videos about "${plantName}" care, propagation, or medicinal uses.
        Return JSON list: [{title, channel, link, duration}].`;
      }

      // 3. Call AI with Search Tool
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "[]";
      let videos = [];
      
      try {
          // Parse potential array
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
              videos = JSON.parse(jsonMatch[0]);
          }
      } catch (e) {
          console.warn("Video JSON parse error", e);
      }

      // 4. Filter & Validate
      const validVideos = videos
        .filter(v => v.link && v.link.includes('youtube.com/watch'))
        .slice(0, 3); // Max 3

      // 5. Cache Result (if we found videos)
      if (validVideos.length > 0) {
        youtubeCacheService.set(cacheKey, validVideos);
      }

      return validVideos;

    } catch (error) {
      console.error("Video Recommendation Failed:", error);
      return [];
    }
  }
};
